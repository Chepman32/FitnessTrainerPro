import { Program, Step } from '../types/program';

// Training session state types
export type TrainingState = 
  | 'idle'
  | 'running'
  | 'paused'
  | 'finished'
  | 'exited';

export type TrainingEvent = 
  | { type: 'START'; program: Program }
  | { type: 'TICK'; remainingMs: number }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'NEXT_STEP' }
  | { type: 'SKIP_REST' }
  | { type: 'ADD_TEN_SECONDS' }
  | { type: 'EXIT' }
  | { type: 'COMPLETE' }
  | { type: 'RESET' };

export interface StepResult {
  stepId: string;
  stepIndex: number;
  type: 'exercise' | 'rest';
  plannedDurationSec: number;
  actualElapsedSec: number;
  wasSkipped: boolean;
  wasExtended: boolean;
  extensionSec: number;
}

export interface TrainingSessionState {
  state: TrainingState;
  program: Program | null;
  currentStepIndex: number;
  currentStep: Step | null;
  remainingMs: number;
  totalElapsedMs: number;
  stepStartTime: number | null;
  pausedAt: number | null;
  pausedDurationMs: number;
  showNextUpBanner: boolean;
  nextUpStep: Step | null;
  isLastStep: boolean;
  stepResults: StepResult[];
  soundsEnabled: boolean;
  vibrationsEnabled: boolean;
  error: string | null;
}

const initialState: TrainingSessionState = {
  state: 'idle',
  program: null,
  currentStepIndex: 0,
  currentStep: null,
  remainingMs: 0,
  totalElapsedMs: 0,
  stepStartTime: null,
  pausedAt: null,
  pausedDurationMs: 0,
  showNextUpBanner: false,
  nextUpStep: null,
  isLastStep: false,
  stepResults: [],
  soundsEnabled: true,
  vibrationsEnabled: true,
  error: null
};

// Utility functions
const getCurrentTimeMs = (): number => Date.now();

const calculateRemainingTime = (
  stepStartTime: number,
  stepDurationMs: number,
  pausedDurationMs: number
): number => {
  const now = getCurrentTimeMs();
  const elapsed = now - stepStartTime - pausedDurationMs;
  return Math.max(0, stepDurationMs - elapsed);
};

const shouldShowNextUpBanner = (remainingMs: number): boolean => {
  return remainingMs <= 5000 && remainingMs > 0; // Show at T-5s
};

const getNextStep = (program: Program, currentIndex: number): Step | null => {
  const nextIndex = currentIndex + 1;
  return nextIndex < program.steps.length ? program.steps[nextIndex] : null;
};

const createStepResult = (
  step: Step,
  stepIndex: number,
  actualElapsedMs: number,
  wasSkipped: boolean = false,
  extensionSec: number = 0
): StepResult => ({
  stepId: step.id,
  stepIndex,
  type: step.type,
  plannedDurationSec: step.durationSec,
  actualElapsedSec: Math.round(actualElapsedMs / 1000),
  wasSkipped,
  wasExtended: extensionSec > 0,
  extensionSec
});

// State machine reducer
export const trainingReducer = (
  state: TrainingSessionState,
  event: TrainingEvent
): TrainingSessionState => {
  switch (event.type) {
    case 'START': {
      const { program } = event;
      const firstStep = program.steps[0];
      
      if (!firstStep) {
        return {
          ...state,
          error: 'Program has no steps'
        };
      }
      
      const now = getCurrentTimeMs();
      const stepDurationMs = firstStep.durationSec * 1000;
      
      return {
        ...state,
        state: 'running',
        program,
        currentStepIndex: 0,
        currentStep: firstStep,
        remainingMs: stepDurationMs,
        totalElapsedMs: 0,
        stepStartTime: now,
        pausedAt: null,
        pausedDurationMs: 0,
        showNextUpBanner: false,
        nextUpStep: getNextStep(program, 0),
        isLastStep: program.steps.length === 1,
        stepResults: [],
        error: null
      };
    }
    
    case 'TICK': {
      if (state.state !== 'running' || !state.program || !state.currentStep || !state.stepStartTime) {
        return state;
      }
      
      const { remainingMs } = event;
      const shouldShowBanner = shouldShowNextUpBanner(remainingMs);
      
      // Check if step is complete
      if (remainingMs <= 0) {
        const actualElapsedMs = getCurrentTimeMs() - state.stepStartTime - state.pausedDurationMs;
        const stepResult = createStepResult(state.currentStep, state.currentStepIndex, actualElapsedMs);
        
        // Move to next step or finish
        const nextStepIndex = state.currentStepIndex + 1;
        
        if (nextStepIndex >= state.program.steps.length) {
          // Program complete
          return {
            ...state,
            state: 'finished',
            remainingMs: 0,
            showNextUpBanner: false,
            stepResults: [...state.stepResults, stepResult],
            totalElapsedMs: state.totalElapsedMs + actualElapsedMs
          };
        }
        
        // Move to next step
        const nextStep = state.program.steps[nextStepIndex];
        const now = getCurrentTimeMs();
        const nextStepDurationMs = nextStep.durationSec * 1000;
        
        return {
          ...state,
          currentStepIndex: nextStepIndex,
          currentStep: nextStep,
          remainingMs: nextStepDurationMs,
          stepStartTime: now,
          pausedDurationMs: 0,
          showNextUpBanner: false,
          nextUpStep: getNextStep(state.program, nextStepIndex),
          isLastStep: nextStepIndex === state.program.steps.length - 1,
          stepResults: [...state.stepResults, stepResult],
          totalElapsedMs: state.totalElapsedMs + actualElapsedMs
        };
      }
      
      return {
        ...state,
        remainingMs,
        showNextUpBanner: shouldShowBanner
      };
    }
    
    case 'PAUSE': {
      if (state.state !== 'running') return state;
      
      return {
        ...state,
        state: 'paused',
        pausedAt: getCurrentTimeMs()
      };
    }
    
    case 'RESUME': {
      if (state.state !== 'paused' || !state.pausedAt) return state;
      
      const pauseDuration = getCurrentTimeMs() - state.pausedAt;
      
      return {
        ...state,
        state: 'running',
        pausedAt: null,
        pausedDurationMs: state.pausedDurationMs + pauseDuration
      };
    }
    
    case 'NEXT_STEP': {
      if (state.state !== 'running' || !state.program || !state.currentStep || !state.stepStartTime) {
        return state;
      }
      
      const actualElapsedMs = getCurrentTimeMs() - state.stepStartTime - state.pausedDurationMs;
      const stepResult = createStepResult(state.currentStep, state.currentStepIndex, actualElapsedMs, true);
      
      const nextStepIndex = state.currentStepIndex + 1;
      
      if (nextStepIndex >= state.program.steps.length) {
        return {
          ...state,
          state: 'finished',
          remainingMs: 0,
          showNextUpBanner: false,
          stepResults: [...state.stepResults, stepResult],
          totalElapsedMs: state.totalElapsedMs + actualElapsedMs
        };
      }
      
      const nextStep = state.program.steps[nextStepIndex];
      const now = getCurrentTimeMs();
      const nextStepDurationMs = nextStep.durationSec * 1000;
      
      return {
        ...state,
        currentStepIndex: nextStepIndex,
        currentStep: nextStep,
        remainingMs: nextStepDurationMs,
        stepStartTime: now,
        pausedDurationMs: 0,
        showNextUpBanner: false,
        nextUpStep: getNextStep(state.program, nextStepIndex),
        isLastStep: nextStepIndex === state.program.steps.length - 1,
        stepResults: [...state.stepResults, stepResult],
        totalElapsedMs: state.totalElapsedMs + actualElapsedMs
      };
    }
    
    case 'SKIP_REST': {
      if (state.state !== 'running' || !state.currentStep || state.currentStep.type !== 'rest') {
        return state;
      }
      
      // Trigger next step immediately
      return trainingReducer(state, { type: 'NEXT_STEP' });
    }
    
    case 'ADD_TEN_SECONDS': {
      if (state.state !== 'running' || !state.currentStep || state.currentStep.type !== 'rest') {
        return state;
      }
      
      return {
        ...state,
        remainingMs: state.remainingMs + 10000 // Add 10 seconds
      };
    }
    
    case 'EXIT': {
      if (state.state === 'idle' || state.state === 'finished') return state;
      
      return {
        ...state,
        state: 'exited'
      };
    }
    
    case 'COMPLETE': {
      return {
        ...state,
        state: 'finished'
      };
    }
    
    case 'RESET': {
      return initialState;
    }
    
    default:
      return state;
  }
};

// Selectors
export const selectors = {
  getCurrentProgress: (state: TrainingSessionState): number => {
    if (!state.currentStep) return 0;
    const stepDurationMs = state.currentStep.durationSec * 1000;
    const elapsedMs = stepDurationMs - state.remainingMs;
    return Math.min(1, Math.max(0, elapsedMs / stepDurationMs));
  },
  
  getTotalProgress: (state: TrainingSessionState): number => {
    if (!state.program) return 0;
    return (state.currentStepIndex + selectors.getCurrentProgress(state)) / state.program.steps.length;
  },
  
  getFormattedTime: (ms: number): string => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  },
  
  shouldPlayCountdownSound: (remainingMs: number): boolean => {
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    return remainingSeconds <= 3 && remainingSeconds > 0;
  },
  
  shouldPlayStepCompleteSound: (remainingMs: number): boolean => {
    return remainingMs <= 0;
  }
};
