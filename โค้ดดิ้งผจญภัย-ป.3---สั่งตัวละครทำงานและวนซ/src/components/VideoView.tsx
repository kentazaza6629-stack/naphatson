import React, { useState, useEffect, useRef } from 'react';
import { VIDEO_STORY_SCENES, VideoScene } from '../data/videoStoryData';
import { RoboMascot } from './RoboMascot';
import { sound } from '../utils/audio';
import { speech } from '../utils/speech';
import { Play, Pause, RotateCcw, Volume2, SkipForward, SkipBack, Award, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface VideoViewProps {
  onEarnStar: () => void;
  onGoToGame: () => void;
}

export const VideoView: React.FC<VideoViewProps> = ({ onEarnStar, onGoToGame }) => {
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sceneProgress, setSceneProgress] = useState(0); // 0 to 100
  const [interactiveAnswered, setInteractiveAnswered] = useState<Record<number, boolean>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswerResult, setShowAnswerResult] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  const currentScene: VideoScene = VIDEO_STORY_SCENES[currentSceneIdx];

  // Ref to hold the timer
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Play narration when scene changes or starts playing
  useEffect(() => {
    if (isPlaying) {
      speech.speak(currentScene.teacherVoiceText);
    }
    return () => {
      speech.stop();
    };
  }, [currentSceneIdx, isPlaying]);

  // Video progress ticker
  useEffect(() => {
    if (isPlaying) {
      const stepInterval = 100; // ms
      const stepIncrement = (stepInterval / (currentScene.duration * 1000)) * 100;

      progressTimerRef.current = setInterval(() => {
        setSceneProgress((prev) => {
          if (prev >= 100) {
            // Next scene
            if (currentSceneIdx < VIDEO_STORY_SCENES.length - 1) {
              setCurrentSceneIdx((idx) => idx + 1);
              setSelectedOption(null);
              setShowAnswerResult(false);
              return 0;
            } else {
              // Ended
              setIsPlaying(false);
              sound.playSuccess();
              confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
              return 100;
            }
          }
          return prev + stepIncrement;
        });
      }, stepInterval);
    } else {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    }

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [isPlaying, currentSceneIdx, currentScene.duration]);

  const togglePlay = () => {
    sound.playClick();
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    sound.playClick();
    setCurrentSceneIdx(0);
    setSceneProgress(0);
    setSelectedOption(null);
    setShowAnswerResult(false);
    setIsPlaying(true);
  };

  const handleNextScene = () => {
    if (currentSceneIdx < VIDEO_STORY_SCENES.length - 1) {
      sound.playClick();
      setCurrentSceneIdx((i) => i + 1);
      setSceneProgress(0);
      setSelectedOption(null);
      setShowAnswerResult(false);
    }
  };

  const handlePrevScene = () => {
    if (currentSceneIdx > 0) {
      sound.playClick();
      setCurrentSceneIdx((i) => i - 1);
      setSceneProgress(0);
      setSelectedOption(null);
      setShowAnswerResult(false);
    }
  };

  const handleSelectAnswer = (idx: number) => {
    if (!currentScene.interactivePrompt || showAnswerResult) return;
    setSelectedOption(idx);
    const correct = idx === currentScene.interactivePrompt.correct;
    setIsCorrect(correct);
    setShowAnswerResult(true);

    if (correct) {
      sound.playSuccess();
      if (!interactiveAnswered[currentScene.id]) {
        setInteractiveAnswered({ ...interactiveAnswered, [currentScene.id]: true });
        onEarnStar();
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
      }
    } else {
      sound.playError();
    }
  };

  // Walking robot calculation inside scene 1, 2, 3
  const roboAngle = (sceneProgress / 100) * 360 * 2; // two full loops
  const roboTrackX = 50 + 35 * Math.cos((roboAngle * Math.PI) / 180);
  const roboTrackY = 50 + 30 * Math.sin((roboAngle * Math.PI) / 180);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Video Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-3xl p-5 text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold bg-white/20 px-3 py-0.5 rounded-full w-fit mb-1">
            <span>🎬</span>
            <span>วิดีโออนิเมชันบทเรียน ป.3 (3 นาที)</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black">
            เรื่อง: เจ้าหุ่นยนต์โรโบ้กับความลับของลูปวนซ้ำ
          </h2>
          <p className="text-xs md:text-sm text-sky-100 mt-0.5">
            ตามแผนการจัดการเรียนรู้ชั่วโมงที่ 1 ออนไลน์ โดยครูนภัสสร มากมูล
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              speech.speak(currentScene.teacherVoiceText);
            }}
            className="px-3 py-1.5 bg-white text-indigo-700 rounded-xl text-xs font-bold hover:bg-sky-50 flex items-center gap-1.5 shadow-xs"
          >
            <Volume2 className="w-4 h-4" />
            <span>ฟังเสียงครูอีกครั้ง</span>
          </button>
        </div>
      </div>

      {/* Interactive Video Theater Screen */}
      <div className="bg-slate-900 rounded-3xl border-4 border-amber-300 shadow-2xl overflow-hidden relative">
        {/* Animated Theater Canvas */}
        <div className="relative w-full h-80 sm:h-96 bg-gradient-to-b from-sky-200 via-amber-100 to-emerald-200 flex flex-col justify-between p-4 overflow-hidden select-none">
          {/* Decorative Classroom Elements */}
          <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-sky-300 shadow-xs text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <span>🏫</span>
            <span>ห้องเรียนวิทยาการคำนวณ ป.3</span>
          </div>

          <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-xs px-3 py-1 rounded-xl border border-amber-300 shadow-xs text-xs font-bold text-amber-900">
            ตอนที่ {currentSceneIdx + 1} จาก {VIDEO_STORY_SCENES.length}
          </div>

          {/* Scene 1: Patrol walking */}
          {currentScene.visualType === 'patrol' && (
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Classroom floor track */}
              <div className="w-72 h-44 border-4 border-dashed border-sky-400/80 rounded-3xl relative bg-white/40 flex items-center justify-center">
                <span className="text-xs font-bold text-sky-700/60 uppercase tracking-widest">
                  เส้นทางเดินตรวจห้อง 4 มุม
                </span>

                {/* Walking Robot */}
                <div
                  className="absolute w-12 h-12 transition-all duration-100"
                  style={{
                    left: `${roboTrackX}%`,
                    top: `${roboTrackY}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <RoboMascot expression="happy" size="sm" />
                </div>
              </div>
            </div>
          )}

          {/* Scene 2: Long code problem (too many blocks!) */}
          {currentScene.visualType === 'long_code' && (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="flex items-center gap-6 max-w-lg w-full bg-white/90 rounded-3xl p-5 border-3 border-rose-300 shadow-xl">
                <RoboMascot
                  expression="surprised"
                  message="แงงง! เขียนคำสั่งยาวเป็น 80 บล็อก เหนื่อยแย่เลย!"
                  size="md"
                />
                <div className="space-y-1 text-xs font-mono bg-slate-900 text-rose-300 p-3 rounded-2xl flex-1 max-h-44 overflow-y-auto border border-rose-400 shadow-inner">
                  <div className="text-white font-bold pb-1 border-b border-slate-700">คำสั่งเรียงยาว 80 บล็อก</div>
                  <div>➡️ เดินหน้า 10 ก้าว</div>
                  <div>↩️ หันขวา 90 องศา</div>
                  <div>➡️ เดินหน้า 10 ก้าว</div>
                  <div>↩️ หันขวา 90 องศา</div>
                  <div>➡️ เดินหน้า 10 ก้าว</div>
                  <div>↩️ หันขวา 90 องศา</div>
                  <div>➡️ เดินหน้า 10 ก้าว</div>
                  <div className="text-rose-400 font-bold animate-pulse">...และอีก 72 บล็อกที่เหลือ! 🥵</div>
                </div>
              </div>
            </div>
          )}

          {/* Scene 3: Loop Magic! */}
          {currentScene.visualType === 'loop_magic' && (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="flex items-center gap-6 max-w-xl w-full bg-white/90 rounded-3xl p-5 border-3 border-emerald-300 shadow-xl">
                <RoboMascot
                  expression="dancing"
                  message="เย้ๆ! ใช้บล็อกวนซ้ำตลอด เหลือแค่ 3 บล็อกเอง!"
                  size="md"
                />
                <div className="space-y-2 text-xs font-bold bg-orange-50 p-4 rounded-2xl border-2 border-orange-300 flex-1 shadow-inner">
                  <div className="bg-amber-500 text-white px-3 py-1.5 rounded-xl">เมื่อคลิกธงเขียว 🚩</div>
                  <div className="bg-orange-500 text-white px-3 py-2 rounded-xl shadow-md space-y-1">
                    <div className="text-xs">🔄 วนซ้ำตลอด (Forever)</div>
                    <div className="bg-sky-500 text-white px-2 py-1 rounded-lg ml-3">
                      เดินหน้า 10 ก้าว ➡️
                    </div>
                    <div className="bg-blue-600 text-white px-2 py-1 rounded-lg ml-3">
                      หันขวา 90 องศา ↩️
                    </div>
                  </div>
                  <div className="text-emerald-700 text-xs font-extrabold flex items-center gap-1">
                    <span>✨</span>
                    <span>สั้น กระชับ ทำซ้ำได้ไม่จำกัด!</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scene 4: Celebrate & Finish */}
          {currentScene.visualType === 'celebrate' && (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
              <div className="bg-white/95 rounded-3xl p-6 border-3 border-amber-400 shadow-xl max-w-md space-y-3">
                <div className="w-16 h-16 bg-amber-400 text-amber-950 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-md animate-bounce">
                  🏆
                </div>
                <h3 className="text-xl font-black text-slate-800">
                  เก่งมาก! ดูวิดีโอจบแล้วจ้า
                </h3>
                <p className="text-xs md:text-sm text-slate-600 font-medium">
                  ตอนนี้เข้าใจพลังของคำสั่งลูปแล้ว ไปลุยต่อบล็อกในเกมกันเลย!
                </p>
                <button
                  onClick={onGoToGame}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold shadow-md hover:from-amber-600 hover:to-orange-600 transition-all text-sm"
                >
                  🚀 เข้าสู่เกมบล็อกโค้ดดิ้ง (Play Game)
                </button>
              </div>
            </div>
          )}

          {/* Subtitles & Captions at bottom of canvas */}
          <div className="relative z-10 w-full bg-slate-900/85 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl border border-slate-700 shadow-md text-center max-w-2xl mx-auto">
            <p className="text-xs md:text-sm font-semibold leading-relaxed text-amber-200">
              {currentScene.caption}
            </p>
          </div>
        </div>

        {/* Video Scrubber & Playback Controls Bar */}
        <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 space-y-2">
          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden relative cursor-pointer">
            <div
              className="bg-gradient-to-r from-amber-400 to-orange-500 h-full transition-all duration-150"
              style={{
                width: `${((currentSceneIdx + sceneProgress / 100) / VIDEO_STORY_SCENES.length) * 100}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-white text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-xl bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-transform active:scale-90"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
              </button>

              <button
                onClick={handleRestart}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="เริ่มเล่นใหม่ตั้งแต่ต้น"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevScene}
                  disabled={currentSceneIdx === 0}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
                  title="ย้อนกลับไปตอนก่อนหน้า"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextScene}
                  disabled={currentSceneIdx === VIDEO_STORY_SCENES.length - 1}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
                  title="ข้ามไปตอนถัดไป"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              <span className="text-slate-400 text-xs hidden sm:inline ml-2">
                {currentScene.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-amber-400 font-bold">
                {isPlaying ? '▶️ กำลังเล่น' : '⏸️ หยุดชั่วคราว'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Checkpoint Quiz for this Scene (ตามแผนการสอน ชั่วโมงที่ 1 ขั้นนำ ถามตอบ 3 ข้อ) */}
      {currentScene.interactivePrompt && (
        <div className="bg-white rounded-3xl border-3 border-sky-300 p-5 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-sm">
                ❓
              </span>
              <h4 className="font-bold text-slate-800 text-sm md:text-base">
                คำถามทบทวนประจำตอน: {currentScene.interactivePrompt.question}
              </h4>
            </div>
            {interactiveAnswered[currentScene.id] && (
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                <span>ได้ 1 ดาวแล้ว ⭐</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {currentScene.interactivePrompt.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              let btnStyle = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-sky-50 hover:border-sky-300';
              if (showAnswerResult) {
                if (idx === currentScene.interactivePrompt?.correct) {
                  btnStyle = 'bg-emerald-500 border-emerald-600 text-white font-bold shadow-md';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-500 border-rose-600 text-white font-bold';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(idx)}
                  disabled={showAnswerResult}
                  className={`p-3 rounded-2xl border-2 text-xs md:text-sm font-semibold transition-all text-left flex items-start gap-2 ${btnStyle}`}
                >
                  <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center shrink-0 text-xs">
                    {idx + 1}
                  </span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Feedback Explanation */}
          {showAnswerResult && (
            <div
              className={`p-3 rounded-2xl border-2 flex items-start gap-2.5 text-xs md:text-sm font-medium ${
                isCorrect
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-rose-50 border-rose-300 text-rose-800'
              }`}
            >
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold">{isCorrect ? 'ถูกต้องจ้า!' : 'ยังไม่ถูกนะจ๊ะ!'}</span>{' '}
                {currentScene.interactivePrompt.explanation}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
