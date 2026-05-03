import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  className 
}) => {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
  
  const variantClasses = {
    default: 'bg-vendorsoluce-pale-green text-vendorsoluce-green dark:bg-vendorsoluce-green/20 dark:text-vendorsoluce-light-green',
    secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    destructive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    outline: 'border border-gray-200 text-gray-800 dark:border-gray-700 dark:text-gray-300'
  };

  return (
    <span className={clsx(baseClasses, variantClasses[variant], className)}>
      {children}
    </span>
  );
};

