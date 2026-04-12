import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';

const iconSize = 'h-[1.25rem] w-[1.25rem] min-h-[1.25rem] min-w-[1.25rem] flex-shrink-0';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105 hover:shadow-md focus:ring-vendorsoluce-green focus:ring-offset-2 rounded-lg"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      data-theme-toggle
    >
      {theme === 'light' ? (
        <Moon className={`${iconSize} text-gray-700 dark:text-gray-300`} strokeWidth={2} />
      ) : (
        <Sun className={`${iconSize} text-gray-300 dark:text-yellow-400`} strokeWidth={2} />
      )}
    </Button>
  );
};

export default ThemeToggle;