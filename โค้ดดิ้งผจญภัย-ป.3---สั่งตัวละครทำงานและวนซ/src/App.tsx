import React, { useState, useEffect } from 'react';
import { TabType, StudentStats } from './types';
import { Header } from './components/Header';
import { LessonView } from './components/LessonView';
import { VideoView } from './components/VideoView';
import { GameView } from './components/GameView';
import { QuizView } from './components/QuizView';
import { CertificateModal } from './components/CertificateModal';
import { TeacherPlanModal } from './components/TeacherPlanModal';
import { CURRICULUM_INFO } from './data/curriculumData';
import { sound } from './utils/audio';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('lessons');
  const [isCertificateOpen, setIsCertificateOpen] = useState<boolean>(false);
  const [isTeacherPlanOpen, setIsTeacherPlanOpen] = useState<boolean>(false);

  // Student stats with local storage persistence
  const [stats, setStats] = useState<StudentStats>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('coding_p3_stats');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    return {
      name: 'น้องต้นกล้า ป.3/1',
      avatar: 'robot',
      stars: 3,
      completedLessons: [],
      completedMissions: [],
      quizScore: 0,
      quizTotal: 10,
      passedQuiz: false,
    };
  });

  // Save stats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('coding_p3_stats', JSON.stringify(stats));
    } catch {
      // ignore
    }
  }, [stats]);

  const handleEarnStar = () => {
    setStats((prev) => ({
      ...prev,
      stars: prev.stars + 1,
    }));
  };

  const handleUpdateName = (name: string) => {
    setStats((prev) => ({
      ...prev,
      name,
    }));
  };

  const handleUpdateStats = (newStats: Partial<StudentStats>) => {
    setStats((prev) => ({
      ...prev,
      ...newStats,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/50 text-slate-800">
      {/* Header with Navigation & Profile */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        stats={stats}
        onUpdateName={handleUpdateName}
        onOpenTeacherPlan={() => setIsTeacherPlanOpen(true)}
      />

      {/* Main Learning Hub */}
      <main className="flex-1 pb-16">
        {activeTab === 'lessons' && (
          <LessonView
            onEarnStar={handleEarnStar}
            onGoToGame={() => setActiveTab('game')}
            onGoToVideo={() => setActiveTab('video')}
          />
        )}

        {activeTab === 'video' && (
          <VideoView
            onEarnStar={handleEarnStar}
            onGoToGame={() => setActiveTab('game')}
          />
        )}

        {activeTab === 'game' && (
          <GameView
            onEarnStar={handleEarnStar}
            onOpenCertificate={() => setIsCertificateOpen(true)}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizView
            stats={stats}
            onUpdateStats={handleUpdateStats}
            onOpenCertificate={() => setIsCertificateOpen(true)}
            onEarnStar={handleEarnStar}
          />
        )}
      </main>

      {/* Cheerful Footer */}
      <footer className="bg-white border-t-3 border-amber-200 py-6 px-4 text-center text-xs text-slate-500 space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-3 font-semibold text-slate-700">
          <span>{CURRICULUM_INFO.subject}</span>
          <span>•</span>
          <span>{CURRICULUM_INFO.grade}</span>
          <span>•</span>
          <span>ครูผู้สอน: {CURRICULUM_INFO.teacherName}</span>
        </div>
        <p className="text-slate-400 max-w-xl mx-auto">
          สื่อการเรียนการสอนนี้พัฒนาตามมาตรฐาน ว 4.2 ตัวชี้วัด ป.3/2 การเขียนโปรแกรมอย่างง่ายและตรวจหาข้อผิดพลาด
          เพื่อส่งเสริมการคิดเชิงคำนวณ (Computational Thinking) สำหรับเด็กประถมศึกษา
        </p>
        <div className="pt-1 text-[11px] text-amber-700 font-bold">
          🎉 สดใส เข้าใจง่าย สนุกสนานกับการโค้ดดิ้ง! 🤖✨
        </div>
      </footer>

      {/* Printable Certificate Modal */}
      <CertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        stats={stats}
      />

      {/* Teacher Lesson Plan & Assessment Rubric Modal */}
      <TeacherPlanModal
        isOpen={isTeacherPlanOpen}
        onClose={() => setIsTeacherPlanOpen(false)}
      />
    </div>
  );
}
