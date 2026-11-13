import React from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { QuickCaptureModal } from '../features/capture';

type CaptureRouteProp = RouteProp<RootStackParamList, 'CaptureModal'>;

export const CaptureModal: React.FC = () => {
  const route = useRoute<CaptureRouteProp>();
  const initialMode = route.params?.initialMode ?? 'task';

  return <QuickCaptureModal initialMode={initialMode} />;
};

export default CaptureModal;
