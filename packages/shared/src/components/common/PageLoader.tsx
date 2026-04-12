import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface PageLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

const PageLoader: React.FC<PageLoaderProps> = ({ 
  message = 'Loading...',
  fullScreen = true 
}) => {
  const containerClass = fullScreen 
    ? 'min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClass}>
      <div className="text-center">
        <LoadingSpinner size="large" />
        {message && (
          <p className="text-gray-600 dark:text-gray-400 mt-4">{message}</p>
        )}
      </div>
    </div>
  );
};

export default PageLoader;

