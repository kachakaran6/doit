import React from 'react';
import { cn } from '@/lib/utils';

export type PageContainerWidth = 'data' | 'form' | 'settings' | 'detail' | 'wide' | 'workspace';

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: PageContainerWidth;
  align?: 'center' | 'left';
  children: React.ReactNode;
}

const WIDTH_CLASSES: Record<PageContainerWidth, string> = {
  data: 'max-w-none',
  form: 'max-w-[720px] mx-auto',
  settings: 'max-w-none',
  detail: 'max-w-[1000px] mx-auto',
  wide: 'max-w-none',
  workspace: 'max-w-none',
};

export function PageContainer({
  width = 'wide',
  align = 'left',
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'w-full px-4 sm:px-6 py-4',
        WIDTH_CLASSES[width] || 'max-w-none',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

