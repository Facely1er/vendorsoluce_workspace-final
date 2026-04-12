import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export type ProgressBarFillProps = {
  /** 0–100 */
  percent: number;
  /** Tailwind `fill-*` utility (e.g. `fill-emerald-600`, `fill-vendorsoluce-green`) */
  fillClassName: string;
  trackClassName?: string;
  className?: string;
  /** Track height, e.g. `h-2`, `h-1.5`, `h-1` */
  heightClassName?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'style'>;

/**
 * Horizontal progress indicator using SVG `rect` width instead of inline `style` width.
 */
export function ProgressBarFill({
  percent,
  fillClassName,
  trackClassName = 'bg-gray-200 dark:bg-gray-800',
  className,
  heightClassName = 'h-2',
  ...rest
}: ProgressBarFillProps) {
  const p = Math.min(100, Math.max(0, Number.isFinite(percent) ? percent : 0));
  return (
    <div
      className={cn('relative w-full overflow-hidden rounded-full', heightClassName, trackClassName, className)}
      {...rest}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 2"
        preserveAspectRatio="none"
        aria-hidden
      >
        <rect x="0" y="0" width={p} height="2" className={fillClassName} rx="1" />
      </svg>
    </div>
  );
}
