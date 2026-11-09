import React from 'react';
import { cn } from '@/lib/utils';

export type PageContainerWidth = 'data' | 'form' | 'settings' | 'detail' | 'wide';

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: PageContainerWidth;
  align?: 'center' | 'left';
  children: React.ReactNode;
}

const WIDTH_CLASSES: Record<PageContainerWidth, string> = {
  data: 'max-w-[1280px]',
  form: 'max-w-[720px]',
  settings: 'max-w-7xl',
  detail: 'max-w-[880px]',
  wide: 'max-w-none',
};

export function PageContainer({
  width = 'data',
  align = width === 'settings' || width === 'wide' ? 'left' : 'center',
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'w-full px-6 lg:px-8 py-6 lg:py-8',
        align === 'center' ? 'mx-auto' : 'mr-auto',
        WIDTH_CLASSES[width],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

