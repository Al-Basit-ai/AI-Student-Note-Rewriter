export interface DocumentItem {
  id: string;
  title: string;
  category: string;
  tags: string[];
  lastModified: string;
  rawText: string;
  synthesizedText?: string;
  revision: string;
  diffStats?: {
    additions: number;
    deletions: number;
  };
}

export type SynthesisMode = 
  | 'technical_rewrite'
  | 'eli5'
  | 'memo'
  | 'flashcards'
  | 'latex_math'
  | 'custom';

export interface DiffLine {
  type: 'same' | 'removed' | 'added';
  text: string;
}

export interface Flashcard {
  id: string;
  documentId: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  masteryLevel: 'new' | 'review' | 'mastered';
  lastStudied?: string;
  repetitions: number;
}

export interface GraphNode {
  id: string;
  label: string;
  category: string;
  x: number;
  y: number;
  documentId: string;
  connections: string[];
}

export type ViewMode = 'studio' | 'flashcards' | 'graph' | 'focus';
