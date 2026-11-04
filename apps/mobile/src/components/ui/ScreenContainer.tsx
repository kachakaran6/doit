import React from 'react';
import { Screen, ScreenProps } from './Screen';

export interface ScreenContainerProps extends ScreenProps {}

/**
 * Backward compatibility wrapper for ScreenContainer, delegating to the unified Screen primitive.
 */
export const ScreenContainer: React.FC<ScreenContainerProps> = (props) => {
  return <Screen {...props} />;
};
