import React from 'react';
import { cn } from '@/lib/utils';

export type PageContainerWidth = 'data' | 'form' | 'settings' | 'detail' | 'wide';

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: PageContainerWidth;
  children: React.ReactNode;
}

const WIDTH_CLASSES: Record<PageContainerWidth, string> = {
  data: 'max-w-[1280px]',
  form: 'max-w-[720px]',
  settings: 'max-w-[972px]',
  detail: 'max-w-[880px]',
  wide: 'max-w-none',
};

export function PageContainer({
  width = 'data',
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-6 lg:px-8 py-6 lg:py-8',
        WIDTH_CLASSES[width],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

