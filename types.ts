
import { ReactNode } from "react";

// -- Visual States --
export type VisualType = 'waveform' | 'cartesian' | 'algebra' | 'sequence';

export interface BaseVisualState {
  type: VisualType;
  isPlaying?: boolean;
}

export interface WaveformVisualState extends BaseVisualState {
  type: 'waveform';
  amplitude: number;
  frequency: number;
  showTimeAxis?: boolean;
  showDisplacementAxis?: boolean;
  highlightPoint?: boolean;
}

export interface Plot {
    fn: (x: number) => number;
    color: string;
    width?: number;
    label?: string;
    labelX?: number; // Specific X coordinate to place the label
}

export interface CartesianVisualState extends BaseVisualState {
  type: 'cartesian';
  plots: Plot[];
  highlightPoints?: Array<{ x: number; y?: number; label?: string; color?: string; animation?: 'pulse' }>;
  showSlopeAt?: { x: number, plotIndex: number };
  domain?: [number, number];
  range?: [number, number];
  introAnimation?: boolean;
  showHoverCoordinates?: boolean;
  // Interaction for picking a point
  interaction?: {
      type: 'pick-point';
      target: { x: number; y: number; tolerance?: number };
      successMessage: string;
  }
}

// Enhanced Algebra types for rich interaction
export type AlgebraTerm = 
  | { type: 'text', value: string, animation?: 'fade-out' | 'slide-out-left' | 'fly-in' }
  | { type: 'highlight', value: string, color?: string, animation?: 'pulse' | 'fly-in' | 'fade-out' | 'slide-in-top' | 'slide-out-left' }
  | { type: 'draggable', id: string, value: string, color?: string }
  | { type: 'drop-target', id: string, value: string, accepts?: string[] } // 'value' here is the placeholder text before drop
  | { type: 'input', id: string, correctValue: string, placeholder?: string };

export type EquationLine = AlgebraTerm[];

export interface AlgebraChoice {
    id: string;
    text: string;
    isCorrect: boolean;
    feedback?: string;
}

export interface AlgebraSequenceFrame {
    richEquations: EquationLine[];
    annotation?: string;
    duration?: number; // ms to hold this frame before next
}

export interface AlgebraInteraction {
  type: 'drag-drop' | 'choice' | 'fill-input' | 'command-input';
  title?: string;
  choices?: AlgebraChoice[];
  // For drag-drop, what to show after success
  solvedEquations?: EquationLine[];
  successAnnotation?: string;
  onDragComplete?: () => void;

  // For command-input
  correctCommand?: string;
  commandPrompt?: string;

  // Chaining
  nextInteraction?: AlgebraInteraction;
}

export interface AlgebraVisualState extends BaseVisualState {
    type: 'algebra';
    // Single state mode
    richEquations?: EquationLine[];
    annotation?: string;
    
    // Sequence mode for auto-animations
    sequence?: AlgebraSequenceFrame[];

    // Legacy simple string support
    equations?: string[];
    highlightTerm?: string; 
    
    // Interactive modes
  interaction?: AlgebraInteraction;
}

export type AnySingleVisualState = WaveformVisualState | CartesianVisualState | AlgebraVisualState;

export interface SequenceVisualState extends BaseVisualState {
  type: 'sequence';
  sequence: Array<{
    duration: number;
    state: AnySingleVisualState;
  }>;
}

export type AnyVisualState = AnySingleVisualState | SequenceVisualState;

// -- Lesson Structure --

export interface QuizQuestion {
  question: string;
  options: Array<{ id: number; text: string; correct: boolean; explanation?: string }>;
}

export interface LessonStep {
  id: string;
  content: ReactNode;
  visualState: AnyVisualState;
}

export interface LessonDefinition {
  id: string;
  title: string;
  description: string;
  steps: LessonStep[];
  quiz: QuizQuestion;
}