import React from 'react';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { ComponentGallery } from './src/app/dev/ComponentGallery';

export default function App() {
  return (
    <ThemeProvider>
      <ComponentGallery />
    </ThemeProvider>
  );
}
