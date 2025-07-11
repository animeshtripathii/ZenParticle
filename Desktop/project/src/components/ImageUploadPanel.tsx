import React, { useState } from 'react';
import { Upload, Smartphone, QrCode, LogIn, Cloud } from 'lucide-react';
import { useImageContext } from '../context/ImageContext';
import { createCanvasFromImage } from '../utils/canvasImageLoader';

interface ImageUploadPanelProps {
  isActive?: boolean;
}

const ImageUploadPanel: React.FC<ImageUploadPanelProps> = ({ isActive = false }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'discover'>('upload');
  const { addImageElement } = useImageContext();

  const acceptedFormats = [
    '.jpg', '.jpeg', '.jfif', '.bmp', '.png', '.gif', '.heic', '.svg', 
    '.webp', '.tif', '.tiff'
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file, index) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          console.error('Invalid file type:', file.type);
          return;
        }
        
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          console.error('File too large:', file.size);
          return;
        }
        
        try {
          // Create a URL for the file and load it
          const fileUrl = URL.createObjectURL(file);
          
          // Create an image to get dimensions
          const img = new Image();
          
          img.onload = () => {
            try {
              // Add the image to canvas with proper sizing for 688x280 canvas
              addImageElement(fileUrl, img.naturalWidth, img.naturalHeight);
              
              // Log for debugging
              console.log('Image uploaded successfully:', {
                originalSize: `${img.naturalWidth}x${img.naturalHeight}`,
                fileName: file.name,
                fileSize: `${(file.size / 1024).toFixed(1)}KB`,
                canvasDimensions: '688x280'
              });
            } catch (error) {
              console.error('Error adding image to canvas:', error);
            }
          };
          
          img.onerror = (error) => {
            console.error('Error loading image:', error);
            URL.revokeObjectURL(fileUrl); // Clean up the URL
          };
          
          img.src = fileUrl;
        } catch (error) {
          console.error('Error processing image file:', error);
        }
      });
      
      // Clear the input
      event.target.value = '';
    }
  };

  const handlePhoneUpload = () => {
    // Handle phone upload logic here
    console.log('Phone upload initiated');
  };

  const handleSignIn = () => {
    // Handle sign in logic here
    console.log('Sign in initiated');
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Images</h2>
      
      {/* Tabs */}
      <div className="flex mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 font-medium text-sm transition-colors relative ${
            activeTab === 'upload'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Upload
        </button>
        <button
          onClick={() => setActiveTab('discover')}
          className={`px-4 py-2 font-medium text-sm transition-colors relative ml-6 ${
            activeTab === 'discover'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Discover
        </button>
      </div>

      {/* Upload Tab Content */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          {/* Accepted Formats */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Accepted formats</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {acceptedFormats.join(', ')}
            </p>
          </div>

          {/* Upload Buttons */}
          <div className="space-y-3">
            {/* Main Upload Button */}
            <label className="block">
              <input
                type="file"
                multiple={true}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors cursor-pointer flex items-center justify-center space-x-3">
                <Cloud className="w-5 h-5" />
                <span>Upload Images</span>
              </div>
            </label>
            
            <div className="text-xs text-gray-500 mt-2 text-center">
              Canvas dimensions: 688 × 280 pixels
            </div>

            {/* Phone Upload Button */}
            <button
              onClick={handlePhoneUpload}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg border border-gray-300 transition-colors flex items-center justify-center space-x-3"
            >
              <QrCode className="w-4 h-4" />
              <span>Upload from phone</span>
            </button>
          </div>

          {/* Sign-in Section */}
          <div className="pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">
                Sign in to access previous uploads.
              </p>
              <button
                onClick={handleSignIn}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign in</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discover Tab Content */}
      {activeTab === 'discover' && (
        <div className="space-y-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Discover Images</h3>
            <p className="text-sm text-gray-600 mb-6">
              Browse our collection of stock photos, illustrations, and graphics.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-sm mx-auto mb-6">
              <input
                type="text"
                placeholder="Search images..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Categories */}
            <div className="grid grid-cols-2 gap-3">
              {['Business', 'Nature', 'Technology', 'People', 'Abstract', 'Food'].map((category) => (
                <button
                  key={category}
                  className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadPanel;