import React from 'react';
import { Field, FieldProps } from './Field';

export interface InputProps extends FieldProps {}

/**
 * Input alias for Field with 48px height, L2 background, and dark keyboard appearance.
 */
export const Input: React.FC<InputProps> = (props) => {
  return <Field {...props} />;
};

export { Field, FieldProps } from './Field';
