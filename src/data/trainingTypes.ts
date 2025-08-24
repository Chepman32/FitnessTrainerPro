export type TrainingType = {
  id: string;
  title: string;
  tags: string[];
  thumbnail?: string; // path to bundled lottie/json or png
  animation?: string; // path to bundled lottie/json
  hints?: string[];
};

export const TRAINING_TYPES: TrainingType[] = [
  {
    id: 'pushups',
    title: 'Push-ups',
    tags: ['Upper body', 'Bodyweight'],
    thumbnail: 'assets/lottie/pushups_thumb.json',
    animation: 'assets/lottie/pushups_large.json',
    hints: ['Keep back straight', 'Even breathing'],
  },
  { id: 'plank', title: 'Plank', tags: ['Core'] },
  { id: 'squats', title: 'Squats', tags: ['Lower body'] },
  { id: 'burpees', title: 'Burpees', tags: ['Full body'] },
  { id: 'lunges', title: 'Lunges', tags: ['Lower body'] },
  { id: 'crunches', title: 'Crunches', tags: ['Core'] },
  { id: 'mountain-climbers', title: 'Mountain Climbers', tags: ['Core', 'Cardio'] },
  { id: 'jumping-jacks', title: 'Jumping Jacks', tags: ['Cardio'] },
];
