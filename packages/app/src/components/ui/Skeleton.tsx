import React, { useLayoutEffect, useRef } from 'react';
import { cn } from '../../utils/cn';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  animate?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  rounded = true,
  animate = true,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const w = width != null ? (typeof width === 'number' ? `${width}px` : width) : null;
    const h = height != null ? (typeof height === 'number' ? `${height}px` : height) : null;
    if (w != null) {
      el.style.setProperty('--skeleton-width', w);
    } else {
      el.style.removeProperty('--skeleton-width');
    }
    if (h != null) {
      el.style.setProperty('--skeleton-height', h);
    } else {
      el.style.removeProperty('--skeleton-height');
    }
  }, [width, height]);

  return (
    <div
      ref={ref}
      role="status"
      aria-label="Loading…"
      className={cn(
        'skeleton-root bg-gray-200 dark:bg-gray-700',
        animate && 'animate-pulse',
        rounded && 'rounded-md',
        className,
      )}
    >
      <span className="sr-only">Loading…</span>
    </div>
  );
};

export { Skeleton };
export default Skeleton;
