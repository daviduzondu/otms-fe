'use client'
import React, { createContext, useState, useContext, ReactNode, FC } from 'react';

interface ComponentProps {
 Component: React.ComponentType<any> | null;
 props: Record<string, any>;
}

interface ShellContextType {
 componentProps: ComponentProps;
 setComponentProps: React.Dispatch<React.SetStateAction<ComponentProps>>;
}

// Create a context with a default value
const ShellContext = createContext<ShellContextType | undefined>(undefined);

// Provider component
const ShellProvider: FC<{ children: ReactNode }> = ({ children }) => {
 const [componentProps, setComponentProps] = useState<ComponentProps>({
  Component: null, // Initially no component
  props: {}, // Props for the dynamic component
 });

 const contextValue: ShellContextType = {
  componentProps,
  setComponentProps,
 };

 return (
  <ShellContext.Provider value={contextValue}>
   {children}
  </ShellContext.Provider>
 );
};

// Custom hook for accessing the context
const useShellContext = (): ShellContextType => {
 const context = useContext(ShellContext);
 if (!context) {
  throw new Error('useShellContext must be used within a ShellProvider');
 }
 return context;
};

export { ShellProvider, useShellContext };
