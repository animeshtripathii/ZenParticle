import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ViewOption {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

interface ViewContextType {
  viewOptions: ViewOption[];
  toggleViewOption: (id: string) => void;
  isGridVisible: boolean;
  isRulersVisible: boolean;
  isSafetyAreaVisible: boolean;
  isHighlightEmptyTextVisible: boolean;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export const useViewContext = () => {
  const context = useContext(ViewContext);
  if (!context) {
    throw new Error('useViewContext must be used within a ViewProvider');
  }
  return context;
};

interface ViewProviderProps {
  children: ReactNode;
}

export const ViewProvider: React.FC<ViewProviderProps> = ({ children }) => {
  const [viewOptions, setViewOptions] = useState<ViewOption[]>([
    {
      id: 'grids',
      label: 'Grids',
      description: 'Used to align your design.',
      enabled: false,
    },
    {
      id: 'rulers',
      label: 'Rulers',
      description: 'This is the size of your design.',
      enabled: true,
    },
    {
      id: 'safety-bleed',
      label: 'Safety area & Bleed',
      description: 'Text and images should fit inside, anything outside the line will get cut.',
      enabled: true,
    },
    {
      id: 'highlight-empty',
      label: 'Highlight empty text',
      description: 'Empty text is indicated by dashed line around text box.',
      enabled: true,
    },
  ]);

  const toggleViewOption = (id: string) => {
    setViewOptions(prev =>
      prev.map(option =>
        option.id === id ? { ...option, enabled: !option.enabled } : option
      )
    );
  };

  // Computed values for easy access
  const isGridVisible = viewOptions.find(opt => opt.id === 'grids')?.enabled || false;
  const isRulersVisible = viewOptions.find(opt => opt.id === 'rulers')?.enabled || false;
  const isSafetyAreaVisible = viewOptions.find(opt => opt.id === 'safety-bleed')?.enabled || false;
  const isHighlightEmptyTextVisible = viewOptions.find(opt => opt.id === 'highlight-empty')?.enabled || false;

  return (
    <ViewContext.Provider
      value={{
        viewOptions,
        toggleViewOption,
        isGridVisible,
        isRulersVisible,
        isSafetyAreaVisible,
        isHighlightEmptyTextVisible,
      }}
    >
      {children}
    </ViewContext.Provider>
  );
};