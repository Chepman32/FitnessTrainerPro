// Program and Step type definitions

export type StepType = 'exercise' | 'rest';

export interface BaseStep {
  id: string;
  type: StepType;
  title: string;
  durationSec: number;
}

export interface ExerciseStep extends BaseStep {
  type: 'exercise';
  description?: string;
  icon?: string;
  animationRef?: string; // Reference to Lottie animation or image sequence
  targetReps?: number;
  equipment?: string[];
}

export interface RestStep extends BaseStep {
  type: 'rest';
  title: 'Rest';
  tip?: string; // e.g., "Shake out arms", "Hydrate"
}

export type Step = ExerciseStep | RestStep;

export type ProgramLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Program {
  id: string;
  title: string;
  level: ProgramLevel;
  description?: string;
  totalActiveSec: number; // Sum of exercise step durations
  totalRestSec: number; // Sum of rest step durations
  stepsCount: number;
  tags: string[]; // e.g., ["No equipment", "Upper body", "HIIT"]
  steps: Step[];
  estimatedCalories?: number;
  thumbnailUrl?: string;
  difficulty: number; // 1-5 scale
  createdAt: string;
  updatedAt: string;
}

// Validation utilities
export const validateProgram = (program: Program): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check for zero or negative durations
  program.steps.forEach((step, index) => {
    if (step.durationSec <= 0) {
      errors.push(`Step ${index + 1} (${step.title}) has invalid duration: ${step.durationSec}s`);
    }
  });
  
  // Check if steps count matches
  if (program.steps.length !== program.stepsCount) {
    errors.push(`Steps count mismatch: declared ${program.stepsCount}, actual ${program.steps.length}`);
  }
  
  // Validate totals
  const actualActiveSec = program.steps
    .filter(step => step.type === 'exercise')
    .reduce((sum, step) => sum + step.durationSec, 0);
  
  const actualRestSec = program.steps
    .filter(step => step.type === 'rest')
    .reduce((sum, step) => sum + step.durationSec, 0);
  
  if (actualActiveSec !== program.totalActiveSec) {
    errors.push(`Total active time mismatch: declared ${program.totalActiveSec}s, actual ${actualActiveSec}s`);
  }
  
  if (actualRestSec !== program.totalRestSec) {
    errors.push(`Total rest time mismatch: declared ${program.totalRestSec}s, actual ${actualRestSec}s`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Utility functions
export const formatDuration = (seconds: number): string => {
  if (seconds >= 7200) { // 2+ hours
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else if (seconds >= 3600) { // 1+ hour
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
};

export const getTotalDuration = (program: Program): number => {
  return program.totalActiveSec + program.totalRestSec;
};

export const getStepProgress = (currentStepIndex: number, totalSteps: number): number => {
  return totalSteps > 0 ? (currentStepIndex + 1) / totalSteps : 0;
};

// JSON Schema for validation
export const ProgramJSONSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  required: ['id', 'title', 'level', 'totalActiveSec', 'totalRestSec', 'stepsCount', 'tags', 'steps'],
  properties: {
    id: { type: 'string', minLength: 1 },
    title: { type: 'string', minLength: 1 },
    level: { enum: ['Beginner', 'Intermediate', 'Advanced'] },
    description: { type: 'string' },
    totalActiveSec: { type: 'number', minimum: 0 },
    totalRestSec: { type: 'number', minimum: 0 },
    stepsCount: { type: 'number', minimum: 1 },
    tags: { type: 'array', items: { type: 'string' } },
    steps: {
      type: 'array',
      minItems: 1,
      items: {
        oneOf: [
          {
            type: 'object',
            required: ['id', 'type', 'title', 'durationSec'],
            properties: {
              id: { type: 'string' },
              type: { const: 'exercise' },
              title: { type: 'string', minLength: 1 },
              durationSec: { type: 'number', minimum: 1 },
              description: { type: 'string' },
              icon: { type: 'string' },
              animationRef: { type: 'string' },
              targetReps: { type: 'number', minimum: 1 },
              equipment: { type: 'array', items: { type: 'string' } }
            },
            additionalProperties: false
          },
          {
            type: 'object',
            required: ['id', 'type', 'title', 'durationSec'],
            properties: {
              id: { type: 'string' },
              type: { const: 'rest' },
              title: { const: 'Rest' },
              durationSec: { type: 'number', minimum: 1 },
              tip: { type: 'string' }
            },
            additionalProperties: false
          }
        ]
      }
    },
    estimatedCalories: { type: 'number', minimum: 0 },
    thumbnailUrl: { type: 'string', format: 'uri' },
    difficulty: { type: 'number', minimum: 1, maximum: 5 },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  },
  additionalProperties: false
} as const;
