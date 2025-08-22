import { Program, ExerciseStep, RestStep } from '../types/program';

// Sample Program 1: Full-Body Express
const fullBodyExpressSteps: (ExerciseStep | RestStep)[] = [
  {
    id: 'fbe_1',
    type: 'exercise',
    title: 'Jumping Jacks',
    durationSec: 45,
    description: 'Start with feet together, jump feet apart while raising arms overhead',
    icon: '🤸‍♂️',
    animationRef: 'jumping_jacks',
    targetReps: 30,
    equipment: []
  },
  {
    id: 'fbe_rest_1',
    type: 'rest',
    title: 'Rest',
    durationSec: 15,
    tip: 'Catch your breath and hydrate'
  },
  {
    id: 'fbe_2',
    type: 'exercise',
    title: 'Push-ups',
    durationSec: 30,
    description: 'Keep your body in a straight line, lower chest to floor',
    icon: '💪',
    animationRef: 'push_ups',
    targetReps: 15,
    equipment: []
  },
  {
    id: 'fbe_rest_2',
    type: 'rest',
    title: 'Rest',
    durationSec: 20,
    tip: 'Shake out your arms'
  },
  {
    id: 'fbe_3',
    type: 'exercise',
    title: 'Bodyweight Squats',
    durationSec: 40,
    description: 'Feet shoulder-width apart, lower hips back and down',
    icon: '🦵',
    animationRef: 'squats',
    targetReps: 20,
    equipment: []
  },
  {
    id: 'fbe_rest_3',
    type: 'rest',
    title: 'Rest',
    durationSec: 15,
    tip: 'Feel the burn in your legs'
  },
  {
    id: 'fbe_4',
    type: 'exercise',
    title: 'Mountain Climbers',
    durationSec: 30,
    description: 'Start in plank position, alternate bringing knees to chest',
    icon: '🏔️',
    animationRef: 'mountain_climbers',
    targetReps: 20,
    equipment: []
  },
  {
    id: 'fbe_rest_4',
    type: 'rest',
    title: 'Rest',
    durationSec: 25,
    tip: 'Control your breathing'
  },
  {
    id: 'fbe_5',
    type: 'exercise',
    title: 'Plank Hold',
    durationSec: 35,
    description: 'Hold a straight line from head to heels, engage your core',
    icon: '🏋️‍♀️',
    animationRef: 'plank',
    equipment: []
  },
  {
    id: 'fbe_rest_5',
    type: 'rest',
    title: 'Rest',
    durationSec: 20,
    tip: 'Almost done! Stay strong'
  },
  {
    id: 'fbe_6',
    type: 'exercise',
    title: 'Burpees',
    durationSec: 25,
    description: 'Squat down, jump back to plank, push-up, jump forward, jump up',
    icon: '🔥',
    animationRef: 'burpees',
    targetReps: 8,
    equipment: []
  }
];

export const FULL_BODY_EXPRESS: Program = {
  id: 'prog_full_body_express',
  title: 'Full-Body Express',
  level: 'Intermediate',
  description: 'A quick but intense full-body workout that targets all major muscle groups in under 6 minutes',
  totalActiveSec: 205, // Sum of exercise durations
  totalRestSec: 95, // Sum of rest durations
  stepsCount: 11,
  tags: ['No equipment', 'Full body', 'HIIT', 'Beginner friendly'],
  steps: fullBodyExpressSteps,
  estimatedCalories: 85,
  thumbnailUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  difficulty: 3,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z'
};

// Sample Program 2: Core + Cardio Mix
const coreCardioSteps: (ExerciseStep | RestStep)[] = [
  {
    id: 'ccm_1',
    type: 'exercise',
    title: 'High Knees',
    durationSec: 30,
    description: 'Run in place lifting knees as high as possible',
    icon: '🏃‍♂️',
    animationRef: 'high_knees',
    targetReps: 40,
    equipment: []
  },
  {
    id: 'ccm_rest_1',
    type: 'rest',
    title: 'Rest',
    durationSec: 10,
    tip: 'Quick recovery, keep moving lightly'
  },
  {
    id: 'ccm_2',
    type: 'exercise',
    title: 'Bicycle Crunches',
    durationSec: 45,
    description: 'Alternate bringing opposite elbow to knee in a cycling motion',
    icon: '🚴‍♀️',
    animationRef: 'bicycle_crunches',
    targetReps: 30,
    equipment: []
  },
  {
    id: 'ccm_rest_2',
    type: 'rest',
    title: 'Rest',
    durationSec: 15,
    tip: 'Feel your core working'
  },
  {
    id: 'ccm_3',
    type: 'exercise',
    title: 'Jump Squats',
    durationSec: 35,
    description: 'Explosive squat with a jump at the top',
    icon: '⚡',
    animationRef: 'jump_squats',
    targetReps: 15,
    equipment: []
  },
  {
    id: 'ccm_rest_3',
    type: 'rest',
    title: 'Rest',
    durationSec: 20,
    tip: 'Power through, you got this!'
  },
  {
    id: 'ccm_4',
    type: 'exercise',
    title: 'Russian Twists',
    durationSec: 40,
    description: 'Sit with knees bent, lean back slightly, rotate torso side to side',
    icon: '🌪️',
    animationRef: 'russian_twists',
    targetReps: 25,
    equipment: []
  },
  {
    id: 'ccm_rest_4',
    type: 'rest',
    title: 'Rest',
    durationSec: 15,
    tip: 'Keep that core tight'
  },
  {
    id: 'ccm_5',
    type: 'exercise',
    title: 'Butt Kickers',
    durationSec: 25,
    description: 'Run in place kicking heels to glutes',
    icon: '🦵',
    animationRef: 'butt_kickers',
    targetReps: 30,
    equipment: []
  },
  {
    id: 'ccm_rest_5',
    type: 'rest',
    title: 'Rest',
    durationSec: 15,
    tip: 'Final push coming up!'
  },
  {
    id: 'ccm_6',
    type: 'exercise',
    title: 'Dead Bug',
    durationSec: 50,
    description: 'Lie on back, extend opposite arm and leg, return to start',
    icon: '🪲',
    animationRef: 'dead_bug',
    targetReps: 20,
    equipment: []
  },
  {
    id: 'ccm_rest_6',
    type: 'rest',
    title: 'Rest',
    durationSec: 10,
    tip: 'Almost there!'
  },
  {
    id: 'ccm_7',
    type: 'exercise',
    title: 'Star Jumps',
    durationSec: 30,
    description: 'Jump with arms and legs spread wide like a star',
    icon: '⭐',
    animationRef: 'star_jumps',
    targetReps: 20,
    equipment: []
  }
];

export const CORE_CARDIO_MIX: Program = {
  id: 'prog_core_cardio_mix',
  title: 'Core + Cardio Mix',
  level: 'Beginner',
  description: 'Perfect blend of core strengthening and cardiovascular conditioning for beginners',
  totalActiveSec: 255, // Sum of exercise durations
  totalRestSec: 85, // Sum of rest durations
  stepsCount: 13,
  tags: ['No equipment', 'Core', 'Cardio', 'Beginner', 'Fat burn'],
  steps: coreCardioSteps,
  estimatedCalories: 95,
  thumbnailUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  difficulty: 2,
  createdAt: '2024-01-15T11:00:00Z',
  updatedAt: '2024-01-15T11:00:00Z'
};

// Sample Program 3: Upper Body Strength
const upperBodySteps: (ExerciseStep | RestStep)[] = [
  {
    id: 'ubs_1',
    type: 'exercise',
    title: 'Push-ups',
    durationSec: 40,
    description: 'Standard push-ups with proper form',
    icon: '💪',
    animationRef: 'push_ups',
    targetReps: 20,
    equipment: []
  },
  {
    id: 'ubs_rest_1',
    type: 'rest',
    title: 'Rest',
    durationSec: 20,
    tip: 'Shake out your arms and shoulders'
  },
  {
    id: 'ubs_2',
    type: 'exercise',
    title: 'Pike Push-ups',
    durationSec: 30,
    description: 'Targets shoulders and upper chest',
    icon: '🔺',
    animationRef: 'pike_pushups',
    targetReps: 12,
    equipment: []
  },
  {
    id: 'ubs_rest_2',
    type: 'rest',
    title: 'Rest',
    durationSec: 25,
    tip: 'Stretch your shoulders'
  },
  {
    id: 'ubs_3',
    type: 'exercise',
    title: 'Tricep Dips',
    durationSec: 35,
    description: 'Use a chair or bench for support',
    icon: '🪑',
    animationRef: 'tricep_dips',
    targetReps: 15,
    equipment: ['chair']
  },
  {
    id: 'ubs_rest_3',
    type: 'rest',
    title: 'Rest',
    durationSec: 30,
    tip: 'Final exercise coming up!'
  },
  {
    id: 'ubs_4',
    type: 'exercise',
    title: 'Arm Circles',
    durationSec: 20,
    description: 'Large circles forward and backward',
    icon: '🔄',
    animationRef: 'arm_circles',
    targetReps: 20,
    equipment: []
  }
];

export const UPPER_BODY_STRENGTH: Program = {
  id: 'prog_upper_body_strength',
  title: 'Upper Body Strength',
  level: 'Intermediate',
  description: 'Build upper body strength with bodyweight exercises targeting arms, shoulders, and chest',
  totalActiveSec: 125,
  totalRestSec: 75,
  stepsCount: 7,
  tags: ['Upper body', 'Strength', 'No equipment', 'Intermediate'],
  steps: upperBodySteps,
  estimatedCalories: 65,
  thumbnailUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  difficulty: 3,
  createdAt: '2024-01-15T12:00:00Z',
  updatedAt: '2024-01-15T12:00:00Z'
};

// Sample Program 4: Quick Morning Routine
const morningRoutineSteps: (ExerciseStep | RestStep)[] = [
  {
    id: 'qmr_1',
    type: 'exercise',
    title: 'Arm Swings',
    durationSec: 15,
    description: 'Gentle arm swings to wake up your body',
    icon: '🌅',
    animationRef: 'arm_swings',
    equipment: []
  },
  {
    id: 'qmr_2',
    type: 'exercise',
    title: 'Neck Rolls',
    durationSec: 15,
    description: 'Slow, controlled neck movements',
    icon: '🔄',
    animationRef: 'neck_rolls',
    equipment: []
  },
  {
    id: 'qmr_rest_1',
    type: 'rest',
    title: 'Rest',
    durationSec: 10,
    tip: 'Take a deep breath'
  },
  {
    id: 'qmr_3',
    type: 'exercise',
    title: 'Gentle Squats',
    durationSec: 20,
    description: 'Low-intensity squats to activate legs',
    icon: '🦵',
    animationRef: 'gentle_squats',
    targetReps: 10,
    equipment: []
  },
  {
    id: 'qmr_4',
    type: 'exercise',
    title: 'Side Bends',
    durationSec: 20,
    description: 'Gentle side stretches',
    icon: '🤸‍♀️',
    animationRef: 'side_bends',
    targetReps: 10,
    equipment: []
  }
];

export const QUICK_MORNING_ROUTINE: Program = {
  id: 'prog_quick_morning',
  title: 'Quick Morning Routine',
  level: 'Beginner',
  description: 'Gentle wake-up routine to energize your body and mind for the day ahead',
  totalActiveSec: 70,
  totalRestSec: 10,
  stepsCount: 5,
  tags: ['Morning', 'Gentle', 'Wake up', 'Beginner', 'No equipment'],
  steps: morningRoutineSteps,
  estimatedCalories: 25,
  thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  difficulty: 1,
  createdAt: '2024-01-15T06:00:00Z',
  updatedAt: '2024-01-15T06:00:00Z'
};

// Sample Program 5: HIIT Blast
const hiitBlastSteps: (ExerciseStep | RestStep)[] = [
  {
    id: 'hb_1',
    type: 'exercise',
    title: 'Burpees',
    durationSec: 30,
    description: 'Maximum intensity burpees',
    icon: '🔥',
    animationRef: 'burpees',
    targetReps: 10,
    equipment: []
  },
  {
    id: 'hb_rest_1',
    type: 'rest',
    title: 'Rest',
    durationSec: 15,
    tip: 'Catch your breath quickly'
  },
  {
    id: 'hb_2',
    type: 'exercise',
    title: 'Mountain Climbers',
    durationSec: 30,
    description: 'Fast-paced mountain climbers',
    icon: '🏔️',
    animationRef: 'mountain_climbers',
    targetReps: 30,
    equipment: []
  },
  {
    id: 'hb_rest_2',
    type: 'rest',
    title: 'Rest',
    durationSec: 15,
    tip: 'Stay moving lightly'
  },
  {
    id: 'hb_3',
    type: 'exercise',
    title: 'Jump Squats',
    durationSec: 30,
    description: 'Explosive jump squats',
    icon: '⚡',
    animationRef: 'jump_squats',
    targetReps: 15,
    equipment: []
  },
  {
    id: 'hb_rest_3',
    type: 'rest',
    title: 'Rest',
    durationSec: 15,
    tip: 'Push through the burn!'
  },
  {
    id: 'hb_4',
    type: 'exercise',
    title: 'High Knees',
    durationSec: 30,
    description: 'Sprint in place with high knees',
    icon: '🏃‍♂️',
    animationRef: 'high_knees',
    targetReps: 40,
    equipment: []
  }
];

export const HIIT_BLAST: Program = {
  id: 'prog_hiit_blast',
  title: 'HIIT Blast',
  level: 'Advanced',
  description: 'High-intensity interval training for maximum calorie burn and cardiovascular improvement',
  totalActiveSec: 120,
  totalRestSec: 45,
  stepsCount: 7,
  tags: ['HIIT', 'High intensity', 'Cardio', 'Advanced', 'No equipment'],
  steps: hiitBlastSteps,
  estimatedCalories: 120,
  thumbnailUrl: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  difficulty: 5,
  createdAt: '2024-01-15T18:00:00Z',
  updatedAt: '2024-01-15T18:00:00Z'
};

// Export all sample programs
export const SAMPLE_PROGRAMS: Program[] = [
  FULL_BODY_EXPRESS,
  CORE_CARDIO_MIX,
  UPPER_BODY_STRENGTH,
  QUICK_MORNING_ROUTINE,
  HIIT_BLAST
];

// Utility to get program by ID
export const getProgramById = (id: string): Program | undefined => {
  return SAMPLE_PROGRAMS.find(program => program.id === id);
};
