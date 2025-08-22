import { trainingReducer, selectors, TrainingSessionState } from '../state/trainingStateMachine';
import { FULL_BODY_EXPRESS } from '../data/samplePrograms';

// Mock Date.now for consistent testing
const mockNow = 1640995200000; // 2022-01-01 00:00:00 UTC
const originalDateNow = Date.now;

beforeEach(() => {
  Date.now = jest.fn(() => mockNow);
});

afterEach(() => {
  Date.now = originalDateNow;
});

describe('Training State Machine', () => {
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

  describe('START event', () => {
    it('should initialize the first step correctly', () => {
      const action = { type: 'START' as const, program: FULL_BODY_EXPRESS };
      const newState = trainingReducer(initialState, action);

      expect(newState.state).toBe('running');
      expect(newState.program).toBe(FULL_BODY_EXPRESS);
      expect(newState.currentStepIndex).toBe(0);
      expect(newState.currentStep).toBe(FULL_BODY_EXPRESS.steps[0]);
      expect(newState.remainingMs).toBe(FULL_BODY_EXPRESS.steps[0].durationSec * 1000);
      expect(newState.stepStartTime).toBe(mockNow);
      expect(newState.nextUpStep).toBe(FULL_BODY_EXPRESS.steps[1]);
      expect(newState.isLastStep).toBe(false);
    });

    it('should handle single-step program', () => {
      const singleStepProgram = {
        ...FULL_BODY_EXPRESS,
        steps: [FULL_BODY_EXPRESS.steps[0]],
        stepsCount: 1
      };

      const action = { type: 'START' as const, program: singleStepProgram };
      const newState = trainingReducer(initialState, action);

      expect(newState.isLastStep).toBe(true);
      expect(newState.nextUpStep).toBe(null);
    });

    it('should handle empty program gracefully', () => {
      const emptyProgram = {
        ...FULL_BODY_EXPRESS,
        steps: [],
        stepsCount: 0
      };

      const action = { type: 'START' as const, program: emptyProgram };
      const newState = trainingReducer(initialState, action);

      expect(newState.state).toBe('idle');
      expect(newState.error).toBe('Program has no steps');
    });
  });

  describe('TICK event', () => {
    let runningState: TrainingSessionState;

    beforeEach(() => {
      runningState = trainingReducer(initialState, {
        type: 'START',
        program: FULL_BODY_EXPRESS
      });
    });

    it('should update remaining time', () => {
      const remainingMs = 30000; // 30 seconds
      const newState = trainingReducer(runningState, {
        type: 'TICK',
        remainingMs
      });

      expect(newState.remainingMs).toBe(remainingMs);
    });

    it('should show next up banner at T-5s', () => {
      const remainingMs = 4500; // 4.5 seconds (within 5s threshold)
      const newState = trainingReducer(runningState, {
        type: 'TICK',
        remainingMs
      });

      expect(newState.showNextUpBanner).toBe(true);
    });

    it('should not show next up banner above T-5s', () => {
      const remainingMs = 6000; // 6 seconds (above 5s threshold)
      const newState = trainingReducer(runningState, {
        type: 'TICK',
        remainingMs
      });

      expect(newState.showNextUpBanner).toBe(false);
    });

    it('should advance to next step when time expires', () => {
      const newState = trainingReducer(runningState, {
        type: 'TICK',
        remainingMs: 0
      });

      expect(newState.currentStepIndex).toBe(1);
      expect(newState.currentStep).toBe(FULL_BODY_EXPRESS.steps[1]);
      expect(newState.showNextUpBanner).toBe(false);
      expect(newState.stepResults).toHaveLength(1);
      expect(newState.stepResults[0].stepId).toBe(FULL_BODY_EXPRESS.steps[0].id);
    });

    it('should finish program when last step expires', () => {
      // Advance to last step
      let state = runningState;
      for (let i = 0; i < FULL_BODY_EXPRESS.steps.length - 1; i++) {
        state = trainingReducer(state, { type: 'TICK', remainingMs: 0 });
      }

      // Complete last step
      const finalState = trainingReducer(state, { type: 'TICK', remainingMs: 0 });

      expect(finalState.state).toBe('finished');
      expect(finalState.stepResults).toHaveLength(FULL_BODY_EXPRESS.steps.length);
    });
  });

  describe('PAUSE and RESUME events', () => {
    let runningState: TrainingSessionState;

    beforeEach(() => {
      runningState = trainingReducer(initialState, {
        type: 'START',
        program: FULL_BODY_EXPRESS
      });
    });

    it('should pause from running state', () => {
      const pausedState = trainingReducer(runningState, { type: 'PAUSE' });

      expect(pausedState.state).toBe('paused');
      expect(pausedState.pausedAt).toBe(mockNow);
    });

    it('should not pause from non-running state', () => {
      const pausedState = trainingReducer(runningState, { type: 'PAUSE' });
      const doublePausedState = trainingReducer(pausedState, { type: 'PAUSE' });

      expect(doublePausedState).toBe(pausedState); // No change
    });

    it('should resume from paused state', () => {
      const pausedState = trainingReducer(runningState, { type: 'PAUSE' });
      
      // Simulate 5 seconds pause
      Date.now = jest.fn(() => mockNow + 5000);
      
      const resumedState = trainingReducer(pausedState, { type: 'RESUME' });

      expect(resumedState.state).toBe('running');
      expect(resumedState.pausedAt).toBe(null);
      expect(resumedState.pausedDurationMs).toBe(5000);
    });
  });

  describe('SKIP_REST event', () => {
    it('should skip rest step and advance to next', () => {
      // Start with a rest step
      const programWithRest = {
        ...FULL_BODY_EXPRESS,
        steps: [
          { id: 'rest', type: 'rest' as const, title: 'Rest', durationSec: 30 },
          FULL_BODY_EXPRESS.steps[0]
        ]
      };

      let state = trainingReducer(initialState, {
        type: 'START',
        program: programWithRest
      });

      state = trainingReducer(state, { type: 'SKIP_REST' });

      expect(state.currentStepIndex).toBe(1);
      expect(state.stepResults).toHaveLength(1);
      expect(state.stepResults[0].wasSkipped).toBe(true);
    });

    it('should not skip exercise step', () => {
      const runningState = trainingReducer(initialState, {
        type: 'START',
        program: FULL_BODY_EXPRESS
      });

      const newState = trainingReducer(runningState, { type: 'SKIP_REST' });

      expect(newState.currentStepIndex).toBe(0); // No change
    });
  });

  describe('ADD_TEN_SECONDS event', () => {
    it('should add 10 seconds to rest step', () => {
      const programWithRest = {
        ...FULL_BODY_EXPRESS,
        steps: [
          { id: 'rest', type: 'rest' as const, title: 'Rest', durationSec: 30 }
        ]
      };

      let state = trainingReducer(initialState, {
        type: 'START',
        program: programWithRest
      });

      const originalRemaining = state.remainingMs;
      state = trainingReducer(state, { type: 'ADD_TEN_SECONDS' });

      expect(state.remainingMs).toBe(originalRemaining + 10000);
    });

    it('should not add time to exercise step', () => {
      const runningState = trainingReducer(initialState, {
        type: 'START',
        program: FULL_BODY_EXPRESS
      });

      const originalRemaining = runningState.remainingMs;
      const newState = trainingReducer(runningState, { type: 'ADD_TEN_SECONDS' });

      expect(newState.remainingMs).toBe(originalRemaining); // No change
    });
  });

  describe('EXIT event', () => {
    it('should exit from running state', () => {
      const runningState = trainingReducer(initialState, {
        type: 'START',
        program: FULL_BODY_EXPRESS
      });

      const exitedState = trainingReducer(runningState, { type: 'EXIT' });

      expect(exitedState.state).toBe('exited');
    });
  });

  describe('RESET event', () => {
    it('should reset to initial state', () => {
      let state = trainingReducer(initialState, {
        type: 'START',
        program: FULL_BODY_EXPRESS
      });

      state = trainingReducer(state, { type: 'PAUSE' });
      state = trainingReducer(state, { type: 'RESET' });

      expect(state).toEqual(initialState);
    });
  });
});

describe('Selectors', () => {
  const sampleState: TrainingSessionState = {
    state: 'running',
    program: FULL_BODY_EXPRESS,
    currentStepIndex: 0,
    currentStep: FULL_BODY_EXPRESS.steps[0],
    remainingMs: 30000, // 30 seconds remaining out of 45 seconds
    totalElapsedMs: 0,
    stepStartTime: mockNow,
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

  describe('getCurrentProgress', () => {
    it('should calculate current step progress correctly', () => {
      const progress = selectors.getCurrentProgress(sampleState);
      const expected = (45 - 30) / 45; // 15 seconds elapsed out of 45
      expect(progress).toBeCloseTo(expected, 2);
    });

    it('should return 0 for no current step', () => {
      const stateWithoutStep = { ...sampleState, currentStep: null };
      const progress = selectors.getCurrentProgress(stateWithoutStep);
      expect(progress).toBe(0);
    });
  });

  describe('getTotalProgress', () => {
    it('should calculate total program progress correctly', () => {
      const stateAtStep2 = {
        ...sampleState,
        currentStepIndex: 1
      };
      const progress = selectors.getTotalProgress(stateAtStep2);
      const expected = (1 + selectors.getCurrentProgress(stateAtStep2)) / FULL_BODY_EXPRESS.steps.length;
      expect(progress).toBeCloseTo(expected, 2);
    });
  });

  describe('getFormattedTime', () => {
    it('should format seconds correctly', () => {
      expect(selectors.getFormattedTime(45000)).toBe('00:45');
      expect(selectors.getFormattedTime(90000)).toBe('01:30');
      expect(selectors.getFormattedTime(3600000)).toBe('60:00');
    });

    it('should handle zero and small values', () => {
      expect(selectors.getFormattedTime(0)).toBe('00:00');
      expect(selectors.getFormattedTime(500)).toBe('00:01'); // Rounds up
    });
  });

  describe('shouldPlayCountdownSound', () => {
    it('should return true for countdown seconds', () => {
      expect(selectors.shouldPlayCountdownSound(3000)).toBe(true);
      expect(selectors.shouldPlayCountdownSound(2000)).toBe(true);
      expect(selectors.shouldPlayCountdownSound(1000)).toBe(true);
    });

    it('should return false outside countdown range', () => {
      expect(selectors.shouldPlayCountdownSound(4000)).toBe(false);
      expect(selectors.shouldPlayCountdownSound(0)).toBe(false);
    });
  });

  describe('shouldPlayStepCompleteSound', () => {
    it('should return true when step is complete', () => {
      expect(selectors.shouldPlayStepCompleteSound(0)).toBe(true);
      expect(selectors.shouldPlayStepCompleteSound(-100)).toBe(true);
    });

    it('should return false when step is not complete', () => {
      expect(selectors.shouldPlayStepCompleteSound(1000)).toBe(false);
    });
  });
});
