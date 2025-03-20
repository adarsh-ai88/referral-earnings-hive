
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = 'md',
  text,
  className,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const spinner = (
    <div className={cn(
      "flex flex-col items-center justify-center",
      fullScreen ? "min-h-[80vh]" : "py-8",
      className
    )}>
      <Loader2 
        className={cn(
          "animate-spin text-mlm-primary mb-4", 
          sizeClasses[size]
        )} 
      />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );

  return spinner;
}
