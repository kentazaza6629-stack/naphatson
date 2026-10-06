import React, { useState } from 'react';
import { QUIZ_QUESTIONS, DRAG_DROP_CHALLENGES } from '../data/quizData';
import { QuizQuestion, DragDropChallenge, StudentStats } from '../types';
import { sound } from '../utils/audio';
import { speech } from '../utils/speech';
import { RoboMascot } from './RoboMascot';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Award,
  Sparkles,
  ArrowRight,
  GripVertical,
  Volume2,
  Trophy,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizViewProps {
  stats: StudentStats;
  onUpdateStats: (newStats: Partial<StudentStats>) => void;
  onOpenCertificate: () => void;
  onEarnStar: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  stats,
  onUpdateStats,
  onOpenCertificate,
  onEarnStar,
}) => {
  const [quizMode, setQuizMode] = useState<'multiple_choice' | 'drag_drop'>('multiple_choice');

  // Multiple Choice Quiz State
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [answerHistory, setAnswerHistory] = useState<{ isCorrect: boolean; question: QuizQuestion }[]>([]);

  // Drag & Drop Challenge State
  const [dragIndex, setDragIndex] = useState<number>(0);
  const currentDrag: DragDropChallenge = DRAG_DROP_CHALLENGES[dragIndex];
  const [placedBlocks, setPlacedBlocks] = useState<string[]>([]);
  const [dragFeedback, setDragFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const currentQ: QuizQuestion = QUIZ_QUESTIONS[currentQIndex];

  // Handle Option Selection
  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    sound.playClick();
    setSelectedOption(idx);
    setIsAnswerSubmitted(true);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      sound.playSuccess();
      setScore((s) => s + 1);
      onEarnStar();
    } else {
      sound.playError();
    }

    setAnswerHistory((prev) => [...prev, { isCorrect, question: currentQ }]);
  };

  // Next Question
  const handleNextQuestion = () => {
    sound.playClick();
    if (currentQIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQIndex((idx) => idx + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Finished!
      setQuizFinished(true);
      const finalScore = score + (selectedOption === currentQ.correctIndex ? 0 : 0);
      onUpdateStats({
        quizScore: finalScore,
        quizTotal: QUIZ_QUESTIONS.length,
        passedQuiz: finalScore >= 7,
      });

      if (finalScore >= 7) {
        sound.playCheerFanfare();
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      } else {
        sound.playSuccess();
      }
    }
  };

  // Restart Quiz
  const handleRestartQuiz = () => {
    sound.playClick();
    setCurrentQIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizFinished(false);
    setAnswerHistory([]);
  };

  // Drag & Drop methods
  const handleAddDragBlock = (label: string) => {
    if (placedBlocks.includes(label)) return;
    sound.playBlockSnap();
    setPlacedBlocks([...placedBlocks, label]);
    setDragFeedback(null);
  };

  const handleRemoveDragBlock = (label: string) => {
    sound.playClick();
    setPlacedBlocks(placedBlocks.filter((b) => b !== label));
    setDragFeedback(null);
  };

  const handleCheckDragSequence = () => {
    sound.playClick();
    const isExact =
      placedBlocks.length === currentDrag.targetSequence.length &&
      placedBlocks.every((val, i) => val === currentDrag.targetSequence[i]);

    if (isExact) {
      sound.playSuccess();
      setDragFeedback({
        success: true,
        message: currentDrag.explanation,
      });
      onEarnStar();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } else {
      sound.playError();
      setDragFeedback({
        success: false,
        message: 'ยังเรียงไม่ถูกต้องนะจ๊ะ ลองนึกดูว่าเริ่มโปรแกรมด้วยอะไร แล้วคำสั่งอะไรต้องอยู่ในลูป!',
      });
    }
  };

  // Calculate Evaluation Grade according to PDF assessment rubric
  const getEvaluationTier = (s: number) => {
    if (s >= 7) return { label: 'ดีมาก (ผ่านเกณฑ์ดีเยี่ยม)', color: 'text-emerald-700 bg-emerald-100 border-emerald-300' };
    if (s >= 5) return { label: 'ดี (ผ่านเกณฑ์มาตรฐาน)', color: 'text-sky-700 bg-sky-100 border-sky-300' };
    return { label: 'ปรับปรุง (ควรทบทวนบทเรียนอีกครั้ง)', color: 'text-rose-700 bg-rose-100 border-rose-300' };
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Mode Switcher Banner */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-3xl p-5 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold bg-white/20 px-3 py-0.5 rounded-full w-fit mb-1">
            <span>📝</span>
            <span>การวัดและประเมินผล วิทยาการคำนวณ ป.3</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black">
            แบบทดสอบ & กิจกรรมทบทวนความรู้
          </h2>
          <p className="text-xs md:text-sm text-pink-100 mt-0.5">
            ตามเกณฑ์วัดผล K-P-A เรื่องการเขียนโปรแกรมสั่งให้ตัวละครทำงาน
          </p>
        </div>

        {/* Tab Buttons between Multiple Choice & Drag-Drop */}
        <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-2xl">
          <button
            onClick={() => {
              sound.playClick();
              setQuizMode('multiple_choice');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              quizMode === 'multiple_choice'
                ? 'bg-white text-purple-700 shadow-md'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            แบบทดสอบ 10 ข้อ (Quiz)
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setQuizMode('drag_drop');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              quizMode === 'drag_drop'
                ? 'bg-white text-purple-700 shadow-md'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            ลากวางเรียงลำดับบล็อก
          </button>
        </div>
      </div>

      {/* MODE 1: MULTIPLE CHOICE QUIZ */}
      {quizMode === 'multiple_choice' && (
        <div className="bg-white rounded-3xl border-3 border-purple-200 p-6 shadow-lg space-y-6">
          {!quizFinished ? (
            <>
              {/* Progress & Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-black flex items-center justify-center text-sm">
                    {currentQIndex + 1}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-purple-600 block">
                      คำถามข้อที่ {currentQIndex + 1} จาก {QUIZ_QUESTIONS.length}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      จุดประสงค์: ด้าน {currentQ.kpaCategory} (
                      {currentQ.kpaCategory === 'K'
                        ? 'ความรู้'
                        : currentQ.kpaCategory === 'P'
                        ? 'ทักษะ/กระบวนการ'
                        : 'เจตคติ/จิตพิสัย'}
                      )
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-300">
                    คะแนนปัจจุบัน: {score}
                  </div>
                  <button
                    onClick={() => {
                      sound.playClick();
                      speech.speak(currentQ.question);
                    }}
                    className="p-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100"
                    title="ฟังเสียงอ่านคำถาม"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-3">
                <h3 className="text-lg md:text-xl font-black text-slate-800 leading-snug">
                  {currentQ.question}
                </h3>

                {/* Code Illustration (if any) */}
                {currentQ.codeIllustration && (
                  <div className="bg-slate-900 text-white p-3.5 rounded-2xl font-mono text-xs max-w-md shadow-inner border-2 border-slate-700">
                    <div className="text-slate-400 font-bold border-b border-slate-700 pb-1 mb-2 text-[10px]">
                      {currentQ.codeIllustration.caption}
                    </div>
                    {currentQ.codeIllustration.blocks.map((b, i) => (
                      <div key={i} className="text-amber-300">
                        {b}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Options Grid (Kahoot inspired 4 bright colorful choices) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQ.correctIndex;

                  // Dynamic styles based on answer status
                  let buttonStyle =
                    'bg-slate-50 border-slate-200 text-slate-700 hover:bg-purple-50 hover:border-purple-300 hover:shadow-xs';

                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      buttonStyle =
                        'bg-emerald-500 border-emerald-600 text-white shadow-md font-bold scale-[1.01]';
                    } else if (isSelected) {
                      buttonStyle = 'bg-rose-500 border-rose-600 text-white font-bold';
                    } else {
                      buttonStyle = 'bg-slate-100 border-slate-200 text-slate-400 opacity-60';
                    }
                  }

                  const badges = ['ก', 'ข', 'ค', 'ง'];

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswerSubmitted}
                      className={`p-4 rounded-2xl border-3 text-left font-bold text-sm transition-all flex items-start gap-3 ${buttonStyle}`}
                    >
                      <span className="w-7 h-7 rounded-xl bg-black/10 flex items-center justify-center shrink-0 text-xs font-black">
                        {badges[idx]}
                      </span>
                      <span className="mt-0.5 leading-snug">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Answer Feedback & Explanation */}
              {isAnswerSubmitted && (
                <div
                  className={`p-4 rounded-2xl border-2 flex items-start gap-3 text-xs md:text-sm ${
                    selectedOption === currentQ.correctIndex
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-rose-50 border-rose-300 text-rose-900'
                  }`}
                >
                  {selectedOption === currentQ.correctIndex ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-bold">
                      {selectedOption === currentQ.correctIndex
                        ? 'ถูกต้องแล้วจ้า เก่งมาก! 🎉'
                        : 'ยังไม่ถูกต้องนะจ๊ะ 💡'}
                    </p>
                    <p className="font-medium">{currentQ.explanation}</p>
                  </div>
                </div>
              )}

              {/* Footer navigation */}
              <div className="flex items-center justify-end pt-2">
                {isAnswerSubmitted && (
                  <button
                    onClick={handleNextQuestion}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-sm shadow-md flex items-center gap-2 transition-transform active:scale-95"
                  >
                    <span>
                      {currentQIndex < QUIZ_QUESTIONS.length - 1 ? 'ข้อถัดไป' : 'ดูผลคะแนนรวม'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Quiz Completed Score Card */
            <div className="text-center py-6 space-y-6">
              <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-orange-500 text-white rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-xl animate-bounce">
                🏆
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-purple-600 uppercase tracking-widest block">
                  สรุปผลการประเมินการเรียนรู้
                </span>
                <h3 className="text-2xl md:text-3xl font-black text-slate-800">
                  ยินดีด้วย! {stats.name}
                </h3>
                <p className="text-slate-600 text-sm font-medium">
                  ทำแบบทดสอบเรื่องการเขียนโปรแกรมสั่งให้ตัวละครทำงานเรียบร้อยแล้ว
                </p>
              </div>

              {/* Big Score Counter */}
              <div className="max-w-xs mx-auto bg-slate-50 border-3 border-purple-200 rounded-3xl p-5 shadow-inner">
                <div className="text-4xl md:text-5xl font-black text-purple-700">
                  {score} <span className="text-xl text-slate-400 font-bold">/ {QUIZ_QUESTIONS.length}</span>
                </div>
                <div className="text-xs font-bold text-slate-500 mt-1">
                  คิดเป็น {Math.round((score / QUIZ_QUESTIONS.length) * 100)}%
                </div>
                <div
                  className={`mt-3 py-1.5 px-3 rounded-xl border text-xs font-black ${
                    getEvaluationTier(score).color
                  }`}
                >
                  ระดับคุณภาพ: {getEvaluationTier(score).label}
                </div>
              </div>

              {/* K-P-A Analysis Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-xl mx-auto">
                <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-3 text-xs">
                  <span className="font-extrabold text-sky-800 block">ด้านความรู้ (K)</span>
                  <p className="text-slate-600 mt-0.5">
                    เข้าใจความหมายของการโค้ดดิ้ง ลำดับขั้นตอน และประโยชน์ของลูป
                  </p>
                </div>
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 text-xs">
                  <span className="font-extrabold text-amber-800 block">ด้านทักษะ (P)</span>
                  <p className="text-slate-600 mt-0.5">
                    จัดเรียงบล็อกวนซ้ำตลอด ตรวจหาและแก้ไขจุดผิด (Debugging) ได้
                  </p>
                </div>
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-3 text-xs">
                  <span className="font-extrabold text-emerald-800 block">ด้านเจตคติ (A)</span>
                  <p className="text-slate-600 mt-0.5">
                    เห็นความสำคัญของลูป และพร้อมช่วยเหลือเพื่อน (Peer Tutoring)
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={onOpenCertificate}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-black text-sm shadow-md flex items-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  <span>พิมพ์เกียรติบัตรรับรอง 🏅</span>
                </button>
                <button
                  onClick={handleRestartQuiz}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>ทำแบบทดสอบใหม่อีกครั้ง</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: DRAG AND DROP SEQUENCING CHALLENGE */}
      {quizMode === 'drag_drop' && (
        <div className="bg-white rounded-3xl border-3 border-sky-200 p-6 shadow-lg space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-sky-100 text-sky-700">
                แบบฝึกหัดทบทวน: เรียงลำดับบล็อกคำสั่ง (Drag & Drop)
              </span>
              <h3 className="text-lg md:text-xl font-black text-slate-800 mt-1">
                {currentDrag.instruction}
              </h3>
              <p className="text-xs text-slate-500">{currentDrag.scenario}</p>
            </div>

            {/* Switch between Challenge 1 and 2 */}
            <div className="flex items-center gap-1.5">
              {DRAG_DROP_CHALLENGES.map((d, idx) => (
                <button
                  key={d.id}
                  onClick={() => {
                    sound.playClick();
                    setDragIndex(idx);
                    setPlacedBlocks([]);
                    setDragFeedback(null);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border-2 transition-all ${
                    dragIndex === idx
                      ? 'bg-sky-500 border-sky-600 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-sky-50'
                  }`}
                >
                  ชุดที่ {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Drag & Drop Canvas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left: Available Blocks Pool */}
            <div className="bg-slate-50 rounded-2xl border-2 border-slate-200 p-4 space-y-3">
              <h4 className="font-bold text-slate-800 text-xs flex items-center justify-between">
                <span>คลังบล็อกคำสั่ง (คลิกเพื่อนำไปวาง)</span>
                <span className="text-slate-400 font-normal">คลิกเลือก</span>
              </h4>
              <div className="space-y-2">
                {currentDrag.availableBlocks.map((b) => {
                  const isUsed = placedBlocks.includes(b.label);
                  return (
                    <button
                      key={b.id}
                      onClick={() => handleAddDragBlock(b.label)}
                      disabled={isUsed}
                      className={`w-full p-3 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-between shadow-xs ${
                        b.color
                      } ${isUsed ? 'opacity-40 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'}`}
                    >
                      <span>{b.label}</span>
                      <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">
                        {isUsed ? 'ใส่แล้ว' : '+ วาง'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Target Drop Placement Slot */}
            <div className="bg-sky-50/70 rounded-2xl border-2 border-dashed border-sky-300 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sky-900 text-xs">
                  บล็อกที่จัดเรียง (คลิกเพื่อลบออก)
                </h4>
                <span className="text-[11px] text-sky-700 font-bold">
                  {placedBlocks.length} / {currentDrag.targetSequence.length} บล็อก
                </span>
              </div>

              <div className="space-y-2 min-h-[160px]">
                {placedBlocks.length > 0 ? (
                  placedBlocks.map((label, i) => {
                    const blk = currentDrag.availableBlocks.find((b) => b.label === label);
                    return (
                      <div
                        key={i}
                        onClick={() => handleRemoveDragBlock(label)}
                        className={`p-3 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer flex items-center justify-between hover:opacity-90 transition-all ${
                          blk?.color || 'bg-slate-700'
                        }`}
                        title="คลิกเพื่อลบออกจากลำดับ"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-[10px]">
                            {i + 1}
                          </span>
                          <span>{label}</span>
                        </div>
                        <span className="text-xs">✕</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-32 border-2 border-dashed border-sky-200 rounded-xl flex items-center justify-center text-xs text-sky-600 font-medium text-center p-4">
                    คลิกเลือกบล็อกคำสั่งจากฝั่งซ้าย เพื่อนำมาเรียงลำดับให้ถูกต้อง
                  </div>
                )}
              </div>

              <button
                onClick={handleCheckDragSequence}
                disabled={placedBlocks.length === 0}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md transition-transform active:scale-95"
              >
                ตรวจคำตอบ (Check Answer)
              </button>
            </div>
          </div>

          {/* Feedback */}
          {dragFeedback && (
            <div
              className={`p-4 rounded-2xl border-2 text-xs md:text-sm font-medium flex items-start gap-3 ${
                dragFeedback.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              {dragFeedback.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold">
                  {dragFeedback.success ? 'ยินดีด้วย! ถูกต้องเป๊ะเลย 🎉' : 'ลองดูใหม่อีกนิดนะจ๊ะ 💡'}
                </span>{' '}
                {dragFeedback.message}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
