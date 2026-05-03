import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  animate?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  className = "", 
  width, 
  height, 
  rounded = true,
  animate = true 
}) => {
  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || '1rem',
    borderRadius: rounded ? '0.375rem' : '0',
    animation: animate ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
  };

  return (
    <div
      role="status"
      aria-label="Loading…"
      className={`bg-gray-200 dark:bg-gray-700 ${animate ? 'animate-pulse' : ''} ${className}`.trim()}
      style={style}
    >
      <span className="sr-only">Loading…</span>
    </div>
  );
};

export { Skeleton };
export default Skeleton;

