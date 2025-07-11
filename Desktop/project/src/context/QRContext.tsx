import React, { createContext, useContext, useState, ReactNode } from 'react';
import { QRElement } from '../types/QRElement';

interface QRContextType {
  qrElements: QRElement[];
  selectedQRId: string | null;
  addQRElement: (url: string, options?: Partial<QRElement>) => void;
  updateQRElement: (id: string, updates: Partial<QRElement>) => void;
  selectQRElement: (id: string | null) => void;
  deleteQRElement: (id: string) => void;
  duplicateQRElement: (id: string) => void;
}

const QRContext = createContext<QRContextType | undefined>(undefined);

export const useQRContext = () => {
  const context = useContext(QRContext);
  if (!context) {
    throw new Error('useQRContext must be used within a QRProvider');
  }
  return context;
};

interface QRProviderProps {
  children: ReactNode;
}

export const QRProvider: React.FC<QRProviderProps> = ({ children }) => {
  const [qrElements, setQRElements] = useState<QRElement[]>([]);
  const [selectedQRId, setSelectedQRId] = useState<string | null>(null);

  const addQRElement = (url: string, options: Partial<QRElement> = {}) => {
    const canvasWidth = 688;
    const canvasHeight = 280;
    const elementSize = options.width || 150;
    
    const centerX = (canvasWidth - elementSize) / 2;
    const centerY = (canvasHeight - elementSize) / 2;

    const newElement: QRElement = {
      id: `qr-${Date.now()}`,
      url,
      x: centerX,
      y: centerY,
      width: elementSize,
      height: elementSize,
      foregroundColor: '#000000',
      backgroundColor: '#FFFFFF',
      errorCorrectionLevel: 'M',
      rotation: 0,
      opacity: 100,
      isSelected: false,
      locked: false,
      cornerStyle: 'square',
      dotStyle: 'square',
      hasIcon: false,
      iconType: 'none',
      ...options,
    };

    setQRElements(prev => [...prev, newElement]);
    setSelectedQRId(newElement.id);
  };

  const updateQRElement = (id: string, updates: Partial<QRElement>) => {
    setQRElements(prev =>
      prev.map(element =>
        element.id === id ? { ...element, ...updates } : element
      )
    );
  };

  const selectQRElement = (id: string | null) => {
    setSelectedQRId(id);
    setQRElements(prev =>
      prev.map(element => ({
        ...element,
        isSelected: element.id === id,
      }))
    );
  };

  const deleteQRElement = (id: string) => {
    setQRElements(prev => prev.filter(element => element.id !== id));
    if (selectedQRId === id) {
      setSelectedQRId(null);
    }
  };

  const duplicateQRElement = (id: string) => {
    const elementToDuplicate = qrElements.find(el => el.id === id);
    if (elementToDuplicate) {
      const newElement: QRElement = {
        ...elementToDuplicate,
        id: `qr-${Date.now()}`,
        x: elementToDuplicate.x + 20,
        y: elementToDuplicate.y + 20,
        isSelected: false,
      };
      
      setQRElements(prev => [...prev, newElement]);
      setSelectedQRId(newElement.id);
    }
  };

  return (
    <QRContext.Provider
      value={{
        qrElements,
        selectedQRId,
        addQRElement,
        updateQRElement,
        selectQRElement,
        deleteQRElement,
        duplicateQRElement,
      }}
    >
      {children}
    </QRContext.Provider>
  );
};