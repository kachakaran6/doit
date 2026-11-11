import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './types';
import { overlayService } from '../native/overlay';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigateToCapture(mode: 'task' | 'bug' | 'voice' | 'sticky' = 'task') {
  overlayService.showQuickCapture(mode === 'bug' ? 'BUG' : 'TASK').then((shown) => {
    if (!shown && navigationRef.isReady()) {
      const currentRoute = navigationRef.getCurrentRoute();
      if (currentRoute?.name !== 'CaptureModal') {
        navigationRef.navigate('CaptureModal', { initialMode: mode });
      }
    }
  });
}
