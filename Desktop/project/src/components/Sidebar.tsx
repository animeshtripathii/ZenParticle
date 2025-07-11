import React, { useState } from 'react';
import { Type, Image, Shapes, QrCode, Table } from 'lucide-react';
import TextPanel from './TextPanel';

interface Tool {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tools: Tool[] = [
  { id: 'text', name: 'Text', icon: Type },
  { id: 'images', name: 'Images', icon: Image },
  { id: 'graphics', name: 'Graphics', icon: Shapes },
  { id: 'qr-codes', name: 'QR-codes', icon: QrCode },
  { id: 'tables', name: 'Tables', icon: Table },
];

const Sidebar: React.FC = () => {
  const [activeTool, setActiveTool] = useState<string>('text');

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex">
      {/* Tool Icons */}
      <div className="w-20 bg-gray-50 border-r border-gray-200">
        <div className="flex flex-col py-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`flex flex-col items-center p-3 mx-2 mb-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{tool.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tool Panel */}
      <div className="flex-1 p-4 relative overflow-visible">
        {activeTool === 'text' && (
          <TextPanel isActive={true} />
        )}
        
        {activeTool === 'images' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Images</h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload your own images or choose from our library.
            </p>
            <button className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
              Upload Image
            </button>
          </div>
        )}
        
        {activeTool === 'graphics' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Graphics</h3>
            <p className="text-sm text-gray-600 mb-4">
              Add clipart, stickers, and design elements to your project.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"></div>
              ))}
            </div>
          </div>
        )}
        
        {activeTool === 'qr-codes' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">QR Codes</h3>
            <p className="text-sm text-gray-600 mb-4">
              Create custom QR codes for your design.
            </p>
            <button className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
              Generate QR Code
            </button>
          </div>
        )}
        
        {activeTool === 'tables' && (
          <div>
            <h3 className="text-lg font-semibbold mb-4">Tables</h3>
            <p className="text-sm text-gray-600 mb-4">
              Add tables for structured content layout.
            </p>
            <button className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
              Insert Table
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;