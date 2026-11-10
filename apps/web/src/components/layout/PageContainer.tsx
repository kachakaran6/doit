import React from 'react';
import { cn } from '@/lib/utils';

export type PageContainerWidth = 'data' | 'form' | 'settings' | 'detail' | 'wide' | 'workspace';

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: PageContainerWidth;
  align?: 'center' | 'left';
  children: React.ReactNode;
}

const WIDTH_CLASSES: Record<PageContainerWidth, string> = {
  data: 'max-w-none px-4 sm:px-6 py-5',
  form: 'max-w-[720px] mx-auto px-4 sm:px-6 py-6',
  settings: 'max-w-none px-4 sm:px-6 py-6',
  detail: 'max-w-[1000px] mx-auto px-4 sm:px-6 py-6',
  wide: 'max-w-none px-4 sm:px-6 py-5',
  workspace: 'max-w-none p-0 flex flex-col min-h-full flex-1',
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
        'w-full',
        WIDTH_CLASSES[width] || 'max-w-none px-4 sm:px-6 py-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

