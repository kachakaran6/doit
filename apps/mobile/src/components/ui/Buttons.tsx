import React from 'react';
import { Button, ButtonProps } from './Button';

export interface PrimaryButtonProps extends Omit<ButtonProps, 'variant'> {}
export const PrimaryButton: React.FC<PrimaryButtonProps> = (props) => {
  return <Button variant="primary" {...props} />;
};

export interface SecondaryButtonProps extends Omit<ButtonProps, 'variant'> {}
export const SecondaryButton: React.FC<SecondaryButtonProps> = (props) => {
  return <Button variant="secondary" {...props} />;
};

export interface IconButtonProps extends Omit<ButtonProps, 'variant'> {
  icon: React.ReactNode;
}
export const IconButton: React.FC<IconButtonProps> = (props) => {
  return <Button variant="icon" {...props} />;
};

