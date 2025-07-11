import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GraphicElement } from '../types/GraphicElement';

interface GraphicsContextType {
  graphicElements: GraphicElement[];
  selectedGraphicId: string | null;
  addGraphicElement: (type: GraphicElement['type'], options?: Partial<GraphicElement>) => void;
  updateGraphicElement: (id: string, updates: Partial<GraphicElement>) => void;
  selectGraphicElement: (id: string | null) => void;
  deleteGraphicElement: (id: string) => void;
  duplicateGraphicElement: (id: string) => void;
}

const GraphicsContext = createContext<GraphicsContextType | undefined>(undefined);

export const useGraphicsContext = () => {
  const context = useContext(GraphicsContext);
  if (!context) {
    throw new Error('useGraphicsContext must be used within a GraphicsProvider');
  }
  return context;
};

interface GraphicsProviderProps {
  children: ReactNode;
}

export const GraphicsProvider: React.FC<GraphicsProviderProps> = ({ children }) => {
  const [graphicElements, setGraphicElements] = useState<GraphicElement[]>([]);
  const [selectedGraphicId, setSelectedGraphicId] = useState<string | null>(null);

  const addGraphicElement = (type: GraphicElement['type'], options: Partial<GraphicElement> = {}) => {
    const canvasWidth = 688;
    const canvasHeight = 280;
    const elementWidth = 100;
    const elementHeight = 100;
    
    const centerX = (canvasWidth - elementWidth) / 2;
    const centerY = (canvasHeight - elementHeight) / 2;

    const newElement: GraphicElement = {
      id: `graphic-${Date.now()}`,
      type,
      x: centerX,
      y: centerY,
      width: elementWidth,
      height: elementHeight,
      fillColor: options?.fillColor || '#3B82F6',
      strokeColor: options?.strokeColor || '#000000',
      strokeWidth: options?.strokeWidth || 0,
      strokeStyle: options?.strokeStyle || 'solid',
      rotation: 0,
      opacity: 100,
      isSelected: false,
      locked: false,
      ...options,
    };

    setGraphicElements(prev => [...prev, newElement]);
    setSelectedGraphicId(newElement.id);
  };

  const updateGraphicElement = (id: string, updates: Partial<GraphicElement>) => {
    setGraphicElements(prev =>
      prev.map(element =>
        element.id === id ? { ...element, ...updates } : element
      )
    );
  };

  const selectGraphicElement = (id: string | null) => {
    setSelectedGraphicId(id);
    setGraphicElements(prev =>
      prev.map(element => ({
        ...element,
        isSelected: element.id === id,
      }))
    );
  };

  const deleteGraphicElement = (id: string) => {
    setGraphicElements(prev => prev.filter(element => element.id !== id));
    if (selectedGraphicId === id) {
      setSelectedGraphicId(null);
    }
  };

  const duplicateGraphicElement = (id: string) => {
    const elementToDuplicate = graphicElements.find(el => el.id === id);
    if (elementToDuplicate) {
      const newElement: GraphicElement = {
        ...elementToDuplicate,
        id: `graphic-${Date.now()}`,
        x: elementToDuplicate.x + 20,
        y: elementToDuplicate.y + 20,
        isSelected: false,
      };
      
      setGraphicElements(prev => [...prev, newElement]);
      setSelectedGraphicId(newElement.id);
    }
  };

  return (
    <GraphicsContext.Provider
      value={{
        graphicElements,
        selectedGraphicId,
        addGraphicElement,
        updateGraphicElement,
        selectGraphicElement,
        deleteGraphicElement,
        duplicateGraphicElement,
      }}
    >
      {children}
    </GraphicsContext.Provider>
  );
};