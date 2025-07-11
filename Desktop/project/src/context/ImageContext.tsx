import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ImageElement } from '../types/ImageElement';

interface ImageContextType {
  imageElements: ImageElement[];
  selectedImageId: string | null;
  addImageElement: (src: string, originalWidth: number, originalHeight: number) => void;
  updateImageElement: (id: string, updates: Partial<ImageElement>) => void;
  selectImageElement: (id: string | null) => void;
  deleteImageElement: (id: string) => void;
  duplicateImageElement: (id: string) => void;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const useImageContext = () => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error('useImageContext must be used within an ImageProvider');
  }
  return context;
};

interface ImageProviderProps {
  children: ReactNode;
}

export const ImageProvider: React.FC<ImageProviderProps> = ({ children }) => {
  const [imageElements, setImageElements] = useState<ImageElement[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const addImageElement = (src: string, originalWidth: number, originalHeight: number) => {
    try {
      // Validate inputs
      if (!src || originalWidth <= 0 || originalHeight <= 0) {
        console.error('Invalid image parameters:', { src, originalWidth, originalHeight });
        return;
      }
      
      // Canvas dimensions - exact 688x280 as specified
      const canvasWidth = 688;
      const canvasHeight = 280;
      
      // Calculate scaled dimensions to fit within canvas while maintaining aspect ratio
      // Use a more generous portion of the canvas for better visibility
      const maxWidth = canvasWidth * 0.4; // Smaller to match the reference image
      const maxHeight = canvasHeight * 0.8;
      
      const aspectRatio = originalWidth / originalHeight;
      let width, height;
      
      // Determine which dimension is the limiting factor
      if (originalWidth > originalHeight) {
        // Landscape or square image - limit by width
        width = Math.min(maxWidth, originalWidth);
        height = width / aspectRatio;
        
        // If height exceeds max, scale down
        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }
      } else {
        // Portrait image - limit by height
        height = maxHeight;
        width = maxHeight * aspectRatio;
        
        // If width exceeds max, scale down
        if (width > maxWidth) {
          width = maxWidth;
          height = width / aspectRatio;
        }
      }
      
      // Ensure minimum size for better usability
      const minSize = 80;
      if (width < minSize) {
        width = minSize;
        height = minSize / aspectRatio;
      }
      if (height < minSize) {
        height = minSize;
        width = minSize * aspectRatio;
      }
      
      // Final constraint check - ensure it never exceeds canvas bounds
      width = Math.min(width, canvasWidth * 0.5);
      height = Math.min(height, canvasHeight * 0.9);
      
      // Calculate center position
      const centerX = (canvasWidth - width) / 2;
      const centerY = (canvasHeight - height) / 2;

      const newElement: ImageElement = {
        id: `image-${Date.now()}`,
        src,
        x: centerX,
        y: centerY,
        width,
        height,
        rotation: 0,
        opacity: 100,
        filter: 'none',
        transform: '',
        isSelected: false,
        originalWidth,
        originalHeight,
        locked: false,
        cropData: null,
        clipPath: 'none',
      };

      setImageElements(prev => [...prev, newElement]);
      setSelectedImageId(newElement.id);

      console.log('Image element created successfully:', {
        id: newElement.id,
        dimensions: `${width.toFixed(1)}x${height.toFixed(1)}`,
        position: `${centerX.toFixed(1)}, ${centerY.toFixed(1)}`,
        originalDimensions: `${originalWidth}x${originalHeight}`,
        canvasDimensions: `${canvasWidth}x${canvasHeight}`
      });
    } catch (error) {
      console.error('Error in addImageElement:', error);
    }
  };

  const updateImageElement = (id: string, updates: Partial<ImageElement>) => {
    setImageElements(prev =>
      prev.map(element =>
        element.id === id ? { ...element, ...updates } : element
      )
    );
  };

  const selectImageElement = (id: string | null) => {
    setSelectedImageId(id);
    setImageElements(prev =>
      prev.map(element => ({
        ...element,
        isSelected: element.id === id,
      }))
    );
  };

  const deleteImageElement = (id: string) => {
    setImageElements(prev => prev.filter(element => element.id !== id));
    if (selectedImageId === id) {
      setSelectedImageId(null);
    }
  };

  const duplicateImageElement = (id: string) => {
    const elementToDuplicate = imageElements.find(el => el.id === id);
    if (elementToDuplicate) {
      const newElement: ImageElement = {
        ...elementToDuplicate,
        id: `image-${Date.now()}`,
        x: elementToDuplicate.x + 20,
        y: elementToDuplicate.y + 20,
        isSelected: false,
      };
      
      setImageElements(prev => {
        const updated = [...prev, newElement];
        console.log('Image element added to context:', newElement.id);
        return updated;
      });
      setSelectedImageId(newElement.id);
    }
  };

  return (
    <ImageContext.Provider
      value={{
        imageElements,
        selectedImageId,
        addImageElement,
        updateImageElement,
        selectImageElement,
        deleteImageElement,
        duplicateImageElement,
      }}
    >
      {children}
    </ImageContext.Provider>
  );
};