import React from 'react';
import { Image, ImageSourcePropType, View } from 'react-native';

export type ExercisePhotoId =
  | 'pushups'
  | 'plank'
  | 'squats'
  | 'burpees'
  | 'lunges'
  | 'crunches'
  | 'mountain-climbers'
  | 'jumping-jacks';

type ExercisePhotoProps = {
  id: ExercisePhotoId;
  size?: number;
  style?: any;
};

// Fallback colors for when photos aren't available yet
const getFallbackColor = (id: ExercisePhotoId): string => {
  const colors = {
    pushups: '#FF7A30',
    plank: '#B84DFF',
    squats: '#2DC7FF',
    burpees: '#2D7BFF',
    lunges: '#3BA3FF',
    crunches: '#1E62D0',
    'mountain-climbers': '#FF6B6B',
    'jumping-jacks': '#4ECDC4',
  };
  return colors[id] || '#5B9BFF';
};

// For now, we'll use placeholder images that represent real exercise photos
// In a real app, you would replace these with actual exercise photos
const getExercisePhoto = (id: ExercisePhotoId): ImageSourcePropType | null => {
  try {
    switch (id) {
      case 'pushups':
        return require('../assets/exercise-photos/pushups.png');
      case 'plank':
        return require('../assets/exercise-photos/plank.png');
      case 'squats':
        return require('../assets/exercise-photos/squats.png');
      case 'burpees':
        return require('../assets/exercise-photos/burpees.png');
      case 'lunges':
        return require('../assets/exercise-photos/lunges.png');
      case 'crunches':
        return require('../assets/exercise-photos/crunches.png');
      case 'mountain-climbers':
        return require('../assets/exercise-photos/mountain-climbers.png');
      case 'jumping-jacks':
        return require('../assets/exercise-photos/jumping-jacks.png');
      default:
        return require('../assets/exercise-photos/pushups.png');
    }
  } catch (error) {
    return null;
  }
};

export function ExercisePhoto({ id, size = 48, style }: ExercisePhotoProps) {
  const photoSource = getExercisePhoto(id);
  
  if (photoSource) {
    return (
      <Image
        source={photoSource}
        style={[
          {
            width: '100%',
            height: '100%',
          },
          style,
        ]}
        resizeMode="cover"
      />
    );
  }

  // Fallback to colored background when photo isn't available
  return (
    <View
      style={[
        {
          width: '100%',
          height: '100%',
          backgroundColor: getFallbackColor(id),
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
    />
  );
}

export default ExercisePhoto;
