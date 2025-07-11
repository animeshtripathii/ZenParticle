import React from 'react';
import { X, Info, Eye, Settings, Download } from 'lucide-react';

interface TextureMappingDebuggerProps {
  isOpen: boolean;
  onClose: () => void;
}

const TextureMappingDebugger: React.FC<TextureMappingDebuggerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Info className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Texture Mapping Debugger</h2>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Debug Info Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Texture Mapping Information
              </h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Canvas Dimensions:</span>
                  <span className="ml-2 text-gray-600">688 × 280 pixels</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">3D Model:</span>
                  <span className="ml-2 text-gray-600">Mug (GLTF)</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Texture Resolution:</span>
                  <span className="ml-2 text-gray-600">1024 × 1024</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">UV Mapping:</span>
                  <span className="ml-2 text-gray-600">Cylindrical</span>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Texture Preview
              </h3>
              
              <div className="bg-white rounded-lg border-2 border-dashed border-blue-300 h-64 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <Eye className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="font-medium">Texture Preview</p>
                  <p className="text-sm">Generated texture will appear here</p>
                </div>
              </div>
            </div>

            {/* Debug Controls */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Debug Controls</h3>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm text-gray-700">Show UV wireframe</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm text-gray-700">Display texture coordinates</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm text-gray-700">Highlight mapping errors</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Debug mode helps visualize how 2D canvas elements map to the 3D mug surface
            </div>
            
            <div className="flex space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                <span>Export Debug Info</span>
              </button>
              
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextureMappingDebugger;