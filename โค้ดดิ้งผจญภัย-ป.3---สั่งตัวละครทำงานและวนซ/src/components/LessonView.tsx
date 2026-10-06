import React, { useState } from 'react';
import { LESSON_SECTIONS, VOCABULARY, CURRICULUM_INFO } from '../data/curriculumData';
import { RoboMascot } from './RoboMascot';
import { sound } from '../utils/audio';
import { speech } from '../utils/speech';
import { Play, RotateCcw, Volume2, CheckCircle, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';

interface LessonViewProps {
  onEarnStar: () => void;
  onGoToGame: () => void;
  onGoToVideo: () => void;
}

export const LessonView: React.FC<LessonViewProps> = ({
  onEarnStar,
  onGoToGame,
  onGoToVideo,
}) => {
  const [activeSectionId, setActiveSectionId] = useState(LESSON_SECTIONS[0].id);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  // Interactive Comparator Simulation State
  const [simMode, setSimMode] = useState<'bad' | 'good'>('bad');
  const [simStep, setSimStep] = useState<number>(0);
  const [simRunning, setSimRunning] = useState<boolean>(false);

  // Unplugged Interactive Simulator State
  const [unpluggedCard, setUnpluggedCard] = useState<'clap' | 'jump' | 'wave'>('clap');
  const [unpluggedPlaying, setUnpluggedPlaying] = useState<boolean>(false);
  const [unpluggedCount, setUnpluggedCount] = useState<number>(0);

  const activeLesson = LESSON_SECTIONS.find((s) => s.id === activeSectionId) || LESSON_SECTIONS[0];

  const handleReadSection = (text: string) => {
    sound.playClick();
    speech.speak(text);
  };

  const handleCompleteLesson = (id: string) => {
    if (!completedLessons.includes(id)) {
      setCompletedLessons([...completedLessons, id]);
      sound.playStarCollect();
      onEarnStar();
    }
  };

  // Run comparator simulation
  const startSim = (mode: 'bad' | 'good') => {
    setSimMode(mode);
    setSimStep(0);
    setSimRunning(true);
    sound.playClick();

    const maxSteps = mode === 'bad' ? 8 : 4;
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setSimStep(current);
      sound.playMove();

      if (current >= maxSteps) {
        clearInterval(interval);
        setSimRunning(false);
        if (mode === 'good') {
          sound.playSuccess();
        }
      }
    }, 600);
  };

  // Unplugged simulator loop
  const toggleUnplugged = () => {
    if (unpluggedPlaying) {
      setUnpluggedPlaying(false);
      sound.playClick();
    } else {
      setUnpluggedPlaying(true);
      setUnpluggedCount(0);
      sound.playSuccess();
      speech.speak('หุ่นยนต์กำลังทำท่าทางวนซ้ำเรื่อยๆ จนกว่าจะมีคำสั่งหยุดค่ะ');

      let count = 0;
      const interval = setInterval(() => {
        count++;
        setUnpluggedCount(count);
        sound.playBlockSnap();
      }, 800);

      // store on window to allow clearing if needed
      (window as unknown as { _unpluggedTimer?: NodeJS.Timeout })._unpluggedTimer = interval;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* Hero Welcome Card */}
      <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl transform translate-x-20 -translate-y-20" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold">
              <span>🌟</span>
              <span>{CURRICULUM_INFO.grade} • {CURRICULUM_INFO.unit}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
              การเขียนโปรแกรมสั่งให้ตัวละครทำงาน
            </h2>
            <p className="text-amber-100 text-sm md:text-base max-w-xl font-medium">
              มารู้จักกับคำสั่งลูป (Forever Loop) ที่จะช่วยย่อคำสั่งยาวๆ ให้สั้น กระชับ และสนุกกับการเขียนโค้ดง่ายๆ สไตล์เด็ก ป.3!
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <button
                onClick={onGoToVideo}
                className="px-4 py-2 bg-white text-orange-600 rounded-2xl font-bold shadow-md hover:bg-amber-50 transition-transform active:scale-95 flex items-center gap-2 text-sm"
              >
                <Play className="w-4 h-4 fill-orange-600" />
                <span>ดูวิดีโออนิเมชัน 3 นาที</span>
              </button>
              <button
                onClick={onGoToGame}
                className="px-4 py-2 bg-slate-900/40 text-white border-2 border-white/40 rounded-2xl font-bold hover:bg-slate-900/60 transition-transform active:scale-95 flex items-center gap-2 text-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>ไปเล่นเกมบล็อกโค้ดดิ้ง</span>
              </button>
            </div>
          </div>
          <RoboMascot
            expression="happy"
            message="สวัสดีจ้า! วันนี้เรามาเรียนรู้วิธีสั่งให้โรโบ้เดินวนซ้ำกันนะ!"
            size="lg"
            className="shrink-0"
          />
        </div>
      </div>

      {/* Lesson Topics Tab Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {LESSON_SECTIONS.map((section, idx) => {
          const isActive = activeSectionId === section.id;
          const isDone = completedLessons.includes(section.id);
          return (
            <button
              key={section.id}
              onClick={() => {
                sound.playClick();
                setActiveSectionId(section.id);
              }}
              className={`text-left p-4 rounded-2xl border-3 transition-all relative overflow-hidden ${
                isActive
                  ? 'bg-white border-orange-400 shadow-lg -translate-y-1'
                  : 'bg-white/80 border-slate-200 hover:border-amber-300 hover:bg-white'
              }`}
            >
              {isDone && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>เข้าใจแล้ว</span>
                </div>
              )}
              <span className="text-xs font-extrabold text-orange-500 uppercase tracking-wider block mb-1">
                บทเรียนที่ {idx + 1}
              </span>
              <h3 className="font-bold text-slate-800 text-sm md:text-base leading-snug">
                {section.title.split('. ')[1] || section.title}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1 mt-1">{section.subtitle}</p>
            </button>
          );
        })}
      </div>

      {/* Active Lesson Content Box */}
      <div className="bg-white rounded-3xl border-3 border-amber-200 shadow-md p-6 space-y-6">
        {/* Lesson Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
              {activeLesson.subtitle}
            </span>
            <h3 className="text-xl md:text-2xl font-black text-slate-800 mt-2">
              {activeLesson.title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleReadSection(`${activeLesson.title}. ${activeLesson.content.summary}`)}
              className="px-3 py-1.5 bg-sky-50 text-sky-700 border-2 border-sky-300 rounded-xl text-xs font-bold hover:bg-sky-100 flex items-center gap-1.5"
              title="ฟังเสียงบรรยายบทเรียนนี้"
            >
              <Volume2 className="w-4 h-4" />
              <span>ฟังเสียงอ่าน</span>
            </button>
            <button
              onClick={() => handleCompleteLesson(activeLesson.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                completedLessons.includes(activeLesson.id)
                  ? 'bg-emerald-500 text-white'
                  : 'bg-amber-400 text-amber-950 hover:bg-amber-500'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>{completedLessons.includes(activeLesson.id) ? 'เรียนจบแล้ว ⭐' : 'บันทึกว่าเรียนแล้ว (+1 ดาว)'}</span>
            </button>
          </div>
        </div>

        {/* Lesson Summary Box */}
        <div className="bg-amber-50/80 border-2 border-amber-200 rounded-2xl p-4 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold shrink-0 shadow-xs">
            💡
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-amber-900 text-sm">สาระสำคัญสำหรับเด็ก ป.3</h4>
            <p className="text-slate-700 text-sm md:text-base leading-relaxed font-medium">
              {activeLesson.content.summary}
            </p>
          </div>
        </div>

        {/* Key Points */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <span>📌</span>
            <span>จุดสำคัญที่ควรรู้:</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {activeLesson.content.keyPoints.map((point, i) => (
              <div
                key={i}
                className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs md:text-sm text-slate-700 font-medium"
              >
                <span className="w-5 h-5 rounded-full bg-orange-200 text-orange-800 font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">
                  {i + 1}
                </span>
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lesson 2 Interactive Visual Comparator: 10 Linear Blocks vs 1 Forever Loop */}
        {activeLesson.id === 'lesson-2' && (
          <div className="bg-sky-50/80 border-2 border-sky-300 rounded-3xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="font-extrabold text-sky-900 text-base flex items-center gap-2">
                  <span>🔬</span>
                  <span>ห้องทดลองเปรียบเทียบ: ทำไมลูปถึงสุดยอดกว่า?</span>
                </h4>
                <p className="text-xs text-sky-700">
                  คลิกทดสอบดูว่าการเขียนบล็อกต่อกัน 10 ครั้ง กับการใส่บล็อก "วนซ้ำตลอด" ต่างกันอย่างไร!
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => startSim('bad')}
                  disabled={simRunning}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs border-2 transition-all ${
                    simMode === 'bad'
                      ? 'bg-rose-500 text-white border-rose-600'
                      : 'bg-white text-rose-600 border-rose-300 hover:bg-rose-50'
                  }`}
                >
                  ทดสอบแบบที่ 1: เขียนยาว 10 บล็อก 😩
                </button>
                <button
                  onClick={() => startSim('good')}
                  disabled={simRunning}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs border-2 transition-all ${
                    simMode === 'good'
                      ? 'bg-emerald-500 text-white border-emerald-600'
                      : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                  }`}
                >
                  ทดสอบแบบที่ 2: วนซ้ำตลอด (Forever) ✨
                </button>
              </div>
            </div>

            {/* Simulation Stage */}
            <div className="bg-white rounded-2xl border-2 border-sky-200 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              {/* Left: Code Structure Display */}
              <div className="bg-slate-900 text-slate-100 rounded-xl p-3 font-mono text-xs space-y-1 shadow-inner max-h-56 overflow-y-auto">
                <div className="text-slate-400 font-bold border-b border-slate-700 pb-1 mb-2">
                  {simMode === 'bad' ? '📜 โค้ดยาว 10 บล็อก (เสี่ยงบั๊ก)' : '⚡ โค้ดกระชับด้วย Forever Loop'}
                </div>
                {simMode === 'bad' ? (
                  <>
                    <div className="text-amber-400">เมื่อคลิกธงเขียว 🚩</div>
                    <div className={simStep === 1 ? 'bg-rose-500/40 px-1 rounded' : ''}>เดินหน้า 10 ก้าว</div>
                    <div className={simStep === 2 ? 'bg-rose-500/40 px-1 rounded' : ''}>หันขวา 90 องศา</div>
                    <div className={simStep === 3 ? 'bg-rose-500/40 px-1 rounded' : ''}>เดินหน้า 10 ก้าว</div>
                    <div className={simStep === 4 ? 'bg-rose-500/40 px-1 rounded' : ''}>หันขวา 90 องศา</div>
                    <div className={simStep === 5 ? 'bg-rose-500/40 px-1 rounded' : ''}>เดินหน้า 10 ก้าว</div>
                    <div className={simStep === 6 ? 'bg-rose-500/40 px-1 rounded' : ''}>หันขวา 90 องศา</div>
                    <div className={simStep === 7 ? 'bg-rose-500/40 px-1 rounded' : ''}>เดินหน้า 10 ก้าว</div>
                    <div className={simStep === 8 ? 'bg-rose-500/40 px-1 rounded' : ''}>หันขวา 90 องศา</div>
                    <div className="text-slate-500 text-[10px] italic">...หมดแรงเขียนแล้ว! ถ้าอยากได้ 100 รอบต้องต่ออีก 400 บล็อก!</div>
                  </>
                ) : (
                  <>
                    <div className="text-amber-400">เมื่อคลิกธงเขียว 🚩</div>
                    <div className="text-orange-400 font-bold">🔄 วนซ้ำตลอด (Forever) {'{'}</div>
                    <div className={`pl-4 ${simStep % 2 === 1 ? 'bg-emerald-500/40 px-1 rounded font-bold' : ''}`}>
                      เดินหน้า 10 ก้าว ➡️
                    </div>
                    <div className={`pl-4 ${simStep % 2 === 0 && simStep > 0 ? 'bg-emerald-500/40 px-1 rounded font-bold' : ''}`}>
                      หันขวา 90 องศา ↩️
                    </div>
                    <div className="text-orange-400 font-bold">{'}'}</div>
                    <div className="text-emerald-400 text-[10px] mt-2 font-bold">
                      ✨ ทำงานวนซ้ำตลอดเวลา สะอาด สั้น ไม่เหนื่อย!
                    </div>
                  </>
                )}
              </div>

              {/* Right: Animated Walking Grid */}
              <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-xl border border-slate-200 min-h-[180px]">
                <div className="relative w-48 h-36 border-2 border-dashed border-sky-300 rounded-xl bg-white flex items-center justify-center">
                  {/* Square Track */}
                  <div className="absolute inset-4 border-2 border-sky-200 rounded-lg" />
                  
                  {/* Robot Avatar positioned based on simStep */}
                  <div
                    className="absolute w-9 h-9 bg-sky-500 text-white rounded-xl shadow-md flex items-center justify-center text-sm font-bold transition-all duration-300"
                    style={{
                      top: simStep === 0 || simStep === 1 || simStep === 7 || simStep === 8 ? '16px' : '88px',
                      left: simStep === 0 || simStep === 3 || simStep === 4 || simStep === 7 ? '16px' : '136px',
                      transform: `rotate(${simStep * 90}deg)`,
                    }}
                  >
                    🤖
                  </div>

                  <div className="absolute bottom-1 right-2 text-[10px] text-slate-400">
                    ก้าวที่: {simStep} {simRunning ? 'กำลังเดิน...' : 'หยุด'}
                  </div>
                </div>

                <p className="text-xs text-center font-bold text-slate-600 mt-2">
                  {simMode === 'bad'
                    ? 'แบบเขียนยาว: พอคำสั่งหมด โรโบ้ก็หยุดเดินทันที!'
                    : 'แบบวนซ้ำตลอด: โรโบ้เดินวนรอบห้องอย่างต่อเนื่องไม่หยุดเลย!'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Lesson 3 Unplugged Interactive Roleplay Simulator */}
        {activeLesson.id === 'lesson-3' && (
          <div className="bg-emerald-50/80 border-2 border-emerald-300 rounded-3xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="font-extrabold text-emerald-900 text-base flex items-center gap-2">
                  <span>🎭</span>
                  <span>ห้องจำลองกิจกรรม Unplugged: "หุ่นยนต์ทำซ้ำ"</span>
                </h4>
                <p className="text-xs text-emerald-700">
                  ทดลองเป็น "โปรแกรมเมอร์" ถือบัตรคำสั่ง แล้วสั่งให้ "เพื่อนหุ่นยนต์" ทำท่าซ้ำๆ จนกว่าจะกดหยุด!
                </p>
              </div>
              <button
                onClick={toggleUnplugged}
                className={`px-4 py-2 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center gap-2 ${
                  unpluggedPlaying
                    ? 'bg-rose-500 text-white hover:bg-rose-600'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600'
                }`}
              >
                {unpluggedPlaying ? (
                  <>
                    <span>🛑 ชูป้ายสั่ง "หยุด" (Stop)</span>
                  </>
                ) : (
                  <>
                    <span>▶️ เริ่มสั่งหุ่นยนต์ทำซ้ำ (Loop Start)</span>
                  </>
                )}
              </button>
            </div>

            {/* Roleplay Stage */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Programmer Card */}
              <div className="bg-white rounded-2xl border-2 border-emerald-200 p-4 space-y-2">
                <div className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                  <span>🧑‍💻</span>
                  <span>บทบาท: โปรแกรมเมอร์</span>
                </div>
                <p className="text-xs text-slate-600">เลือกบัตรคำสั่งที่ต้องการให้หุ่นยนต์ทำซ้ำ:</p>
                <div className="space-y-1.5">
                  <button
                    onClick={() => {
                      setUnpluggedCard('clap');
                      sound.playClick();
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                      unpluggedCard === 'clap'
                        ? 'bg-purple-100 border-purple-400 text-purple-800'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    👏 บัตรคำสั่ง: ตบมือ 2 แปะ
                  </button>
                  <button
                    onClick={() => {
                      setUnpluggedCard('jump');
                      sound.playClick();
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                      unpluggedCard === 'jump'
                        ? 'bg-sky-100 border-sky-400 text-sky-800'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    🦘 บัตรคำสั่ง: กระโดด 1 ครั้ง
                  </button>
                  <button
                    onClick={() => {
                      setUnpluggedCard('wave');
                      sound.playClick();
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                      unpluggedCard === 'wave'
                        ? 'bg-amber-100 border-amber-400 text-amber-800'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    👋 บัตรคำสั่ง: โบกมือทักทาย
                  </button>
                </div>
              </div>

              {/* Robot Actor Card */}
              <div className="bg-white rounded-2xl border-2 border-emerald-200 p-4 flex flex-col items-center justify-center text-center space-y-2">
                <div className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                  <span>🤖</span>
                  <span>บทบาท: เพื่อนหุ่นยนต์</span>
                </div>
                <div
                  className={`w-20 h-20 rounded-2xl bg-amber-100 border-3 border-amber-300 flex items-center justify-center text-4xl shadow-md transition-transform ${
                    unpluggedPlaying ? 'animate-bounce' : ''
                  }`}
                >
                  {unpluggedCard === 'clap' && '👏'}
                  {unpluggedCard === 'jump' && '🦘'}
                  {unpluggedCard === 'wave' && '👋'}
                </div>
                <div className="text-xs font-bold text-slate-700">
                  {unpluggedPlaying ? (
                    <span className="text-emerald-600">กำลังทำท่าทางซ้ำรอบที่: {unpluggedCount} รอบ!</span>
                  ) : (
                    <span className="text-slate-400">รอโปรแกรมเมอร์สั่งเริ่ม...</span>
                  )}
                </div>
              </div>

              {/* Lesson Insight Card */}
              <div className="bg-white rounded-2xl border-2 border-emerald-200 p-4 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-800">💡 ทำไมต้องมีกิจกรรมนี้?</div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    การสวมบทบาท Unplugged ช่วยให้นักเรียนเห็นภาพจริง (Concrete) ว่าคอมพิวเตอร์จะทำตามบล็อกวนซ้ำอย่างเคร่งครัด
                    ไม่เหนื่อย และไม่หยุดจนกว่าจะมีคำสั่งให้หยุด!
                  </p>
                </div>
                <div className="bg-emerald-100 text-emerald-800 text-[11px] p-2 rounded-xl font-bold">
                  🤝 พัฒนาทักษะการสื่อสารและการทำงานร่วมกับเพื่อน (K-P-A)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Standard Comparison Card (if present) */}
        {activeLesson.content.comparison && activeLesson.id !== 'lesson-2' && (
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span>⚖️</span>
              <span>{activeLesson.content.comparison.title}</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 space-y-2">
                <span className="text-xs font-bold text-rose-700">
                  {activeLesson.content.comparison.badWay.label}
                </span>
                <div className="bg-white rounded-xl p-3 border border-rose-100 text-xs font-mono text-slate-700 space-y-1">
                  {activeLesson.content.comparison.badWay.blocks.map((b, i) => (
                    <div key={i} className="text-slate-600">{b}</div>
                  ))}
                </div>
                <p className="text-xs text-rose-600 font-medium">
                  {activeLesson.content.comparison.badWay.note}
                </p>
              </div>

              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 space-y-2">
                <span className="text-xs font-bold text-emerald-700">
                  {activeLesson.content.comparison.goodWay.label}
                </span>
                <div className="bg-white rounded-xl p-3 border border-emerald-100 text-xs font-mono text-slate-700 space-y-1">
                  {activeLesson.content.comparison.goodWay.blocks.map((b, i) => (
                    <div key={i} className="text-emerald-800 font-bold">{b}</div>
                  ))}
                </div>
                <p className="text-xs text-emerald-600 font-medium">
                  {activeLesson.content.comparison.goodWay.note}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Vocabulary Flashcards Section */}
      <div className="bg-white rounded-3xl border-3 border-amber-200 p-6 shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg md:text-xl font-black text-slate-800 flex items-center gap-2">
              <span>📖</span>
              <span>คำศัพท์น่ารู้สำหรับนักเขียนโปรแกรม ป.3 (Coding Vocabulary)</span>
            </h3>
            <p className="text-xs text-slate-500">
              คลิกที่รูปลำโพง 🔊 เพื่อฟังการออกเสียงและคำอธิบายภาษาไทย
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {VOCABULARY.map((item, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-amber-50/70 to-orange-50/70 border-2 border-amber-200 rounded-2xl p-3.5 flex items-start justify-between gap-3 hover:shadow-md transition-shadow"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{item.icon}</span>
                  <h5 className="font-extrabold text-slate-800 text-sm">{item.word}</h5>
                </div>
                <p className="text-xs text-slate-600 font-medium">{item.thai}</p>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  speech.speak(`${item.word} คือ ${item.thai}`);
                }}
                className="p-1.5 rounded-xl bg-white border border-amber-300 text-amber-700 hover:bg-amber-100 shrink-0 transition-colors"
                title="ฟังเสียงอ่านคำศัพท์นี้"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
