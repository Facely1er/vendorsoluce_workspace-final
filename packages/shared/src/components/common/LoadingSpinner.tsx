import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  label?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  className = '',
  label = 'Loading…',
}) => {
  const sizeClass = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
  };

  return (
    <div
      role="status"
      aria-label={label}
      className={`animate-spin rounded-full ${sizeClass[size]} border-b-2 border-t-2 border-vendorsoluce-green dark:border-vendorsoluce-light-green ${className}`}
    >
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default LoadingSpinner;