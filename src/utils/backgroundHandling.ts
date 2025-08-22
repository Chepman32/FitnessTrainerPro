import { AppState, AppStateStatus } from 'react-native';
// Note: For full implementation, you would need react-native-push-notification or similar
// This is a stubbed implementation for the core functionality

export interface BackgroundNotification {
  id: string;
  title: string;
  body: string;
  fireDate: Date;
  data?: any;
}

export interface TrainingBackgroundManager {
  scheduleStepCompletion: (stepName: string, fireInMs: number) => Promise<string>;
  scheduleNextUpWarning: (nextStepName: string, fireInMs: number) => Promise<string>;
  cancelAllNotifications: () => Promise<void>;
  cancelNotification: (id: string) => Promise<void>;
}

// Stubbed implementation - in production you would use a proper push notification library
class StubTrainingBackgroundManager implements TrainingBackgroundManager {
  private scheduledNotifications: Map<string, BackgroundNotification> = new Map();
  
  async scheduleStepCompletion(stepName: string, fireInMs: number): Promise<string> {
    const id = `step_complete_${Date.now()}`;
    const fireDate = new Date(Date.now() + fireInMs);
    
    const notification: BackgroundNotification = {
      id,
      title: 'Step Complete!',
      body: `Time to move to the next step: ${stepName}`,
      fireDate,
      data: { type: 'step_complete', stepName }
    };
    
    this.scheduledNotifications.set(id, notification);
    
    // In production, schedule with the OS notification system
    console.log(`[Background] Scheduled step completion notification for "${stepName}" in ${fireInMs}ms`);
    
    return id;
  }
  
  async scheduleNextUpWarning(nextStepName: string, fireInMs: number): Promise<string> {
    const id = `next_up_${Date.now()}`;
    const fireDate = new Date(Date.now() + fireInMs);
    
    const notification: BackgroundNotification = {
      id,
      title: 'Get Ready!',
      body: `Next up: ${nextStepName}`,
      fireDate,
      data: { type: 'next_up_warning', nextStepName }
    };
    
    this.scheduledNotifications.set(id, notification);
    
    // In production, schedule with the OS notification system
    console.log(`[Background] Scheduled next up warning for "${nextStepName}" in ${fireInMs}ms`);
    
    return id;
  }
  
  async cancelAllNotifications(): Promise<void> {
    this.scheduledNotifications.clear();
    console.log('[Background] Cancelled all notifications');
  }
  
  async cancelNotification(id: string): Promise<void> {
    this.scheduledNotifications.delete(id);
    console.log(`[Background] Cancelled notification: ${id}`);
  }
  
  // Debug method to see scheduled notifications
  getScheduledNotifications(): BackgroundNotification[] {
    return Array.from(this.scheduledNotifications.values());
  }
}

// Singleton instance
export const backgroundManager = new StubTrainingBackgroundManager();

// App state management utilities
export class AppStateManager {
  private listeners: ((state: AppStateStatus) => void)[] = [];
  private currentState: AppStateStatus = AppState.currentState;
  
  constructor() {
    AppState.addEventListener('change', this.handleAppStateChange);
  }
  
  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    console.log(`[AppState] Changed from ${this.currentState} to ${nextAppState}`);
    
    // Notify all listeners
    this.listeners.forEach(listener => {
      try {
        listener(nextAppState);
      } catch (error) {
        console.error('[AppState] Error in listener:', error);
      }
    });
    
    this.currentState = nextAppState;
  };
  
  addListener(listener: (state: AppStateStatus) => void): () => void {
    this.listeners.push(listener);
    
    // Return cleanup function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  
  getCurrentState(): AppStateStatus {
    return this.currentState;
  }
  
  isInBackground(): boolean {
    return this.currentState.match(/inactive|background/) !== null;
  }
  
  isActive(): boolean {
    return this.currentState === 'active';
  }
}

// Singleton instance
export const appStateManager = new AppStateManager();

// Training session persistence for background recovery
export interface TrainingSessionSnapshot {
  programId: string;
  currentStepIndex: number;
  remainingMs: number;
  totalElapsedMs: number;
  stepStartTime: number;
  pausedDurationMs: number;
  stepResults: any[];
  backgroundedAt: number;
}

export class TrainingPersistence {
  private static readonly STORAGE_KEY = '@training_session_snapshot';
  
  async saveSnapshot(snapshot: TrainingSessionSnapshot): Promise<void> {
    try {
      // In production, use AsyncStorage
      const data = JSON.stringify(snapshot);
      console.log('[Persistence] Saved training snapshot:', snapshot);
      // await AsyncStorage.setItem(TrainingPersistence.STORAGE_KEY, data);
    } catch (error) {
      console.error('[Persistence] Failed to save snapshot:', error);
    }
  }
  
  async loadSnapshot(): Promise<TrainingSessionSnapshot | null> {
    try {
      // In production, use AsyncStorage
      // const data = await AsyncStorage.getItem(TrainingPersistence.STORAGE_KEY);
      // if (data) {
      //   return JSON.parse(data);
      // }
      console.log('[Persistence] No saved snapshot found');
      return null;
    } catch (error) {
      console.error('[Persistence] Failed to load snapshot:', error);
      return null;
    }
  }
  
  async clearSnapshot(): Promise<void> {
    try {
      // In production, use AsyncStorage
      // await AsyncStorage.removeItem(TrainingPersistence.STORAGE_KEY);
      console.log('[Persistence] Cleared training snapshot');
    } catch (error) {
      console.error('[Persistence] Failed to clear snapshot:', error);
    }
  }
}

// Singleton instance
export const trainingPersistence = new TrainingPersistence();

// Utility functions for background handling
export const calculateBackgroundRecovery = (
  backgroundedAt: number,
  stepStartTime: number,
  pausedDurationMs: number,
  stepDurationMs: number
): { remainingMs: number; shouldAdvanceStep: boolean } => {
  const now = Date.now();
  const timeInBackground = now - backgroundedAt;
  const totalElapsed = now - stepStartTime - pausedDurationMs;
  const remainingMs = Math.max(0, stepDurationMs - totalElapsed);
  
  console.log(`[Background Recovery] Time in background: ${timeInBackground}ms`);
  console.log(`[Background Recovery] Remaining time: ${remainingMs}ms`);
  
  return {
    remainingMs,
    shouldAdvanceStep: remainingMs <= 0
  };
};

// Hook for easy integration with React components
export const useBackgroundHandling = (
  onBackground: () => void,
  onForeground: () => void
) => {
  const cleanup = appStateManager.addListener((state) => {
    if (appStateManager.isInBackground()) {
      onBackground();
    } else if (state === 'active') {
      onForeground();
    }
  });
  
  return cleanup;
};

/* 
Production Implementation Notes:

1. For full background notification support, install:
   - react-native-push-notification
   - @react-native-async-storage/async-storage

2. Replace the stubbed backgroundManager with actual notification scheduling:
   ```typescript
   import PushNotification from 'react-native-push-notification';
   
   async scheduleStepCompletion(stepName: string, fireInMs: number): Promise<string> {
     const id = Date.now().toString();
     
     PushNotification.localNotificationSchedule({
       id,
       title: 'Step Complete!',
       message: `Time to move to the next step: ${stepName}`,
       date: new Date(Date.now() + fireInMs),
       allowWhileIdle: true,
       userInfo: { type: 'step_complete', stepName }
     });
     
     return id;
   }
   ```

3. For persistence, use AsyncStorage:
   ```typescript
   import AsyncStorage from '@react-native-async-storage/async-storage';
   
   async saveSnapshot(snapshot: TrainingSessionSnapshot): Promise<void> {
     await AsyncStorage.setItem(
       TrainingPersistence.STORAGE_KEY, 
       JSON.stringify(snapshot)
     );
   }
   ```

4. Add proper error handling and retry logic for network-dependent features.

5. Consider implementing workout resume prompts when the app is reopened after being backgrounded during a training session.
*/
