export type TabType = 'lessons' | 'video' | 'game' | 'quiz' | 'teacher';

export interface LessonSection {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  content: {
    summary: string;
    keyPoints: string[];
    comparison?: {
      title: string;
      badWay: { label: string; blocks: string[]; note: string };
      goodWay: { label: string; blocks: string[]; note: string };
    };
    unpluggedActivity?: {
      title: string;
      roles: { programmer: string; robot: string };
      steps: string[];
      tip: string;
    };
    interactiveDemo?: string;
  };
}

export type BlockCategory = 'event' | 'control' | 'motion' | 'action';

export interface CodeBlock {
  id: string;
  type: string;
  label: string;
  category: BlockCategory;
  color: string;
  icon: string;
  hasChildren?: boolean;
  children?: CodeBlock[];
  param?: number | string;
}

export interface GameMission {
  id: number;
  title: string;
  description: string;
  hint: string;
  gridSize: { width: number; height: number };
  startPos: { x: number; y: number; dir: 'right' | 'down' | 'left' | 'up' };
  targetPos: { x: number; y: number }[];
  obstacles?: { x: number; y: number }[];
  availableBlocks: CodeBlock[];
  initialBlocks?: CodeBlock[];
  targetIsLoop?: boolean;
  minLoops?: number;
  buggyCode?: CodeBlock[];
  mode: 'path' | 'loop' | 'debug' | 'free';
}

export interface QuizQuestion {
  id: number;
  question: string;
  codeIllustration?: {
    type: 'block' | 'compare' | 'flow';
    blocks: string[];
    caption?: string;
  };
  options: string[];
  correctIndex: number;
  explanation: string;
  kpaCategory: 'K' | 'P' | 'A';
}

export interface DragDropChallenge {
  id: number;
  instruction: string;
  scenario: string;
  targetSequence: string[];
  availableBlocks: { id: string; label: string; color: string }[];
  explanation: string;
}

export interface StudentStats {
  name: string;
  avatar: string;
  stars: number;
  completedLessons: string[];
  completedMissions: number[];
  quizScore: number;
  quizTotal: number;
  passedQuiz: boolean;
}
