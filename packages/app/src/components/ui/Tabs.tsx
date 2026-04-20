// Tabs Component
// File: src/components/ui/Tabs.tsx

import React, { createContext, useContext, ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
  variant: 'pill' | 'underline';
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  className?: string;
  variant?: 'pill' | 'underline';
}

export const Tabs: React.FC<TabsProps> = ({ value, onValueChange, children, className = '', variant = 'pill' }) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange, variant }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  children: ReactNode;
  className?: string;
  variant?: 'pill' | 'underline';
}

export const TabsList: React.FC<TabsListProps> = ({ children, className = '', variant }) => {
  const context = useContext(TabsContext);
  const resolvedVariant = variant ?? context?.variant ?? 'pill';
  return (
    <div
      className={cn(
        resolvedVariant === 'underline'
          ? 'flex flex-wrap gap-4 sm:gap-6 border-b border-gray-200 dark:border-gray-700'
          : 'inline-flex h-10 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 p-1',
        className
      )}
    >
      {children}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
  variant?: 'pill' | 'underline';
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className = '', variant }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const isActive = context.value === value;
  const resolvedVariant = variant ?? context.variant ?? 'pill';
  const triggerBaseClass =
    resolvedVariant === 'underline'
      ? 'inline-flex items-center justify-center whitespace-nowrap border-b-2 border-transparent px-1 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vendorsoluce-green focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
      : 'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  const triggerStateClass =
    resolvedVariant === 'underline'
      ? (isActive
        ? 'border-vendorsoluce-green text-vendorsoluce-green dark:border-vendorsoluce-light-green dark:text-vendorsoluce-light-green'
        : 'text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300')
      : (isActive
        ? 'bg-white dark:bg-gray-700 text-vendorsoluce-green dark:text-vendorsoluce-light-green shadow-sm'
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200');

  return (
    <button
      onClick={() => context.onValueChange(value)}
      className={cn(triggerBaseClass, triggerStateClass, className)}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({ value, children, className = '' }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');

  if (context.value !== value) return null;

  return <div className={className}>{children}</div>;
};
