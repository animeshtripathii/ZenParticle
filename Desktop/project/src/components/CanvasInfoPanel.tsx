import React from 'react';

interface CanvasInfoPanelProps {
  isActive?: boolean;
}

const CanvasInfoPanel: React.FC<CanvasInfoPanelProps> = ({ isActive = false }) => {
  if (!isActive) return null;

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 h-full overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Canvas Info</h2>
      <p className="text-sm text-gray-600">
        Canvas information and settings will be displayed here.
      </p>
    </div>
  );
};

export default CanvasInfoPanel;