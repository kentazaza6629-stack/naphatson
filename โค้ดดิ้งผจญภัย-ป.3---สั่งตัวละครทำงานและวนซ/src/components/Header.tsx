import React, { useState } from 'react';
import { TabType, StudentStats } from '../types';
import { BookOpen, PlayCircle, Gamepad2, Award, FileText, Volume2, VolumeX, Sparkles, User, Star } from 'lucide-react';
import { sound } from '../utils/audio';
import { speech } from '../utils/speech';

interface HeaderProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  stats: StudentStats;
  onUpdateName: (name: string) => void;
  onOpenTeacherPlan: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  stats,
  onUpdateName,
  onOpenTeacherPlan,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);
  const [speechEnabled, setSpeechEnabled] = useState(speech.enabled);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(stats.name);

  const toggleSound = () => {
    const next = !soundEnabled;
    sound.enabled = next;
    setSoundEnabled(next);
    if (next) sound.playClick();
  };

  const toggleSpeech = () => {
    const next = !speechEnabled;
    speech.enabled = next;
    setSpeechEnabled(next);
    if (next) {
      sound.playClick();
      speech.speak('เปิดเสียงอ่านบรรยายเรียบร้อยแล้วค่ะ');
    } else {
      speech.stop();
    }
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      onUpdateName(tempName.trim());
      setIsEditingName(false);
      sound.playSuccess();
    }
  };

  const navItems: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }>; color: string; badge?: string }[] = [
    { id: 'lessons', label: '1. เนื้อหาบทเรียน', icon: BookOpen, color: 'bg-emerald-500 hover:bg-emerald-600' },
    { id: 'video', label: '2. วิดีโออนิเมชัน', icon: PlayCircle, color: 'bg-sky-500 hover:bg-sky-600', badge: '3 นาที' },
    { id: 'game', label: '3. เกมบล็อกโค้ดดิ้ง', icon: Gamepad2, color: 'bg-amber-500 hover:bg-amber-600', badge: 'Scratch' },
    { id: 'quiz', label: '4. แบบทดสอบทบทวน', icon: Award, color: 'bg-pink-500 hover:bg-pink-600', badge: 'มีเกียรติบัตร' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-4 border-amber-300 shadow-md">
      {/* Top Banner with Rainbow Wave */}
      <div className="h-2 w-full bg-gradient-to-r from-pink-400 via-amber-300 via-emerald-400 to-sky-400" />

      <div className="max-w-7xl mx-auto px-4 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Grade Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-pink-500 flex items-center justify-center text-white shadow-md shadow-orange-200 transform -rotate-3 hover:rotate-0 transition-transform">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  วิทยาการคำนวณ ป.3
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300 hidden sm:inline-block">
                  ว 4.2 ป.3/2
                </span>
              </div>
              <h1 className="text-lg md:text-xl font-black text-slate-800 tracking-tight leading-tight flex items-center gap-1">
                โค้ดดิ้งผจญภัย
                <span className="text-orange-500">: สั่งตัวละครทำงานวนซ้ำ</span>
              </h1>
            </div>
          </div>

          {/* Student Profile & Stars & Audio Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Stars Collected */}
            <div className="flex items-center gap-1.5 bg-amber-50 border-2 border-amber-300 px-3 py-1 rounded-2xl text-amber-900 shadow-xs font-bold">
              <Star className="w-5 h-5 fill-amber-400 text-amber-500 animate-spin-slow" />
              <span className="text-sm md:text-base">{stats.stars}</span>
              <span className="text-xs text-amber-700 hidden sm:inline">ดวงดาว</span>
            </div>

            {/* Student Name */}
            <div className="relative">
              {isEditingName ? (
                <form onSubmit={handleSaveName} className="flex items-center gap-1">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="พิมพ์ชื่อน้อง..."
                    maxLength={25}
                    autoFocus
                    className="w-32 sm:w-40 px-2 py-1 text-sm border-2 border-orange-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                  />
                  <button
                    type="submit"
                    className="px-2 py-1 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600"
                  >
                    บันทึก
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100 border-2 border-sky-300 px-2.5 py-1 rounded-2xl text-slate-700 transition-colors text-xs sm:text-sm font-semibold"
                  title="คลิกเพื่อแก้ไขชื่อนักเรียนสำหรับพิมพ์บนเกียรติบัตร"
                >
                  <User className="w-4 h-4 text-sky-600" />
                  <span className="max-w-[100px] truncate">{stats.name}</span>
                </button>
              )}
            </div>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-xl border-2 transition-all ${
                soundEnabled
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                  : 'bg-slate-100 border-slate-300 text-slate-400'
              }`}
              title={soundEnabled ? 'ปิดเสียงเอฟเฟกต์' : 'เปิดเสียงเอฟเฟกต์'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Speech Narrator Toggle */}
            <button
              onClick={toggleSpeech}
              className={`px-2 py-1 rounded-xl border-2 transition-all text-xs font-bold flex items-center gap-1 ${
                speechEnabled
                  ? 'bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100'
                  : 'bg-slate-100 border-slate-300 text-slate-400'
              }`}
              title={speechEnabled ? 'ปิดเสียงอ่านบรรยาย' : 'เปิดเสียงอ่านบรรยายภาษาไทย'}
            >
              <span>🗣️</span>
              <span className="hidden md:inline">{speechEnabled ? 'เสียงอ่าน: เปิด' : 'เสียงอ่าน: ปิด'}</span>
            </button>

            {/* Teacher Plan & Rubric Button */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenTeacherPlan();
              }}
              className="px-2.5 py-1.5 bg-rose-50 border-2 border-rose-300 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors flex items-center gap-1"
              title="แผนการจัดการเรียนรู้และแบบประเมิน ครูนภัสสร มากมูล"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">แผนการสอน & รูบริกส์</span>
              <span className="lg:hidden">แผนครู</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex items-center gap-1.5 md:gap-2 mt-2.5 overflow-x-auto pb-1 scrollbar-none">
          {navItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  onSelectTab(tab.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all shadow-xs border-2 ${
                  isActive
                    ? `${tab.color} text-white border-transparent shadow-md scale-[1.02]`
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                      isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
