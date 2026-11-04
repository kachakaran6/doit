import React from 'react';
import { LargeHeader, LargeHeaderProps } from './LargeHeader';

export interface ScreenHeaderProps extends LargeHeaderProps {}

/**
 * ScreenHeader: Unified backward-compatible header wrapper.
 * Delegates directly to LargeHeader for consistent Apple-grade collapsing large title behavior.
 */
export const ScreenHeader: React.FC<ScreenHeaderProps> = (props) => {
  return <LargeHeader {...props} />;
};

export { LargeHeaderProps };
