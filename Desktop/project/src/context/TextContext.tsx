import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TextElement } from '../types/TextElement';

interface TextContextType {
  textElements: TextElement[];
  selectedTextId: string | null;
  addTextElement: (text: string) => void;
  updateTextElement: (id: string, updates: Partial<TextElement>) => void;
  selectTextElement: (id: string | null) => void;
  deleteTextElement: (id: string) => void;
  duplicateTextElement: (id: string) => void;
}

const TextContext = createContext<TextContextType | undefined>(undefined);

export const useTextContext = () => {
  const context = useContext(TextContext);
  if (!context) {
    throw new Error('useTextContext must be used within a TextProvider');
  }
  return context;
};

interface TextProviderProps {
  children: ReactNode;
}

export const TextProvider: React.FC<TextProviderProps> = ({ children }) => {
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);

  const addTextElement = (text: string) => {
    // Canvas dimensions from Canvas.tsx
    const canvasWidth = 688;
    const canvasHeight = 280;
    const elementWidth = 200;
    const elementHeight = 50;
    
    // Calculate center position
    const centerX = (canvasWidth - elementWidth) / 2;
    const centerY = (canvasHeight - elementHeight) / 2;

    const newElement: TextElement = {
      id: `text-${Date.now()}`,
      text: text || 'Your Text Here',
      x: centerX, // Center horizontally
      y: centerY, // Center vertically
      width: elementWidth,
      height: elementHeight,
      fontSize: 24,
      fontFamily: 'Arimo',
      color: '#000000',
      isBold: false,
      isItalic: false,
      isUnderline: false,
      isBulletList: false,
      isNumberedList: false,
      alignment: 'left',
      isSelected: false,
      lineHeight: 1.2,
      letterSpacing: 0,
      opacity: 100,
      rotation: 0,
      textCase: 'normal',
      curveStyle: 'none',
    };

    setTextElements(prev => [...prev, newElement]);
    // Automatically select the new text element to show the toolbar
    setSelectedTextId(newElement.id);
    console.log('New text element added and selected:', newElement.id);
  };

  const updateTextElement = (id: string, updates: Partial<TextElement>) => {
    setTextElements(prev =>
      prev.map(element =>
        element.id === id ? { ...element, ...updates } : element
      )
    );
  };

  const selectTextElement = (id: string | null) => {
    console.log('TextContext: selectTextElement called with id:', id);
    setSelectedTextId(id);
    setTextElements(prev =>
      prev.map(element => ({
        ...element,
        isSelected: element.id === id,
      }))
    );
    console.log('TextContext: selectedTextId set to:', id);
  };

  const deleteTextElement = (id: string) => {
    setTextElements(prev => prev.filter(element => element.id !== id));
    if (selectedTextId === id) {
      setSelectedTextId(null);
    }
  };

  const duplicateTextElement = (id: string) => {
    const elementToDuplicate = textElements.find(el => el.id === id);
    if (elementToDuplicate) {
      const newElement: TextElement = {
        ...elementToDuplicate,
        id: `text-${Date.now()}`,
        x: elementToDuplicate.x + 20,
        y: elementToDuplicate.y + 20,
        isSelected: false,
      };
      
      setTextElements(prev => [...prev, newElement]);
      setSelectedTextId(newElement.id);
    }
  };

  return (
    <TextContext.Provider
      value={{
        textElements,
        selectedTextId,
        addTextElement,
        updateTextElement,
        selectTextElement,
        deleteTextElement,
        duplicateTextElement,
      }}
    >
      {children}
    </TextContext.Provider>
  );
};