import React, { useState } from 'react';
import { CURRICULUM_INFO } from '../data/curriculumData';
import { X, BookOpen, CheckSquare, Users, FileText, Award } from 'lucide-react';
import { sound } from '../utils/audio';

interface TeacherPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherPlanModal: React.FC<TeacherPlanModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'plan' | 'rubric' | 'behavior'>('plan');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border-4 border-rose-300 overflow-hidden my-8 max-h-[90vh] flex flex-col animate-scale-in">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
              📋
            </div>
            <div>
              <h3 className="text-base md:text-lg font-black leading-tight">
                แผนการจัดการเรียนรู้ & แบบประเมิน (Assessment Form)
              </h3>
              <p className="text-xs text-rose-100">
                ครูผู้สอน: {CURRICULUM_INFO.teacherName} • {CURRICULUM_INFO.grade}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 text-white/80 hover:text-white rounded-xl bg-white/10 hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 flex items-center gap-2 text-xs font-bold">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('plan');
            }}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'plan'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-800 hover:bg-rose-100'
            }`}
          >
            1. สรุปแผนการจัดการเรียนรู้
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('rubric');
            }}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'rubric'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-800 hover:bg-rose-100'
            }`}
          >
            2. รูบริกส์ประเมินผล K-P-A
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('behavior');
            }}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'behavior'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-800 hover:bg-rose-100'
            }`}
          >
            3. แบบสังเกตพฤติกรรมกลุ่ม
          </button>
        </div>

        {/* Modal Body with scroll */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-xs md:text-sm">
          {/* TAB 1: LESSON PLAN DETAILS */}
          {activeTab === 'plan' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 space-y-2">
                <div className="font-extrabold text-amber-900 text-sm">
                  📌 ข้อมูลหน่วยการเรียนรู้
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div><strong>กลุ่มสาระ:</strong> {CURRICULUM_INFO.subject}</div>
                  <div><strong>ระดับชั้น:</strong> {CURRICULUM_INFO.grade}</div>
                  <div><strong>หน่วยการเรียนรู้:</strong> {CURRICULUM_INFO.unit}</div>
                  <div><strong>เวลา:</strong> 1 ชั่วโมง (Online 25 นาที : Onsite 35 นาที)</div>
                  <div className="sm:col-span-2"><strong>ตัวชี้วัด:</strong> {CURRICULUM_INFO.indicator}</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-800 text-sm">
                  🎯 จุดประสงค์การเรียนรู้ (K-P-A)
                </h4>
                <div className="space-y-2">
                  {CURRICULUM_INFO.kpaObjectives.map((obj, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5"
                    >
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-xs shrink-0">
                        {obj.code}
                      </span>
                      <span>{obj.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-800 text-sm">
                  🔄 รูปแบบการจัดกิจกรรม (Blended Learning)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-sky-50 border border-sky-200 p-3.5 rounded-xl space-y-1.5">
                    <div className="font-bold text-sky-900">💻 ชั่วโมงที่ 1 Online (25 นาที)</div>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600">
                      <li>ขั้นนำ (5 นาที): ดูวิดีโออนิเมชัน 3 นาที + ตอบคำถามสั้นๆ ทบทวนลำดับเส้นตรง</li>
                      <li>ขั้นนำสอน (10 นาที): อธิบาย Forever Loop เปรียบเทียบ 10 บล็อก vs 1 ลูป</li>
                      <li>ขั้นสรุป (10 นาที): แบบฝึกหัดลากวาง (Drag & Drop) บล็อกคำสั่งจำลองเพื่อคัดกรองนักเรียน</li>
                    </ul>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl space-y-1.5">
                    <div className="font-bold text-emerald-900">🏫 ชั่วโมงที่ 2 Onsite (35 นาที)</div>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600">
                      <li>ขั้นนำ (10 นาที): Unplugged "หุ่นยนต์ทำซ้ำ" ถือบัตรคำสั่งลูปและท่าทาง</li>
                      <li>ขั้นนำสอน (20 นาที): ลงมือปฏิบัติบนคอมพิวเตอร์/แท็บเล็ต ผ่าน Scratch/Code.org</li>
                      <li>ขั้นสรุป (10 นาที): สรุปประโยชน์ของลูป นำเสนอผลงาน และบันทึกส่งงาน</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: K-P-A RUBRIC TABLE */}
          {activeTab === 'rubric' && (
            <div className="space-y-4">
              <div className="overflow-x-auto border-2 border-slate-200 rounded-2xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-rose-100 text-rose-900 font-bold border-b border-rose-200">
                    <tr>
                      <th className="p-3">ประเด็นการประเมิน</th>
                      <th className="p-3 bg-emerald-100 text-emerald-900">ดี (3 คะแนน)</th>
                      <th className="p-3 bg-sky-100 text-sky-900">พอใช้ (2 คะแนน)</th>
                      <th className="p-3 bg-rose-100 text-rose-900">ปรับปรุง (1 คะแนน)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-3 font-bold bg-slate-50">1. การอธิบายขั้นตอนการเขียนโปรแกรมวนซ้ำ (K)</td>
                      <td className="p-3">อธิบายการทำงานของบล็อก Forever Loop และการจัดลำดับโปรแกรมได้อย่างถูกต้อง ครบถ้วน ชัดเจน</td>
                      <td className="p-3">อธิบายการทำงานได้ถูกต้องเป็นส่วนใหญ่ โดยมีครูคอยใบ้หรือแนะนำบางส่วน</td>
                      <td className="p-3">ยังไม่สามารถอธิบายขั้นตอนได้ หรืออธิบายไม่ถูกต้องแม้มีคำแนะนำ</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold bg-slate-50">2. การเขียนโปรแกรมสั่งให้ตัวละครทำงานซ้ำไม่สิ้นสุด (P)</td>
                      <td className="p-3">เลือกและวางบล็อก Forever Loop สั่งให้ตัวละครทำงานซ้ำได้ถูกต้อง แก้ไขบั๊ก (Debug) ได้ด้วยตนเอง</td>
                      <td className="p-3">วางบล็อก Forever Loop สั่งทำงานซ้ำได้สำเร็จตามโจทย์ โดยอาศัยคำแนะนำจากครูหรือเพื่อน</td>
                      <td className="p-3">ไม่สามารถต่อบล็อกคำสั่งให้ทำงานซ้ำได้ หรือโปรแกรมไม่ทำงานตามโจทย์</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold bg-slate-50">3. การเห็นประโยชน์ของคำสั่งลูปและความตื่นตัว (A)</td>
                      <td className="p-3">ระบุประโยชน์ของลูปช่วยลดขั้นตอนคำสั่งชัดเจน มีความกระตือรือร้น และช่วยเหลือเพื่อน (Peer Tutor)</td>
                      <td className="p-3">บอกประโยชน์ของคำสั่งลูปได้ ตั้งใจทำกิจกรรมและร่วมมือในการทำงานกลุ่มเป็นอย่างดี</td>
                      <td className="p-3">ไม่เห็นความสำคัญของการใช้คำสั่งลูป ขาดความตั้งใจ หรือไม่ค่อยให้ความร่วมมือ</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Quality Criteria */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-700">เกณฑ์การตัดสินคุณภาพ:</span>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">7-9 คะแนน: ดีมาก</span>
                  <span className="text-sky-700 bg-sky-100 px-3 py-1 rounded-full">5-6 คะแนน: ดี</span>
                  <span className="text-rose-700 bg-rose-100 px-3 py-1 rounded-full">1-4 คะแนน: ปรับปรุง</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GROUP BEHAVIOR OBSERVATION */}
          {activeTab === 'behavior' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                แบบสังเกตพฤติกรรมการทำงานกลุ่ม (คำชี้แจง: ให้ผู้สอนสังเกตพฤติกรรมของนักเรียนในการทำงานรายบุคคล/กลุ่ม รวม 15 คะแนน)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border rounded-xl">
                  <span className="font-bold block text-slate-800">1. ความมีวินัย (3 คะแนน)</span>
                  <span className="text-slate-500">ปฏิบัติตามกติกาในห้องเรียนและการใช้งานคอมพิวเตอร์อย่างระมัดระวัง</span>
                </div>
                <div className="p-3 bg-slate-50 border rounded-xl">
                  <span className="font-bold block text-slate-800">2. ความมีน้ำใจเอื้อเฟื้อเสียสละ (3 คะแนน)</span>
                  <span className="text-slate-500">มีน้ำใจเป็นพี่เลี้ยง (Peer Tutor) ช่วยเพื่อนที่ยังสับสนเรื่องขั้นตอน</span>
                </div>
                <div className="p-3 bg-slate-50 border rounded-xl">
                  <span className="font-bold block text-slate-800">3. การแสดงความคิดเห็น (3 คะแนน)</span>
                  <span className="text-slate-500">กล้าคิด กล้าตอบคำถาม และนำเสนอแนวคิดการแก้ปัญหาโค้ดดิ้ง</span>
                </div>
                <div className="p-3 bg-slate-50 border rounded-xl">
                  <span className="font-bold block text-slate-800">4. การรับฟังความคิดเห็น (3 คะแนน)</span>
                  <span className="text-slate-500">เปิดใจรับฟังข้อเสนอแนะในการ Debugging ข้อผิดพลาดจากครูและเพื่อน</span>
                </div>
                <div className="p-3 bg-slate-50 border rounded-xl sm:col-span-2">
                  <span className="font-bold block text-slate-800">5. การร่วมมือทำงานส่วนรวม (3 คะแนน)</span>
                  <span className="text-slate-500">ร่วมกิจกรรม Unplugged หุ่นยนต์ทำซ้ำ และเก็บอุปกรณ์เรียบร้อย</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
