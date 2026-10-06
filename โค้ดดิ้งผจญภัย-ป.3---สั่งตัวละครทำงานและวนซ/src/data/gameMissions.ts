import { GameMission, CodeBlock } from '../types';

export const STANDARD_BLOCKS: CodeBlock[] = [
  {
    id: 'flag',
    type: 'event_flag',
    label: 'เมื่อคลิกธงเขียว 🚩',
    category: 'event',
    color: 'bg-amber-500 hover:bg-amber-600 text-white',
    icon: 'Flag',
  },
  {
    id: 'forever',
    type: 'control_forever',
    label: '🔄 วนซ้ำตลอด (Forever)',
    category: 'control',
    color: 'bg-orange-500 hover:bg-orange-600 text-white',
    icon: 'Repeat',
    hasChildren: true,
  },
  {
    id: 'repeat_4',
    type: 'control_repeat',
    label: '🔁 ทำซ้ำ 4 รอบ',
    category: 'control',
    color: 'bg-amber-600 hover:bg-amber-700 text-white',
    icon: 'RefreshCw',
    hasChildren: true,
    param: 4,
  },
  {
    id: 'move_forward',
    type: 'motion_move',
    label: 'เดินหน้า 1 ก้าว ➡️',
    category: 'motion',
    color: 'bg-sky-500 hover:bg-sky-600 text-white',
    icon: 'ArrowRight',
  },
  {
    id: 'turn_right',
    type: 'motion_turn_right',
    label: 'หันขวา 90° ↩️',
    category: 'motion',
    color: 'bg-blue-600 hover:bg-blue-700 text-white',
    icon: 'RotateCw',
  },
  {
    id: 'turn_left',
    type: 'motion_turn_left',
    label: 'หันซ้าย 90° ↪️',
    category: 'motion',
    color: 'bg-blue-500 hover:bg-blue-600 text-white',
    icon: 'RotateCcw',
  },
  {
    id: 'jump',
    type: 'action_jump',
    label: 'กระโดดดึ๋ง 🦘',
    category: 'action',
    color: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    icon: 'Zap',
  },
  {
    id: 'clap',
    type: 'action_clap',
    label: 'ตบมือ แปะๆ 👏',
    category: 'action',
    color: 'bg-purple-500 hover:bg-purple-600 text-white',
    icon: 'Smile',
  },
  {
    id: 'say_hello',
    type: 'action_say',
    label: 'พูด "สวัสดี!" 💬',
    category: 'action',
    color: 'bg-pink-500 hover:bg-pink-600 text-white',
    icon: 'MessageSquare',
  },
];

export const GAME_MISSIONS: GameMission[] = [
  {
    id: 1,
    title: 'ด่านที่ 1: ก้าวแรกของโรโบ้ ⭐',
    description: 'สั่งให้เจ้าโรโบ้เดินหน้า 3 ก้าว เพื่อไปเก็บดวงดาวที่ปลายทาง!',
    hint: 'เริ่มด้วย [เมื่อคลิกธงเขียว] แล้วต่อด้วย [เดินหน้า 1 ก้าว] จำนวน 3 ครั้ง',
    gridSize: { width: 5, height: 3 },
    startPos: { x: 0, y: 1, dir: 'right' },
    targetPos: [{ x: 3, y: 1 }],
    availableBlocks: [
      STANDARD_BLOCKS[0], // flag
      STANDARD_BLOCKS[3], // move
      STANDARD_BLOCKS[6], // jump
    ],
    mode: 'path',
  },
  {
    id: 2,
    title: 'ด่านที่ 2: วนซ้ำตลอดรอบห้อง (Forever Loop) 🔄',
    description: 'สั่งให้โรโบ้เดินวนเป็นสี่เหลี่ยมรอบห้องเพื่อเก็บดาวทั้ง 4 มุมโดยใช้บล็อก [วนซ้ำตลอด]!',
    hint: 'วางบล็อก [วนซ้ำตลอด] แล้วใส่ [เดินหน้า 1 ก้าว] และ [หันขวา 90°] ไว้ด้านใน เพื่อให้เดินวนไม่รู้จบ!',
    gridSize: { width: 4, height: 4 },
    startPos: { x: 1, y: 1, dir: 'right' },
    targetPos: [
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 1, y: 1 },
    ],
    availableBlocks: [
      STANDARD_BLOCKS[0], // flag
      STANDARD_BLOCKS[1], // forever
      STANDARD_BLOCKS[3], // move
      STANDARD_BLOCKS[4], // turn right
    ],
    targetIsLoop: true,
    minLoops: 2,
    mode: 'loop',
  },
  {
    id: 3,
    title: 'ด่านที่ 3: หุ่นยนต์แดนซ์เซอร์ ตบมือไม่รู้จบ! 🕺',
    description: 'ฝึกซ้อมท่าเต้นให้โรโบ้: ให้โรโบ้กระโดดและตบมือวนซ้ำตลอดเวลา!',
    hint: 'นำบล็อก [กระโดดดึ๋ง] และ [ตบมือ แปะๆ] ใส่เข้าไปข้างในบล็อก [วนซ้ำตลอด] แล้วกดเล่น',
    gridSize: { width: 3, height: 3 },
    startPos: { x: 1, y: 1, dir: 'down' },
    targetPos: [{ x: 1, y: 1 }],
    availableBlocks: [
      STANDARD_BLOCKS[0], // flag
      STANDARD_BLOCKS[1], // forever
      STANDARD_BLOCKS[6], // jump
      STANDARD_BLOCKS[7], // clap
      STANDARD_BLOCKS[8], // say
    ],
    targetIsLoop: true,
    minLoops: 3,
    mode: 'loop',
  },
  {
    id: 4,
    title: 'ด่านที่ 4: นักสืบจับบั๊ก (Debugging Challenge) 🐛🔍',
    description: 'ช่วยด้วย! โปรแกรมเดิมมีข้อผิดพลาด โรโบ้เลี้ยวผิดทิศทางจนเกือบตกน้ำ ช่วยแก้ไขให้ถูกต้อง!',
    hint: 'ลองสังเกตดูว่ามีบล็อก [หันซ้าย] ผิดอันอยู่หรือเปล่า ให้ลบออกแล้วแทนที่ด้วยบล็อก [หันขวา] หรือจัดลำดับใหม่',
    gridSize: { width: 4, height: 4 },
    startPos: { x: 0, y: 1, dir: 'right' },
    targetPos: [
      { x: 2, y: 1 },
      { x: 2, y: 3 },
    ],
    obstacles: [
      { x: 1, y: 0 },
      { x: 3, y: 1 },
    ],
    availableBlocks: [
      STANDARD_BLOCKS[0],
      STANDARD_BLOCKS[3], // move
      STANDARD_BLOCKS[4], // turn right
      STANDARD_BLOCKS[5], // turn left
    ],
    buggyCode: [
      { ...STANDARD_BLOCKS[0], id: 'bug-1' },
      { ...STANDARD_BLOCKS[3], id: 'bug-2' }, // move
      { ...STANDARD_BLOCKS[3], id: 'bug-3' }, // move
      { ...STANDARD_BLOCKS[5], id: 'bug-4' }, // BUG! turn left instead of turn right
      { ...STANDARD_BLOCKS[3], id: 'bug-5' },
    ],
    mode: 'debug',
  },
  {
    id: 5,
    title: 'ด่านที่ 5: สตูดิโอโค้ดดิ้งอิสระ (Free Coding Sandbox) 🎨🚀',
    description: 'ปล่อยจินตนาการเต็มที่! ผสมผสานบล็อกคำสั่งวนซ้ำ การเดิน หมุนตัว ตบมือ และพูดทักทาย!',
    hint: 'ลองสร้างท่าทางให้โรโบ้แบบแปลกใหม่ แล้วกดปุ่มเริ่มทำงานเพื่อดูผลลัพธ์!',
    gridSize: { width: 6, height: 5 },
    startPos: { x: 2, y: 2, dir: 'right' },
    targetPos: [],
    availableBlocks: STANDARD_BLOCKS,
    mode: 'free',
  },
];
