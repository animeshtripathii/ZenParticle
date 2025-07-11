import React, { useState } from 'react';
import { useTextContext } from '../context/TextContext';

interface EnhancedTextPanelProps {
  isActive?: boolean;
}

const EnhancedTextPanel: React.FC<EnhancedTextPanelProps> = ({ 
  isActive = false
}) => {
  const { addTextElement } = useTextContext();
  const [text, setText] = useState('');

  if (!isActive) return null;

  const handleAddText = () => {
    console.log('Adding new text element:', text || 'Your Text Here');
    addTextElement(text || 'Your Text Here');
    setText('');
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 max-w-md">
      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Text</h2>
      
      {/* Description */}
      <p className="text-gray-600 text-sm mb-6 leading-relaxed">
        Edit your text below, or click on the field you'd like to edit directly on your design.
      </p>

      {/* Text Input Field */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Type text here"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full text-gray-700 text-base bg-transparent border-0 border-b border-gray-300 focus:border-gray-400 focus:outline-none pb-2 transition-colors placeholder-gray-400"
        />
      </div>

      {/* New Text Field Button */}
      <button
        onClick={handleAddText}
        className="w-full bg-cyan-400 hover:bg-cyan-500 text-black font-semibold py-4 px-6 rounded-lg transition-colors text-base"
      >
        New Text Field
      </button>
    </div>
  );
};

export default EnhancedTextPanel;