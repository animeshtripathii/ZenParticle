import React, { useState } from 'react';
import { Search, Circle, Square, Triangle, Star, Hexagon, Heart, ArrowRight, ArrowLeftRight, Minus, Image, Mountain, Grid3X3, ChevronRight, Plus, X, Zap, Sun, Moon, Cloud, Umbrella, Coffee, Camera, Music, Phone, Mail, Home, Car, Plane, Ship, Bike, Trees as Tree, Flower, Leaf, Apple, Gift, Crown, Shield, Key, Lock, Bell, Clock, Calendar, Book, Pen, Scissors, Palette, Brush, Lightbulb, Target, Flag, Trophy, Medal, Rocket, Globe, Map, Compass, Anchor, Gem, Siren as Fire, Snowflake, Rainbow, Router as Butterfly, Cat, Dog, Bird, Fish } from 'lucide-react';
import { useGraphicsContext } from '../context/GraphicsContext';

interface GraphicsPanelProps {
  isActive?: boolean;
}

const GraphicsPanel: React.FC<GraphicsPanelProps> = ({ isActive = false }) => {
  const { addGraphicElement } = useGraphicsContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('shapes');

  // Enhanced shapes with more geometric options and better visual representations
  const shapes = [
    { id: 'rectangle', name: 'Rectangle', icon: Square, type: 'rectangle' as const, bgColor: '#000000' },
    { id: 'circle', name: 'Circle', icon: Circle, type: 'circle' as const, bgColor: '#000000' },
    { id: 'triangle', name: 'Triangle', icon: Triangle, type: 'triangle' as const, bgColor: '#000000' },
    { id: 'pentagon', name: 'Pentagon', icon: '⬟', type: 'pentagon' as const, bgColor: '#000000' },
    
    { id: 'line', name: 'Line', icon: Minus, type: 'line' as const, bgColor: '#000000' },
    { id: 'arrow-right', name: 'Arrow Right', icon: ArrowRight, type: 'arrow' as const, bgColor: '#000000' },
    { id: 'arrow-both', name: 'Arrow Both', icon: ArrowLeftRight, type: 'arrow' as const, bgColor: '#000000' },
    { id: 'star', name: 'Star', icon: Star, type: 'star' as const, bgColor: '#000000' },
    
    { id: 'hexagon', name: 'Hexagon', icon: Hexagon, type: 'hexagon' as const, bgColor: '#000000' },
    { id: 'heart', name: 'Heart', icon: Heart, type: 'heart' as const, bgColor: '#FF69B4' },
    { id: 'diamond', name: 'Diamond', icon: '💎', type: 'diamond' as const, bgColor: '#87CEEB' },
    { id: 'octagon', name: 'Octagon', icon: '⯃', type: 'octagon' as const, bgColor: '#000000' },
    
    { id: 'oval', name: 'Oval', icon: '⭕', type: 'oval' as const, bgColor: '#000000' },
    { id: 'plus', name: 'Plus', icon: Plus, type: 'plus' as const, bgColor: '#000000' },
    { id: 'cross', name: 'Cross', icon: X, type: 'cross' as const, bgColor: '#000000' },
    { id: 'lightning', name: 'Lightning', icon: Zap, type: 'lightning' as const, bgColor: '#FFD700' },
  ];

  // Comprehensive icons collection
  const icons = [
    // Nature & Weather
    { id: 'sun', name: 'Sun', icon: Sun, bgColor: '#FFD700' },
    { id: 'moon', name: 'Moon', icon: Moon, bgColor: '#C0C0C0' },
    { id: 'cloud', name: 'Cloud', icon: Cloud, bgColor: '#87CEEB' },
    { id: 'umbrella', name: 'Umbrella', icon: Umbrella, bgColor: '#FF6347' },
    { id: 'tree', name: 'Tree', icon: Tree, bgColor: '#228B22' },
    { id: 'flower', name: 'Flower', icon: Flower, bgColor: '#FF69B4' },
    { id: 'leaf', name: 'Leaf', icon: Leaf, bgColor: '#32CD32' },
    { id: 'apple', name: 'Apple', icon: Apple, bgColor: '#FF0000' },
    
    // Technology & Communication
    { id: 'phone', name: 'Phone', icon: Phone, bgColor: '#000000' },
    { id: 'mail', name: 'Mail', icon: Mail, bgColor: '#4169E1' },
    { id: 'camera', name: 'Camera', icon: Camera, bgColor: '#000000' },
    { id: 'music', name: 'Music', icon: Music, bgColor: '#9370DB' },
    { id: 'lightbulb', name: 'Lightbulb', icon: Lightbulb, bgColor: '#FFD700' },
    { id: 'rocket', name: 'Rocket', icon: Rocket, bgColor: '#FF4500' },
    { id: 'globe', name: 'Globe', icon: Globe, bgColor: '#4169E1' },
    { id: 'compass', name: 'Compass', icon: Compass, bgColor: '#8B4513' },
    
    // Home & Lifestyle
    { id: 'home', name: 'Home', icon: Home, bgColor: '#8B4513' },
    { id: 'coffee', name: 'Coffee', icon: Coffee, bgColor: '#8B4513' },
    { id: 'gift', name: 'Gift', icon: Gift, bgColor: '#FF69B4' },
    { id: 'crown', name: 'Crown', icon: Crown, bgColor: '#FFD700' },
    { id: 'key', name: 'Key', icon: Key, bgColor: '#C0C0C0' },
    { id: 'lock', name: 'Lock', icon: Lock, bgColor: '#000000' },
    { id: 'bell', name: 'Bell', icon: Bell, bgColor: '#FFD700' },
    { id: 'clock', name: 'Clock', icon: Clock, bgColor: '#000000' },
    
    // Transportation
    { id: 'car', name: 'Car', icon: Car, bgColor: '#FF0000' },
    { id: 'plane', name: 'Plane', icon: Plane, bgColor: '#87CEEB' },
    { id: 'ship', name: 'Ship', icon: Ship, bgColor: '#4169E1' },
    { id: 'bike', name: 'Bike', icon: Bike, bgColor: '#32CD32' },
    { id: 'anchor', name: 'Anchor', icon: Anchor, bgColor: '#000000' },
    
    // Office & Creative
    { id: 'calendar', name: 'Calendar', icon: Calendar, bgColor: '#FF6347' },
    { id: 'book', name: 'Book', icon: Book, bgColor: '#8B4513' },
    { id: 'pen', name: 'Pen', icon: Pen, bgColor: '#4169E1' },
    { id: 'scissors', name: 'Scissors', icon: Scissors, bgColor: '#C0C0C0' },
    { id: 'palette', name: 'Palette', icon: Palette, bgColor: '#FF69B4' },
    { id: 'brush', name: 'Brush', icon: Brush, bgColor: '#8B4513' },
    
    // Sports & Achievement
    { id: 'target', name: 'Target', icon: Target, bgColor: '#FF0000' },
    { id: 'flag', name: 'Flag', icon: Flag, bgColor: '#FF6347' },
    { id: 'trophy', name: 'Trophy', icon: Trophy, bgColor: '#FFD700' },
    { id: 'medal', name: 'Medal', icon: Medal, bgColor: '#FFD700' },
    { id: 'shield', name: 'Shield', icon: Shield, bgColor: '#4169E1' },
    
    // Animals
    { id: 'cat', name: 'Cat', icon: Cat, bgColor: '#FFA500' },
    { id: 'dog', name: 'Dog', icon: Dog, bgColor: '#8B4513' },
    { id: 'bird', name: 'Bird', icon: Bird, bgColor: '#87CEEB' },
    { id: 'fish', name: 'Fish', icon: Fish, bgColor: '#4169E1' },
    { id: 'butterfly', name: 'Butterfly', icon: Butterfly, bgColor: '#FF69B4' },
  ];

  // Enhanced clipart with emojis and symbols
  const clipart = [
    // Decorative Elements
    { id: 'sparkles', name: 'Sparkles', icon: '✨', bgColor: '#FFD700' },
    { id: 'rainbow', name: 'Rainbow', icon: '🌈', bgColor: '#FF69B4' },
    { id: 'fire', name: 'Fire', icon: '🔥', bgColor: '#FF4500' },
    { id: 'snowflake', name: 'Snowflake', icon: '❄️', bgColor: '#87CEEB' },
    { id: 'gem', name: 'Gem', icon: '💎', bgColor: '#87CEEB' },
    { id: 'crystal', name: 'Crystal', icon: '🔮', bgColor: '#9370DB' },
    
    // Celebration & Events
    { id: 'balloon', name: 'Balloon', icon: '🎈', bgColor: '#FF69B4' },
    { id: 'party', name: 'Party', icon: '🎉', bgColor: '#FFD700' },
    { id: 'confetti', name: 'Confetti', icon: '🎊', bgColor: '#FF69B4' },
    { id: 'birthday', name: 'Birthday', icon: '🎂', bgColor: '#FFB6C1' },
    { id: 'gift-box', name: 'Gift Box', icon: '🎁', bgColor: '#FF69B4' },
    { id: 'ribbon', name: 'Ribbon', icon: '🎀', bgColor: '#FF69B4' },
    
    // Food & Drinks
    { id: 'pizza', name: 'Pizza', icon: '🍕', bgColor: '#FF6347' },
    { id: 'burger', name: 'Burger', icon: '🍔', bgColor: '#8B4513' },
    { id: 'ice-cream', name: 'Ice Cream', icon: '🍦', bgColor: '#FFB6C1' },
    { id: 'donut', name: 'Donut', icon: '🍩', bgColor: '#DDA0DD' },
    { id: 'coffee-cup', name: 'Coffee Cup', icon: '☕', bgColor: '#8B4513' },
    { id: 'wine', name: 'Wine', icon: '🍷', bgColor: '#800080' },
    
    // Symbols & Signs
    { id: 'heart-red', name: 'Red Heart', icon: '❤️', bgColor: '#FF0000' },
    { id: 'heart-blue', name: 'Blue Heart', icon: '💙', bgColor: '#4169E1' },
    { id: 'heart-green', name: 'Green Heart', icon: '💚', bgColor: '#32CD32' },
    { id: 'heart-yellow', name: 'Yellow Heart', icon: '💛', bgColor: '#FFD700' },
    { id: 'heart-purple', name: 'Purple Heart', icon: '💜', bgColor: '#9370DB' },
    { id: 'peace', name: 'Peace', icon: '☮️', bgColor: '#32CD32' },
    { id: 'yin-yang', name: 'Yin Yang', icon: '☯️', bgColor: '#000000' },
    { id: 'infinity', name: 'Infinity', icon: '∞', bgColor: '#4169E1' },
    
    // Music & Entertainment
    { id: 'musical-note', name: 'Musical Note', icon: '🎵', bgColor: '#9370DB' },
    { id: 'guitar', name: 'Guitar', icon: '🎸', bgColor: '#8B4513' },
    { id: 'microphone', name: 'Microphone', icon: '🎤', bgColor: '#C0C0C0' },
    { id: 'headphones', name: 'Headphones', icon: '🎧', bgColor: '#000000' },
    { id: 'movie', name: 'Movie', icon: '🎬', bgColor: '#000000' },
    { id: 'theater', name: 'Theater', icon: '🎭', bgColor: '#FFD700' },
    
    // Sports & Activities
    { id: 'soccer', name: 'Soccer', icon: '⚽', bgColor: '#000000' },
    { id: 'basketball', name: 'Basketball', icon: '🏀', bgColor: '#FF8C00' },
    { id: 'tennis', name: 'Tennis', icon: '🎾', bgColor: '#32CD32' },
    { id: 'baseball', name: 'Baseball', icon: '⚾', bgColor: '#FFFFFF' },
    { id: 'football', name: 'Football', icon: '🏈', bgColor: '#8B4513' },
    { id: 'golf', name: 'Golf', icon: '⛳', bgColor: '#32CD32' },
    
    // Travel & Places
    { id: 'mountain', name: 'Mountain', icon: '🏔️', bgColor: '#87CEEB' },
    { id: 'beach', name: 'Beach', icon: '🏖️', bgColor: '#FFD700' },
    { id: 'island', name: 'Island', icon: '🏝️', bgColor: '#32CD32' },
    { id: 'city', name: 'City', icon: '🏙️', bgColor: '#C0C0C0' },
    { id: 'castle', name: 'Castle', icon: '🏰', bgColor: '#8B4513' },
    { id: 'tent', name: 'Tent', icon: '⛺', bgColor: '#FF6347' },
  ];

  const handleAddShape = (type: any) => {
    // Add shape with default border settings
    addGraphicElement(type, {
      fillColor: '#3B82F6',
      strokeColor: '#000000',
      strokeWidth: 0, // Start with no border, user can add it via toolbar
      strokeStyle: 'solid'
    });
  };

  const handleAddIcon = (iconData: any) => {
    // Add icon as a graphic element with special properties
    addGraphicElement('circle', {
      iconType: iconData.id,
      iconName: iconData.name,
      fillColor: iconData.bgColor,
      strokeColor: '#000000',
      strokeWidth: 0,
      strokeStyle: 'solid',
      isIcon: true
    });
  };

  const handleAddClipart = (clipartData: any) => {
    // Add clipart as a graphic element with special properties
    addGraphicElement('circle', {
      clipartType: clipartData.id,
      clipartName: clipartData.name,
      fillColor: clipartData.bgColor,
      strokeColor: '#000000',
      strokeWidth: 0,
      strokeStyle: 'solid',
      isClipart: true,
      emoji: clipartData.icon
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const renderShapeIcon = (shape: any) => {
    if (shape.id === 'rectangle') {
      return <div className="w-8 h-6 bg-black rounded-sm"></div>;
    } else if (shape.id === 'circle') {
      return <div className="w-8 h-8 bg-black rounded-full"></div>;
    } else if (shape.id === 'triangle') {
      return (
        <div className="w-0 h-0 border-l-[16px] border-r-[16px] border-b-[24px] border-l-transparent border-r-transparent border-b-black"></div>
      );
    } else if (shape.id === 'pentagon') {
      return (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="black">
          <path d="M12 2l7.5 5.5-2.9 8.9H7.4L4.5 7.5L12 2z"/>
        </svg>
      );
    } else if (shape.id === 'star') {
      return (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="black">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      );
    } else if (shape.id === 'hexagon') {
      return (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="black">
          <path d="M17.5 3.5L22 12l-4.5 8.5h-11L2 12l4.5-8.5h11z"/>
        </svg>
      );
    } else if (shape.id === 'heart') {
      return <span className="text-2xl" style={{ color: shape.bgColor }}>♥</span>;
    } else if (shape.id === 'diamond') {
      return (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="black">
          <path d="M12 2l5 7-5 13-5-13 5-7z"/>
        </svg>
      );
    } else if (shape.id === 'octagon') {
      return (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="black">
          <path d="M8 2h8l6 6v8l-6 6H8l-6-6V8l6-6z"/>
        </svg>
      );
    } else if (shape.id === 'oval') {
      return (
        <svg className="w-8 h-6" viewBox="0 0 32 20" fill="black">
          <ellipse cx="16" cy="10" rx="15" ry="9"/>
        </svg>
      );
    } else if (shape.id === 'line') {
      return <div className="w-10 h-0.5 bg-black"></div>;
    } else if (shape.id === 'arrow-right') {
      return (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      );
    } else if (shape.id === 'arrow-both') {
      return (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
          <path d="M21 12H3M6 6l-3 6 3 6M18 6l3 6-3 6"/>
        </svg>
      );
    } else if (shape.id === 'plus') {
      return (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      );
    } else if (shape.id === 'cross') {
      return (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      );
    } else if (shape.id === 'lightning') {
      return (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#FFD700" stroke="#FFD700" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      );
    }
    return null;
  };

  const filteredShapes = shapes.filter(shape => 
    shape.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredIcons = icons.filter(icon => 
    icon.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredClipart = clipart.filter(clip => 
    clip.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 h-full overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Graphics</h2>
      
      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search all graphics"
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-4 pr-12 py-3 border-2 border-blue-400 rounded-lg focus:outline-none focus:border-blue-500 text-gray-700 placeholder-gray-500"
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors">
            <Search className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex mb-6 border-b border-gray-200">
        {[
          { id: 'shapes', label: 'Shapes' },
          { id: 'icons', label: 'Icons' },
          { id: 'clipart', label: 'Clipart' }
        ].map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-4 py-2 font-medium text-sm transition-colors relative ${
              activeCategory === category.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Shapes Section */}
      {activeCategory === 'shapes' && (
        <div className="mb-8">
          <div className="grid grid-cols-4 gap-3">
            {filteredShapes.map((shape) => (
              <button
                key={shape.id}
                onClick={() => handleAddShape(shape.type)}
                className="aspect-square border-2 rounded-lg p-3 flex items-center justify-center hover:bg-gray-50 transition-all duration-200 hover:scale-105 group border-gray-200 hover:border-gray-300 hover:shadow-md"
                title={shape.name}
              >
                {renderShapeIcon(shape)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Icons Section */}
      {activeCategory === 'icons' && (
        <div className="mb-8">
          <div className="grid grid-cols-4 gap-3">
            {filteredIcons.map((icon) => {
              const IconComponent = icon.icon;
              return (
                <button
                  key={icon.id}
                  onClick={() => handleAddIcon(icon)}
                  className="aspect-square border-2 border-gray-200 rounded-lg p-3 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 hover:scale-105 group hover:shadow-md"
                  title={icon.name}
                  style={{ backgroundColor: `${icon.bgColor}20` }}
                >
                  <IconComponent 
                    className="w-6 h-6" 
                    style={{ color: icon.bgColor }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Clipart Section */}
      {activeCategory === 'clipart' && (
        <div className="mb-6">
          <div className="grid grid-cols-4 gap-3">
            {filteredClipart.map((clip) => (
              <button
                key={clip.id}
                onClick={() => handleAddClipart(clip)}
                className="aspect-square border-2 border-gray-200 rounded-lg p-3 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 hover:scale-105 group hover:shadow-md"
                title={clip.name}
                style={{ backgroundColor: `${clip.bgColor}20` }}
              >
                <span className="text-2xl">{clip.icon}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Show More Button */}
      <div className="text-center mt-6">
        <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors mx-auto">
          <span className="text-sm font-medium">Load more graphics</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default GraphicsPanel;