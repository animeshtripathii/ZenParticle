import React, { useState } from 'react';
import { Save, Undo, Redo, FileText, Maximize2, Eye, ChevronRight, Info } from 'lucide-react';
import Preview3DModal from './Preview3DModal';
import { useTextContext } from '../context/TextContext';
import { useImageContext } from '../context/ImageContext';
import { useGraphicsContext } from '../context/GraphicsContext';
import { useQRContext } from '../context/QRContext';

const EnhancedHeader: React.FC = () => {
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  // Get context functions to clear selections when opening preview
  const { selectTextElement } = useTextContext();
  const { selectImageElement } = useImageContext();
  const { selectGraphicElement } = useGraphicsContext();
  const { selectQRElement } = useQRContext();

  const handlePreviewClick = () => {
    // Close any open view panel
    // Clear all element selections to hide all floating toolbars
    selectTextElement(null);
    selectImageElement(null);
    selectGraphicElement(null);
    selectQRElement(null);
    
    // Open the preview modal
    setShowPreviewModal(true);
  };

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-6 py-3 relative">
        <div className="flex items-center justify-between">
          {/* Left side - Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="font-medium text-blue-600">My Projects</span>
            <ChevronRight className="w-4 h-4" />
            <span className="font-medium">Personalised Mugs</span>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors">
              <Save className="w-4 h-4" />
              <span className="font-medium">Save</span>
            </button>
            
            <div className="flex items-center space-x-1">
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors" title="Undo">
                <Undo className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors" title="Redo">
                <Redo className="w-4 h-4" />
              </button>
            </div>

            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              <FileText className="w-4 h-4" />
              <span>Specs & Templates</span>
            </button>

            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              <Maximize2 className="w-4 h-4" />
              <span>Change size</span>
            </button>

            <button 
              onClick={handlePreviewClick}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>

            <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium">
              Next
            </button>
          </div>
        </div>

      </div>

      {/* 3D Preview Modal */}
      <Preview3DModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
      />
    </>
  );
};

export default EnhancedHeader;