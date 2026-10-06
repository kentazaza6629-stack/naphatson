import React, { useState, useEffect, useRef } from 'react';
import { GAME_MISSIONS, STANDARD_BLOCKS } from '../data/gameMissions';
import { CodeBlock, GameMission } from '../types';
import { sound } from '../utils/audio';
import { speech } from '../utils/speech';
import { RoboMascot } from './RoboMascot';
import {
  Play,
  Square,
  RotateCcw,
  StepForward,
  Trash2,
  HelpCircle,
  Award,
  ChevronRight,
  Sparkles,
  Bug,
  Volume2,
  Users,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GameViewProps {
  onEarnStar: () => void;
  onOpenCertificate: () => void;
}

export const GameView: React.FC<GameViewProps> = ({ onEarnStar, onOpenCertificate }) => {
  const [currentLevelIdx, setCurrentLevelIdx] = useState<number>(0);
  const currentMission: GameMission = GAME_MISSIONS[currentLevelIdx];

  // Workspace code blocks (can have root blocks, and children inside forever loop)
  const [workspaceBlocks, setWorkspaceBlocks] = useState<CodeBlock[]>(() => {
    if (currentMission.buggyCode) {
      return JSON.parse(JSON.stringify(currentMission.buggyCode));
    }
    return [
      { ...STANDARD_BLOCKS[0], id: `init-flag-${Date.now()}` }, // flag
    ];
  });

  // Simulator Runtime State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [robotPos, setRobotPos] = useState(currentMission.startPos);
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);
  const [isJumping, setIsJumping] = useState<boolean>(false);
  const [isClapping, setIsClapping] = useState<boolean>(false);
  const [starsCollected, setStarsCollected] = useState<{ x: number; y: number }[]>([]);
  const [loopCount, setLoopCount] = useState<number>(0);
  const [missionComplete, setMissionComplete] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showPeerTip, setShowPeerTip] = useState<boolean>(false);

  // Runtime timer reference
  const runTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset when level changes
  useEffect(() => {
    stopRun();
    setRobotPos(currentMission.startPos);
    setStarsCollected([]);
    setLoopCount(0);
    setMissionComplete(false);
    setSpeechBubble(null);
    setShowHint(false);
    setShowPeerTip(false);

    if (currentMission.buggyCode) {
      setWorkspaceBlocks(JSON.parse(JSON.stringify(currentMission.buggyCode)));
    } else if (currentMission.initialBlocks) {
      setWorkspaceBlocks(JSON.parse(JSON.stringify(currentMission.initialBlocks)));
    } else {
      setWorkspaceBlocks([{ ...STANDARD_BLOCKS[0], id: `flag-${Date.now()}` }]);
    }
  }, [currentLevelIdx]);

  // Add block to workspace
  const handleAddBlock = (block: CodeBlock, targetParentId?: string) => {
    sound.playBlockSnap();
    const newBlock: CodeBlock = {
      ...block,
      id: `${block.id}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      children: block.hasChildren ? [] : undefined,
    };

    if (targetParentId) {
      // Add inside loop block
      setWorkspaceBlocks((prev) =>
        prev.map((b) => {
          if (b.id === targetParentId) {
            return {
              ...b,
              children: [...(b.children || []), newBlock],
            };
          }
          return b;
        })
      );
    } else {
      // Add to root workspace
      setWorkspaceBlocks((prev) => [...prev, newBlock]);
    }
  };

  // Remove block from workspace
  const handleRemoveBlock = (blockId: string) => {
    sound.playClick();
    setWorkspaceBlocks((prev) => {
      // Check if it's root block
      const filtered = prev.filter((b) => b.id !== blockId);
      if (filtered.length !== prev.length) return filtered;

      // Check if inside children
      return prev.map((b) => {
        if (b.children) {
          return {
            ...b,
            children: b.children.filter((c) => c.id !== blockId),
          };
        }
        return b;
      });
    });
  };

  // Clear workspace
  const handleClearWorkspace = () => {
    sound.playClick();
    setWorkspaceBlocks([{ ...STANDARD_BLOCKS[0], id: `flag-${Date.now()}` }]);
  };

  // Stop running
  const stopRun = () => {
    if (runTimerRef.current) {
      clearInterval(runTimerRef.current);
      runTimerRef.current = null;
    }
    setIsRunning(false);
    setActiveBlockId(null);
    setIsJumping(false);
    setIsClapping(false);
  };

  // Reset stage
  const handleResetStage = () => {
    sound.playClick();
    stopRun();
    setRobotPos(currentMission.startPos);
    setStarsCollected([]);
    setLoopCount(0);
    setSpeechBubble(null);
  };

  // Flatten instructions into an executable sequence (or loop sequence)
  const compileSequence = (): { id: string; type: string }[] => {
    const sequence: { id: string; type: string }[] = [];

    // Find flag
    const hasFlag = workspaceBlocks.some((b) => b.type === 'event_flag');
    if (!hasFlag) return [];

    workspaceBlocks.forEach((b) => {
      if (b.type === 'event_flag') return;

      if (b.type === 'control_forever' && b.children && b.children.length > 0) {
        // Repeat loop children multiple times for simulation
        const times = 12; // simulated forever
        for (let t = 0; t < times; t++) {
          b.children.forEach((child) => {
            sequence.push({ id: child.id, type: child.type });
          });
        }
      } else if (b.type === 'control_repeat' && b.children && b.children.length > 0) {
        const times = (b.param as number) || 4;
        for (let t = 0; t < times; t++) {
          b.children.forEach((child) => {
            sequence.push({ id: child.id, type: child.type });
          });
        }
      } else {
        sequence.push({ id: b.id, type: b.type });
      }
    });

    return sequence;
  };

  // Run Program
  const handleRunProgram = () => {
    sound.playClick();
    stopRun();
    handleResetStage();

    const sequence = compileSequence();
    if (sequence.length === 0) {
      sound.playError();
      speech.speak('อย่าลืมวางบล็อกคำสั่งเมื่อคลิกธงเขียวก่อนนะจ๊ะ');
      return;
    }

    setIsRunning(true);
    let stepIndex = 0;
    let curPos = { ...currentMission.startPos };
    const collected: { x: number; y: number }[] = [];
    let loops = 0;

    runTimerRef.current = setInterval(() => {
      if (stepIndex >= sequence.length) {
        stopRun();
        checkVictory(collected, loops);
        return;
      }

      const step = sequence[stepIndex];
      setActiveBlockId(step.id);

      // Execute step
      if (step.type === 'motion_move') {
        sound.playMove();
        let nextX = curPos.x;
        let nextY = curPos.y;

        if (curPos.dir === 'right') nextX += 1;
        else if (curPos.dir === 'down') nextY += 1;
        else if (curPos.dir === 'left') nextX -= 1;
        else if (curPos.dir === 'up') nextY -= 1;

        // Bounds check
        if (
          nextX >= 0 &&
          nextX < currentMission.gridSize.width &&
          nextY >= 0 &&
          nextY < currentMission.gridSize.height
        ) {
          // Check obstacles
          const hitObstacle = currentMission.obstacles?.some((o) => o.x === nextX && o.y === nextY);
          if (hitObstacle) {
            sound.playError();
            setSpeechBubble('โอ๊ะ! ชนสิ่งกีดขวางแล้ว ต้องแก้บล็อกนะ!');
            stopRun();
            return;
          }

          curPos = { ...curPos, x: nextX, y: nextY };
          setRobotPos(curPos);

          // Star collection check
          const starAt = currentMission.targetPos.find((t) => t.x === nextX && t.y === nextY);
          if (starAt && !collected.some((c) => c.x === nextX && c.y === nextY)) {
            collected.push({ x: nextX, y: nextY });
            setStarsCollected([...collected]);
            sound.playStarCollect();
          }
        }
      } else if (step.type === 'motion_turn_right') {
        sound.playMove();
        const nextDir: Record<string, 'right' | 'down' | 'left' | 'up'> = {
          right: 'down',
          down: 'left',
          left: 'up',
          up: 'right',
        };
        curPos = { ...curPos, dir: nextDir[curPos.dir] };
        setRobotPos(curPos);
      } else if (step.type === 'motion_turn_left') {
        sound.playMove();
        const nextDir: Record<string, 'right' | 'down' | 'left' | 'up'> = {
          right: 'up',
          up: 'left',
          left: 'down',
          down: 'right',
        };
        curPos = { ...curPos, dir: nextDir[curPos.dir] };
        setRobotPos(curPos);
      } else if (step.type === 'action_jump') {
        sound.playBlockSnap();
        setIsJumping(true);
        setTimeout(() => setIsJumping(false), 300);
      } else if (step.type === 'action_clap') {
        sound.playClick();
        setIsClapping(true);
        setTimeout(() => setIsClapping(false), 300);
      } else if (step.type === 'action_say') {
        sound.playSuccess();
        setSpeechBubble('สวัสดีครับเพื่อนๆ ป.3!');
        setTimeout(() => setSpeechBubble(null), 1500);
      }

      // Check loop return to start
      if (
        curPos.x === currentMission.startPos.x &&
        curPos.y === currentMission.startPos.y &&
        stepIndex > 2
      ) {
        loops++;
        setLoopCount(loops);
      }

      stepIndex++;

      // Check immediate win for loops or targets
      if (currentMission.mode === 'loop' && loops >= (currentMission.minLoops || 2)) {
        stopRun();
        checkVictory(collected, loops);
      } else if (
        currentMission.mode === 'path' &&
        collected.length === currentMission.targetPos.length
      ) {
        stopRun();
        checkVictory(collected, loops);
      }
    }, 450);
  };

  // Check victory condition
  const checkVictory = (collected: { x: number; y: number }[], loops: number) => {
    let win = false;

    if (currentMission.mode === 'path') {
      win = collected.length >= currentMission.targetPos.length;
    } else if (currentMission.mode === 'loop') {
      const hasForever = workspaceBlocks.some((b) => b.type === 'control_forever');
      win = hasForever && (loops >= (currentMission.minLoops || 1) || collected.length >= currentMission.targetPos.length);
    } else if (currentMission.mode === 'debug') {
      // In debug mode, must avoid bugs and collect targets
      win = collected.length >= currentMission.targetPos.length;
    } else if (currentMission.mode === 'free') {
      win = true;
    }

    if (win) {
      setMissionComplete(true);
      sound.playCheerFanfare();
      onEarnStar();
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.5 },
      });
    } else {
      sound.playError();
      setSpeechBubble('เอ๊ะ ยังไม่ตรงกับโจทย์ ลองตรวจดูบล็อกอีกทีนะ!');
    }
  };

  // Find forever loop block in workspace to allow nested adding
  const foreverBlock = workspaceBlocks.find((b) => b.type === 'control_forever' || b.type === 'control_repeat');

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Level Selector & Banner */}
      <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 rounded-3xl p-5 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold bg-white/20 px-3 py-0.5 rounded-full">
              🎮 เกมการสอนบล็อกโค้ดดิ้ง ป.3
            </span>
            <span className="text-xs font-bold bg-slate-900/30 px-3 py-0.5 rounded-full">
              โหมด: {currentMission.mode.toUpperCase()}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black">{currentMission.title}</h2>
          <p className="text-xs md:text-sm text-amber-100 mt-1 max-w-xl font-medium">
            {currentMission.description}
          </p>
        </div>

        {/* Level Buttons 1-5 */}
        <div className="flex items-center gap-1.5 bg-black/20 p-1.5 rounded-2xl">
          {GAME_MISSIONS.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => {
                sound.playClick();
                setCurrentLevelIdx(idx);
              }}
              className={`w-9 h-9 rounded-xl font-black text-sm transition-all flex items-center justify-center ${
                currentLevelIdx === idx
                  ? 'bg-white text-orange-600 shadow-md scale-105'
                  : 'bg-white/20 text-white hover:bg-white/40'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Main Game Interface: 3-column Scratch layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Blocks Palette (Toolbox) - 3 cols */}
        <div className="lg:col-span-3 bg-white rounded-3xl border-3 border-amber-300 p-4 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b-2 border-slate-100 pb-2">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
              <span>🧩</span>
              <span>คลังบล็อกคำสั่ง</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-bold">คลิกเพื่อใส่</span>
          </div>

          <div className="space-y-2">
            {/* Event Category */}
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold text-amber-700 uppercase tracking-wider block">
                🚩 เหตุการณ์ (Events)
              </span>
              <button
                onClick={() => handleAddBlock(STANDARD_BLOCKS[0])}
                className={`w-full text-left p-2.5 rounded-xl font-bold text-xs shadow-xs transition-transform active:scale-95 ${STANDARD_BLOCKS[0].color}`}
              >
                {STANDARD_BLOCKS[0].label}
              </button>
            </div>

            {/* Control Category */}
            <div className="space-y-1 pt-2">
              <span className="text-[11px] font-extrabold text-orange-700 uppercase tracking-wider block">
                🔄 ควบคุมการวนซ้ำ (Loops)
              </span>
              <button
                onClick={() => handleAddBlock(STANDARD_BLOCKS[1])}
                className={`w-full text-left p-2.5 rounded-xl font-bold text-xs shadow-xs transition-transform active:scale-95 ${STANDARD_BLOCKS[1].color}`}
              >
                {STANDARD_BLOCKS[1].label}
              </button>
              <button
                onClick={() => handleAddBlock(STANDARD_BLOCKS[2])}
                className={`w-full text-left p-2.5 rounded-xl font-bold text-xs shadow-xs transition-transform active:scale-95 ${STANDARD_BLOCKS[2].color}`}
              >
                {STANDARD_BLOCKS[2].label}
              </button>
            </div>

            {/* Motion Category */}
            <div className="space-y-1 pt-2">
              <span className="text-[11px] font-extrabold text-sky-700 uppercase tracking-wider block">
                ➡️ การเคลื่อนที่ (Motion)
              </span>
              <button
                onClick={() => handleAddBlock(STANDARD_BLOCKS[3], foreverBlock?.id)}
                className={`w-full text-left p-2.5 rounded-xl font-bold text-xs shadow-xs transition-transform active:scale-95 ${STANDARD_BLOCKS[3].color}`}
              >
                {STANDARD_BLOCKS[3].label}
              </button>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleAddBlock(STANDARD_BLOCKS[4], foreverBlock?.id)}
                  className={`text-left p-2 rounded-xl font-bold text-xs shadow-xs transition-transform active:scale-95 ${STANDARD_BLOCKS[4].color}`}
                >
                  {STANDARD_BLOCKS[4].label}
                </button>
                <button
                  onClick={() => handleAddBlock(STANDARD_BLOCKS[5], foreverBlock?.id)}
                  className={`text-left p-2 rounded-xl font-bold text-xs shadow-xs transition-transform active:scale-95 ${STANDARD_BLOCKS[5].color}`}
                >
                  {STANDARD_BLOCKS[5].label}
                </button>
              </div>
            </div>

            {/* Action Category */}
            <div className="space-y-1 pt-2">
              <span className="text-[11px] font-extrabold text-purple-700 uppercase tracking-wider block">
                ✨ ท่าทาง & คำพูด (Actions)
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleAddBlock(STANDARD_BLOCKS[6], foreverBlock?.id)}
                  className={`text-left p-2 rounded-xl font-bold text-xs shadow-xs transition-transform active:scale-95 ${STANDARD_BLOCKS[6].color}`}
                >
                  {STANDARD_BLOCKS[6].label}
                </button>
                <button
                  onClick={() => handleAddBlock(STANDARD_BLOCKS[7], foreverBlock?.id)}
                  className={`text-left p-2 rounded-xl font-bold text-xs shadow-xs transition-transform active:scale-95 ${STANDARD_BLOCKS[7].color}`}
                >
                  {STANDARD_BLOCKS[7].label}
                </button>
              </div>
              <button
                onClick={() => handleAddBlock(STANDARD_BLOCKS[8], foreverBlock?.id)}
                className={`w-full text-left p-2 rounded-xl font-bold text-xs shadow-xs transition-transform active:scale-95 ${STANDARD_BLOCKS[8].color}`}
              >
                {STANDARD_BLOCKS[8].label}
              </button>
            </div>
          </div>

          {/* Hint & Peer Help buttons */}
          <div className="pt-3 border-t-2 border-slate-100 space-y-2">
            <button
              onClick={() => {
                sound.playClick();
                setShowHint(!showHint);
              }}
              className="w-full py-2 bg-amber-50 text-amber-800 border-2 border-amber-300 rounded-xl text-xs font-bold hover:bg-amber-100 flex items-center justify-center gap-1"
            >
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>{showHint ? 'ซ่อนคำใบ้' : '💡 คำใบ้จากครู'}</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setShowPeerTip(!showPeerTip);
              }}
              className="w-full py-2 bg-emerald-50 text-emerald-800 border-2 border-emerald-300 rounded-xl text-xs font-bold hover:bg-emerald-100 flex items-center justify-center gap-1"
            >
              <Users className="w-4 h-4 text-emerald-600" />
              <span>🤝 เพื่อนช่วยเพื่อน (Peer Tip)</span>
            </button>

            {showHint && (
              <div className="p-2.5 rounded-xl bg-amber-100/90 border border-amber-300 text-xs text-amber-900 font-medium">
                {currentMission.hint}
              </div>
            )}

            {showPeerTip && (
              <div className="p-2.5 rounded-xl bg-emerald-100/90 border border-emerald-300 text-xs text-emerald-900 font-medium">
                🗣️ ชวนเพื่อนข้างๆ มาดูโค้ดด้วยกัน:
                ลองนับก้าวว่าตัวละครต้องเดินกี่ครั้ง และสังเกตทิศทางที่หันว่าถูกไหม!
              </div>
            )}
          </div>
        </div>

        {/* Middle Column: Coding Workspace (พื้นที่ต่อบล็อก) - 4 cols */}
        <div className="lg:col-span-4 bg-slate-50 rounded-3xl border-3 border-slate-200 p-4 shadow-md flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2 mb-3">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                <span>📝</span>
                <span>พื้นที่ต่อบล็อกคำสั่ง (Scripts)</span>
              </h3>
              <button
                onClick={handleClearWorkspace}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                title="ล้างคำสั่งทั้งหมด"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Block Stack Container */}
            <div className="space-y-2 min-h-[300px]">
              {workspaceBlocks.map((block) => {
                const isActive = activeBlockId === block.id;

                if (block.hasChildren) {
                  return (
                    <div
                      key={block.id}
                      className={`rounded-2xl border-3 ${
                        isActive ? 'border-amber-400 ring-4 ring-amber-300' : 'border-orange-500'
                      } bg-orange-100 p-2.5 shadow-sm space-y-2 relative`}
                    >
                      {/* Loop Header */}
                      <div className="flex items-center justify-between bg-orange-500 text-white px-3 py-1.5 rounded-xl font-bold text-xs">
                        <span>{block.label}</span>
                        <button
                          onClick={() => handleRemoveBlock(block.id)}
                          className="hover:text-rose-200 p-0.5"
                          title="ลบบล็อกนี้"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Inside Loop Area */}
                      <div className="ml-4 pl-3 border-l-4 border-dashed border-orange-400 py-1 space-y-1.5 min-h-[50px]">
                        {block.children && block.children.length > 0 ? (
                          block.children.map((child) => (
                            <div
                              key={child.id}
                              className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs ${
                                child.color
                              } ${activeBlockId === child.id ? 'ring-4 ring-amber-300 scale-105' : ''}`}
                            >
                              <span>{child.label}</span>
                              <button
                                onClick={() => handleRemoveBlock(child.id)}
                                className="hover:text-slate-200 ml-2"
                              >
                                ✕
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="text-[11px] text-orange-700/70 italic py-2">
                            นำคำสั่งเคลื่อนที่มาใส่ในนี้ เพื่อให้ทำซ้ำเรื่อยๆ
                          </div>
                        )}
                      </div>

                      <div className="bg-orange-400/30 text-orange-800 text-[10px] px-2 py-0.5 rounded-md font-bold text-right">
                        สิ้นสุดลูป ↩️
                      </div>
                    </div>
                  );
                }

                // Normal block
                return (
                  <div
                    key={block.id}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-white shadow-xs transition-all ${
                      block.color
                    } ${isActive ? 'ring-4 ring-amber-300 scale-105' : ''}`}
                  >
                    <span>{block.label}</span>
                    {block.type !== 'event_flag' && (
                      <button
                        onClick={() => handleRemoveBlock(block.id)}
                        className="hover:text-rose-200 ml-2 text-sm"
                        title="ลบคำสั่งนี้"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick instructions */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 text-xs text-slate-500 font-medium">
            💡 <span className="font-bold text-slate-700">เคล็ดลับ:</span>{' '}
            ต่อคำสั่งเรียงจากบนลงล่าง เมื่อพร้อมแล้วกดปุ่ม "ธงเขียว ▶️ เริ่มรัน" ด้านขวาได้เลย!
          </div>
        </div>

        {/* Right Column: Game Stage & Visual Canvas (เวทีการแสดง) - 5 cols */}
        <div className="lg:col-span-5 bg-white rounded-3xl border-3 border-amber-300 p-4 shadow-md space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleRunProgram}
                disabled={isRunning}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-2xl font-bold text-xs md:text-sm shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>เริ่มรัน (Run)</span>
              </button>
              <button
                onClick={stopRun}
                disabled={!isRunning}
                className="px-3 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-2xl font-bold text-xs md:text-sm shadow-xs flex items-center gap-1"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>หยุด</span>
              </button>
              <button
                onClick={handleResetStage}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl"
                title="รีเซ็ตตำแหน่งตัวละคร"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {currentMission.mode === 'loop' && (
                <div className="text-xs font-bold bg-orange-100 text-orange-800 px-2.5 py-1 rounded-xl border border-orange-300">
                  วนลูปแล้ว: {loopCount} รอบ
                </div>
              )}
              <div className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-xl border border-amber-300">
                ⭐ {starsCollected.length} / {currentMission.targetPos.length}
              </div>
            </div>
          </div>

          {/* Interactive Game Stage Grid */}
          <div className="relative w-full aspect-square max-h-[360px] bg-gradient-to-br from-amber-50 via-sky-50 to-emerald-50 rounded-2xl border-2 border-slate-200 p-2 overflow-hidden flex items-center justify-center">
            {/* Grid Cells */}
            <div
              className="grid gap-1.5 w-full h-full p-2"
              style={{
                gridTemplateColumns: `repeat(${currentMission.gridSize.width}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${currentMission.gridSize.height}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: currentMission.gridSize.height }).map((_, r) =>
                Array.from({ length: currentMission.gridSize.width }).map((_, c) => {
                  const isStar = currentMission.targetPos.some((t) => t.x === c && t.y === r);
                  const isStarCollected = starsCollected.some((t) => t.x === c && t.y === r);
                  const isObstacle = currentMission.obstacles?.some((o) => o.x === c && o.y === r);
                  const isRobotHere = robotPos.x === c && robotPos.y === r;

                  return (
                    <div
                      key={`${r}-${c}`}
                      className={`relative rounded-xl border flex items-center justify-center transition-all ${
                        isObstacle
                          ? 'bg-rose-100 border-rose-300'
                          : 'bg-white/80 border-slate-200/80 shadow-2xs'
                      }`}
                    >
                      {/* Grid coordinates for spatial understanding */}
                      <span className="absolute top-1 left-1 text-[9px] text-slate-300 font-mono">
                        {c},{r}
                      </span>

                      {/* Obstacle Icon */}
                      {isObstacle && (
                        <div className="text-lg animate-pulse" title="สิ่งกีดขวาง ระวังชน!">
                          🚧
                        </div>
                      )}

                      {/* Star Goal */}
                      {isStar && !isStarCollected && (
                        <div className="text-2xl animate-bounce filter drop-shadow-md">
                          ⭐
                        </div>
                      )}

                      {/* Collected Star sparkle */}
                      {isStarCollected && (
                        <div className="text-xs text-amber-500 font-bold opacity-40">
                          ✨
                        </div>
                      )}

                      {/* Robot Character on this tile */}
                      {isRobotHere && (
                        <div
                          className={`relative z-10 transition-transform duration-300 ${
                            isJumping ? '-translate-y-4' : ''
                          }`}
                          style={{
                            transform: `rotate(${
                              robotPos.dir === 'right'
                                ? 0
                                : robotPos.dir === 'down'
                                ? 90
                                : robotPos.dir === 'left'
                                ? 180
                                : 270
                            }deg)`,
                          }}
                        >
                          <div className="w-11 h-11 bg-gradient-to-tr from-sky-400 to-blue-600 rounded-2xl border-2 border-white shadow-lg flex items-center justify-center text-white text-xl">
                            🤖
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Speech Bubble floating over Robot */}
            {speechBubble && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white border-2 border-sky-400 text-sky-900 px-4 py-2 rounded-2xl shadow-xl text-xs md:text-sm font-bold animate-bounce z-20">
                {speechBubble}
              </div>
            )}
          </div>

          {/* Victory Modal Overlay inside stage */}
          {missionComplete && (
            <div className="bg-emerald-50 border-3 border-emerald-400 rounded-2xl p-4 text-center space-y-2 animate-scale-in">
              <div className="w-12 h-12 bg-emerald-400 text-white rounded-full mx-auto flex items-center justify-center text-2xl shadow-md">
                🎉
              </div>
              <h4 className="font-black text-emerald-900 text-base">
                ยอดเยี่ยมมาก! ผ่านด่านที่ {currentLevelIdx + 1} สำเร็จ!
              </h4>
              <p className="text-xs text-emerald-700 font-medium">
                นักเรียนได้เรียนรู้การเขียนคำสั่งและเข้าใจการทำงานวนซ้ำอย่างถูกต้องแล้ว! (+1 ดาว ⭐)
              </p>
              <div className="flex items-center justify-center gap-2 pt-1">
                {currentLevelIdx < GAME_MISSIONS.length - 1 ? (
                  <button
                    onClick={() => {
                      sound.playClick();
                      setCurrentLevelIdx((i) => i + 1);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1"
                  >
                    <span>ไปด่านถัดไป</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={onOpenCertificate}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1"
                  >
                    <span>รับเกียรติบัตรยอดนักโค้ด 🏆</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
