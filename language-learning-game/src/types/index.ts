export interface User {
  id: string;
  username: string;
  email: string;
  nativeLanguage: string;
  learningLanguage: string;
  level: LanguageLevel;
  progress: Progress;
}

export interface Progress {
  vocabulary: number;
  grammar: number;
  speaking: number;
  listening: number;
  overall: number;
}

export type LanguageLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  level: LanguageLevel;
  type: LessonType;
  content: LessonContent[];
  exercises: Exercise[];
}

export type LessonType = 'vocabulary' | 'grammar' | 'speaking' | 'listening';

export interface LessonContent {
  type: 'text' | 'audio' | 'video' | 'image';
  content: string;
  translation?: string;
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

export type ExerciseType = 
  | 'multiple-choice'
  | 'fill-in-blank'
  | 'speaking'
  | 'listening'
  | 'translation'; 