import React from 'react';
import { StudentStats } from '../types';
import { CURRICULUM_INFO } from '../data/curriculumData';
import { sound } from '../utils/audio';
import { X, Printer, Award, Sparkles, CheckCircle } from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: StudentStats;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ isOpen, onClose, stats }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  const today = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border-4 border-amber-300 overflow-hidden relative animate-scale-in my-8">
        {/* Modal Top Action Bar (Hidden in print) */}
        <div className="bg-amber-50 p-3.5 border-b border-amber-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
            <Award className="w-5 h-5 text-amber-600" />
            <span>เกียรติบัตรนักเขียนโปรแกรมตัวจิ๋ว ป.3</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์ / บันทึก PDF</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Sheet */}
        <div className="p-8 sm:p-12 text-center relative bg-gradient-to-b from-amber-50/40 via-white to-orange-50/30 border-8 border-double border-amber-400 m-3 rounded-2xl shadow-inner print:m-0 print:border-8">
          {/* Corner Ribbon Embellishments */}
          <div className="absolute top-3 left-3 text-amber-400 text-xl font-serif">⚜️</div>
          <div className="absolute top-3 right-3 text-amber-400 text-xl font-serif">⚜️</div>
          <div className="absolute bottom-3 left-3 text-amber-400 text-xl font-serif">⚜️</div>
          <div className="absolute bottom-3 right-3 text-amber-400 text-xl font-serif">⚜️</div>

          {/* Certificate Header */}
          <div className="space-y-2 mb-6">
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-2xl mx-auto flex items-center justify-center text-white shadow-md text-3xl">
              🏆
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-amber-900 tracking-tight">
              เกียรติบัตรการเรียนรู้
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-widest">
              Certificate of Coding Achievement • Grade 3
            </p>
          </div>

          {/* Recipient */}
          <div className="space-y-3 my-6">
            <p className="text-xs sm:text-sm text-slate-600 font-medium">เกียรติบัตรฉบับนี้ให้ไว้เพื่อแสดงว่า</p>
            <div className="text-2xl sm:text-3xl font-black text-orange-600 border-b-2 border-orange-300 pb-2 inline-block px-8 min-w-[240px]">
              {stats.name || 'เด็กดี มีวินัย'}
            </div>
            <p className="text-xs sm:text-sm text-slate-700 font-medium max-w-lg mx-auto leading-relaxed">
              ได้ผ่านการเรียนรู้และการประเมินผลกลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี
              <br />
              <strong className="text-slate-900 font-bold">
                หน่วยที่ 2: การเขียนโปรแกรมสั่งให้ตัวละครทำงาน และการวนซ้ำ (Forever Loop)
              </strong>
              <br />
              ตามมาตรฐาน ว 4.2 ตัวชี้วัด ป.3/2 ด้วยความตั้งใจและมีทักษะการคิดเชิงคำนวณยอดเยี่ยม
            </p>
          </div>

          {/* Seal & Signatures */}
          <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t border-dashed border-amber-200 items-end">
            <div className="text-center space-y-1">
              <div className="w-14 h-14 rounded-full border-4 border-amber-400 bg-amber-100 flex items-center justify-center text-amber-800 text-xs font-black mx-auto shadow-sm">
                ป.3/2 ⭐
              </div>
              <p className="text-[11px] font-bold text-slate-500 mt-2">
                คะแนนแบบทดสอบ: {stats.quizScore} / {stats.quizTotal || 10}
              </p>
              <p className="text-[10px] text-slate-400">วันที่ออกเกียรติบัตร: {today}</p>
            </div>

            <div className="text-center space-y-1">
              <div className="font-['Itim',cursive] text-lg text-slate-800 font-bold">
                นภัสสร มากมูล
              </div>
              <div className="w-36 h-0.5 bg-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-800">
                ({CURRICULUM_INFO.teacherName})
              </p>
              <p className="text-[11px] text-slate-500">ครูผู้สอน / ผู้จัดการเรียนรู้</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
