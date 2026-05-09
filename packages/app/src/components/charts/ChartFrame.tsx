import React, { useEffect, useRef } from 'react';
import { cn } from '../../utils/cn';

interface ChartFrameProps {
  height: number;
  width?: string;
  className?: string;
  children: React.ReactNode;
}

/** Recharts wrapper: applies dynamic height/width via CSS variables (no JSX inline styles). */
const ChartFrame: React.FC<ChartFrameProps> = ({
  height,
  width = '100%',
  className,
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--chart-frame-height', `${height}px`);
    if (width && width !== '100%') {
      el.style.setProperty('--chart-frame-width', width);
    } else {
      el.style.removeProperty('--chart-frame-width');
    }
  }, [height, width]);

  return (
    <div
      ref={ref}
      className={cn(
        'chart-frame',
        (!width || width === '100%') && 'w-full',
        width && width !== '100%' && 'chart-frame-fixed-w',
        className,
      )}
    >
      {children}
    </div>
  );
};

export default ChartFrame;
