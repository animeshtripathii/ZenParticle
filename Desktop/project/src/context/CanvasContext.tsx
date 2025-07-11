import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CanvasContextType {
  canvasBackgroundColor: string;
  setCanvasBackgroundColor: (color: string) => void;
  canvasSize: { width: number; height: number };
  setCanvasSize: (size: { width: number; height: number }) => void;
  canvasScale: number;
  setCanvasScale: (scale: number) => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const useCanvasContext = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvasContext must be used within a CanvasProvider');
  }
  return context;
};

interface CanvasProviderProps {
  children: ReactNode;
}

export const CanvasProvider: React.FC<CanvasProviderProps> = ({ children }) => {
  const [canvasBackgroundColor, setCanvasBackgroundColor] = useState('#FFFFFF');
  const [canvasSize, setCanvasSize] = useState({ width: 688, height: 280 });
  const [canvasScale, setCanvasScale] = useState(100);

  return (
    <CanvasContext.Provider
      value={{
        canvasBackgroundColor,
        setCanvasBackgroundColor,
        canvasSize,
        setCanvasSize,
        canvasScale,
        setCanvasScale,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};