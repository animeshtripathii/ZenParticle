import React, { useState, useEffect } from 'react';
import { QrCode, Globe, Plus, AlertCircle, ExternalLink, CheckCircle, Loader2, ArrowLeft, Check, X } from 'lucide-react';
import { useQRContext } from '../context/QRContext';
import QRCode from 'qrcode';

interface QRCodePanelProps {
  isActive?: boolean;
}

interface WebsiteMetadata {
  title: string;
  description: string;
  favicon: string;
  url: string;
}

const QRCodePanel: React.FC<QRCodePanelProps> = ({ isActive = false }) => {
  const { addQRElement } = useQRContext();
  const [url, setUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [metadata, setMetadata] = useState<WebsiteMetadata | null>(null);
  const [error, setError] = useState<string>('');
  const [qrPreview, setQrPreview] = useState<string>('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  
  // QR Code options
  const [qrSize, setQrSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');

  // Style panel state
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [selectedCornerStyle, setSelectedCornerStyle] = useState('square');
  const [selectedDotStyle, setSelectedDotStyle] = useState('square');
  const [addIcon, setAddIcon] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>('none');

  // Recent QR codes storage
  const [recentQRCodes, setRecentQRCodes] = useState<Array<{
    url: string;
    title: string;
    timestamp: number;
  }>>([]);

  // Listen for style panel open event from toolbar

  // Corner styles data
  const cornerStyles = [
    { id: 'square', name: 'Square', preview: 'square', icon: '⬜' },
    { id: 'rounded', name: 'Rounded', preview: 'rounded-sm', icon: '▢' },
    { id: 'extra-rounded', name: 'Extra Rounded', preview: 'rounded-lg', icon: '◻' },
    { id: 'circle', name: 'Circle', preview: 'rounded-full', icon: '⬭' }
  ];

  // Dot styles data with visual representations
  const dotStyles = [
    { id: 'square', name: 'Square', pattern: 'square', icon: '■' },
    { id: 'rounded', name: 'Rounded', pattern: 'rounded', icon: '▣' },
    { id: 'dots', name: 'Dots', pattern: 'dots', icon: '●' },
    { id: 'classy', name: 'Classy', pattern: 'classy', icon: '◆' },
    { id: 'classy-rounded', name: 'Classy Rounded', pattern: 'classy-rounded', icon: '◈' }
  ];

  // Icon options
  const iconOptions = [
    { id: 'none', name: 'No Icon', icon: '🚫', preview: '🚫' },
    { id: 'scan-me', name: 'Scan Me', icon: 'SCAN\nME', preview: 'SCAN' },
    { id: 'star', name: 'Star', icon: '⭐', preview: '⭐' },
    { id: 'play', name: 'Play', icon: '▶️', preview: '▶' },
    { id: 'qr', name: 'QR', icon: '⊞', preview: '⊞' },
    { id: 'heart', name: 'Heart', icon: '❤️', preview: '❤' },
    { id: 'check', name: 'Check', icon: '✓', preview: '✓' },
    { id: 'wifi', name: 'WiFi', icon: '📶', preview: '📶' }
  ];

  // URL validation function
  const validateUrl = (inputUrl: string): boolean => {
    try {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      return urlPattern.test(inputUrl);
    } catch {
      return false;
    }
  };

  // Normalize URL (add https if missing)
  const normalizeUrl = (inputUrl: string): string => {
    if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
      return `https://${inputUrl}`;
    }
    return inputUrl;
  };

  // Generate QR code preview
  const generateQRPreview = async (targetUrl: string) => {
    if (!targetUrl || !isValidUrl) return;

    try {
      setIsGeneratingPreview(true);
      const normalizedUrl = normalizeUrl(targetUrl);
      
      const sizeMap = {
        small: 100,
        medium: 150,
        large: 200
      };

      const options = {
        errorCorrectionLevel: 'M' as const,
        type: 'image/png' as const,
        quality: 0.92,
        margin: 1,
        color: {
          dark: foregroundColor,
          light: backgroundColor,
        },
        width: sizeMap[qrSize],
      };

      const qrDataURL = await QRCode.toDataURL(normalizedUrl, options);
      setQrPreview(qrDataURL);
    } catch (err) {
      console.error('Error generating QR preview:', err);
      setQrPreview('');
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  // Fetch website metadata
  const fetchMetadata = async (targetUrl: string): Promise<WebsiteMetadata | null> => {
    try {
      setIsLoading(true);
      setError('');

      const normalizedUrl = normalizeUrl(targetUrl);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock metadata based on common domains for demo
      const domain = new URL(normalizedUrl).hostname.toLowerCase();
      
      let mockMetadata: WebsiteMetadata;

      if (domain.includes('github')) {
        mockMetadata = {
          title: 'GitHub - Where the world builds software',
          description: 'GitHub is where over 100 million developers shape the future of software, together.',
          favicon: 'https://github.githubassets.com/favicons/favicon.svg',
          url: normalizedUrl
        };
      } else if (domain.includes('google')) {
        mockMetadata = {
          title: 'Google',
          description: 'Search the world\'s information, including webpages, images, videos and more.',
          favicon: 'https://www.google.com/favicon.ico',
          url: normalizedUrl
        };
      } else if (domain.includes('bolt.new')) {
        mockMetadata = {
          title: 'Bolt.new - AI-Powered Full-Stack Development',
          description: 'Prompt, run, edit & deploy apps with AI. Build full-stack applications faster than ever.',
          favicon: 'https://bolt.new/favicon.ico',
          url: normalizedUrl
        };
      } else if (domain.includes('youtube')) {
        mockMetadata = {
          title: 'YouTube',
          description: 'Enjoy the videos and music you love, upload original content, and share it all with friends, family, and the world on YouTube.',
          favicon: 'https://www.youtube.com/favicon.ico',
          url: normalizedUrl
        };
      } else if (domain.includes('twitter') || domain.includes('x.com')) {
        mockMetadata = {
          title: 'X (formerly Twitter)',
          description: 'From breaking news and entertainment to sports and politics, get the full story with all the live commentary.',
          favicon: 'https://abs.twimg.com/favicons/twitter.3.ico',
          url: normalizedUrl
        };
      } else if (domain.includes('linkedin')) {
        mockMetadata = {
          title: 'LinkedIn',
          description: 'Connect with professionals and discover career opportunities on the world\'s largest professional network.',
          favicon: 'https://static.licdn.com/sc/h/al2o9zrvru7aqj8e1x2rzsrca',
          url: normalizedUrl
        };
      } else {
        // Generic fallback
        mockMetadata = {
          title: `${domain.charAt(0).toUpperCase() + domain.slice(1)} - Website`,
          description: `Visit ${domain} for more information and services.`,
          favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
          url: normalizedUrl
        };
      }

      return mockMetadata;
    } catch (err) {
      setError('Unable to fetch website information');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle URL input change
  const handleUrlChange = async (inputUrl: string) => {
    setUrl(inputUrl);
    setMetadata(null);
    setError('');
    setQrPreview('');

    if (!inputUrl.trim()) {
      setIsValidUrl(false);
      return;
    }

    const valid = validateUrl(inputUrl);
    setIsValidUrl(valid);

    if (valid && inputUrl.length > 5) {
      const fetchedMetadata = await fetchMetadata(inputUrl);
      setMetadata(fetchedMetadata);
      
      // Generate QR preview
      await generateQRPreview(inputUrl);
    }
  };

  // Regenerate QR preview when options change
  useEffect(() => {
    if (url && isValidUrl) {
      generateQRPreview(url);
    }
  }, [qrSize, foregroundColor, backgroundColor]);

  const handleAddQRCode = () => {
    if (isValidUrl && url) {
      const finalUrl = normalizeUrl(url);
      
      // Determine size in pixels
      const sizeMap = {
        small: 100,
        medium: 150,
        large: 200
      };
      
      const qrOptions = {
        width: sizeMap[qrSize],
        height: sizeMap[qrSize],
        foregroundColor,
        backgroundColor,
        errorCorrectionLevel: 'M' as const,
        cornerStyle: selectedCornerStyle,
        dotStyle: selectedDotStyle,
        hasIcon: addIcon,
        iconType: selectedIcon
      };
      
      // Add QR code to canvas
      addQRElement(finalUrl, qrOptions);
      
      // Add to recent QR codes
      const newRecentQR = {
        url: finalUrl,
        title: metadata?.title || finalUrl,
        timestamp: Date.now()
      };
      
      setRecentQRCodes(prev => {
        const filtered = prev.filter(qr => qr.url !== finalUrl);
        return [newRecentQR, ...filtered].slice(0, 5); // Keep only 5 recent
      });
      
      // Clear the form
      setUrl('');
      setMetadata(null);
      setIsValidUrl(false);
      setQrPreview('');
      
      console.log('QR Code added to canvas:', finalUrl, qrOptions);
    }
  };

  const handleVisitSite = () => {
    if (metadata) {
      window.open(metadata.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleRecentQRClick = (recentQR: typeof recentQRCodes[0]) => {
    setUrl(recentQR.url);
    handleUrlChange(recentQR.url);
  };

  const handleApplyStyle = () => {
    // Apply style and go back to main panel
    setShowStylePanel(false);
  };

  // Render dot pattern preview
  const renderDotPattern = (pattern: string) => {
    const dots = Array.from({ length: 9 }, (_, i) => {
      let className = 'w-1.5 h-1.5 bg-black';
      
      switch (pattern) {
        case 'square':
          className += '';
          break;
        case 'rounded':
          className += ' rounded-sm';
          break;
        case 'dots':
          className += ' rounded-full';
          break;
        case 'classy':
          className += i % 2 === 0 ? ' rounded-full' : '';
          break;
        case 'classy-rounded':
          className += i % 3 === 1 ? ' rounded-full' : ' rounded-sm';
          break;
        default:
          break;
      }
      
      return (
        <div key={i} className={className}></div>
      );
    });

    return (
      <div className="grid grid-cols-3 gap-1">
        {dots}
      </div>
    );
  };

  // Render icon preview
  const renderIconPreview = (icon: typeof iconOptions[0]) => {
    if (icon.id === 'none') {
      return <span className="text-2xl">🚫</span>;
    } else if (icon.id === 'scan-me') {
      return (
        <div className="text-xs font-bold text-center leading-tight">
          <div>SCAN</div>
          <div>ME</div>
        </div>
      );
    } else if (icon.id === 'star') {
      return <span className="text-2xl">⭐</span>;
    } else if (icon.id === 'play') {
      return (
        <div className="w-6 h-6 bg-black flex items-center justify-center">
          <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-1"></div>
        </div>
      );
    } else if (icon.id === 'qr') {
      return (
        <div className="text-lg font-mono font-bold">
          ⊞
        </div>
      );
    }
    return null;
  };

  // QR Style Panel Component
  const QRStylePanel = () => (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 h-full overflow-y-auto">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => setShowStylePanel(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-3"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">QR Code Style</h2>
        </div>
        <button
          onClick={() => setShowStylePanel(false)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      
      {/* Corners Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Corners</h3>
        <div className="grid grid-cols-4 gap-3">
          {cornerStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedCornerStyle(style.id)}
              className={`relative aspect-square border-2 rounded-lg p-4 flex items-center justify-center hover:bg-gray-50 transition-all duration-200 ${
                selectedCornerStyle === style.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              title={style.name}
            >
              {/* Corner style preview */}
              <div className={`w-8 h-8 bg-black ${style.preview}`}>
                <div className={`w-3 h-3 bg-white m-1 ${style.preview}`}></div>
              </div>
              
              {/* Selected indicator */}
              {selectedCornerStyle === style.id && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Dots Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dots</h3>
        <div className="grid grid-cols-4 gap-3 mb-4">
          {dotStyles.slice(0, 4).map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedDotStyle(style.id)}
              className={`relative aspect-square border-2 rounded-lg p-3 flex items-center justify-center hover:bg-gray-50 transition-all duration-200 ${
                selectedDotStyle === style.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              title={style.name}
            >
              {/* Dot style preview */}
              {renderDotPattern(style.pattern)}
              
              {/* Selected indicator */}
              {selectedDotStyle === style.id && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
        
        {/* Additional dot style */}
        <div className="grid grid-cols-4 gap-3">
          <button
            onClick={() => setSelectedDotStyle('classy-rounded')}
            className={`relative aspect-square border-2 rounded-lg p-3 flex items-center justify-center hover:bg-gray-50 transition-all duration-200 ${
              selectedDotStyle === 'classy-rounded' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            title="Classy Rounded"
          >
            {/* Classy rounded preview */}
            {renderDotPattern('classy-rounded')}
            
            {/* Selected indicator */}
            {selectedDotStyle === 'classy-rounded' && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Icon Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Icon</h3>
        
        {/* Add icon toggle */}
        <label className="flex items-center space-x-3 cursor-pointer mb-6">
          <input
            type="checkbox"
            checked={addIcon}
            onChange={(e) => setAddIcon(e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-gray-700 font-medium">Add icon to QR Code</span>
        </label>

        {/* Icon selection grid */}
        {addIcon && (
          <div className="grid grid-cols-4 gap-3 mb-4">
            {iconOptions.slice(0, 4).map((icon) => (
              <button
                key={icon.id}
                onClick={() => setSelectedIcon(icon.id)}
                className={`relative aspect-square border-2 rounded-lg p-3 flex items-center justify-center hover:bg-gray-50 transition-all duration-200 ${
                  selectedIcon === icon.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                title={icon.name}
              >
                {renderIconPreview(icon)}
                
                {/* Selected indicator */}
                {selectedIcon === icon.id && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Additional icon row */}
        {addIcon && (
          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={() => setSelectedIcon('qr')}
              className={`relative aspect-square border-2 rounded-lg p-3 flex items-center justify-center hover:bg-gray-50 transition-all duration-200 ${
                selectedIcon === 'qr' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              title="QR Icon"
            >
              {renderIconPreview(iconOptions[4])}
              
              {/* Selected indicator */}
              {selectedIcon === 'qr' && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Apply Button */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={handleApplyStyle}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Apply Style
        </button>
      </div>
    </div>
  );

  // Show style panel if requested

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">QR Code Generator</h2>
        <p className="text-sm text-gray-600">
          Enter a website URL to generate a real, scannable QR code.
        </p>
      </div>
      
      {/* URL Input Field */}
      <div className="mb-6">
        <label htmlFor="qr-url" className="block text-sm font-medium text-gray-700 mb-3">
          Website URL
        </label>
        <div className="relative">
          <input
            id="qr-url"
            type="url"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://www.example.com/"
            className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-gray-700 ${
              url && !isValidUrl 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                : url && isValidUrl
                ? 'border-green-300 focus:ring-green-500 focus:border-green-500 bg-green-50'
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
          />
          
          {/* URL Status Icon */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            ) : url && !isValidUrl ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : url && isValidUrl ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Globe className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
        
        {/* Error Message */}
        {url && !isValidUrl && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            Please enter a valid website URL
          </p>
        )}
      </div>

      {/* QR Code Preview */}
      {(qrPreview || isGeneratingPreview) && isValidUrl && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">QR Code Preview</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex justify-center">
            {isGeneratingPreview ? (
              <div className="flex flex-col items-center space-y-3">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-sm text-gray-600">Generating QR code...</p>
              </div>
            ) : qrPreview ? (
              <div className="flex flex-col items-center space-y-3">
                <img 
                  src={qrPreview} 
                  alt="QR Code Preview" 
                  className="border border-gray-300 rounded-lg shadow-sm"
                  style={{ maxWidth: '200px', maxHeight: '200px' }}
                />
                <p className="text-xs text-gray-500 text-center">
                  Scan this QR code to visit: {url}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Website Preview Section */}
      {(metadata || isLoading) && (
        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Website Preview</h3>
          
          {isLoading ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 animate-pulse">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-full"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ) : metadata ? (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 hover:shadow-md transition-all duration-200 group cursor-pointer overflow-hidden"
                 onClick={handleVisitSite}>
              <div className="flex items-start space-x-4">
                {/* Favicon */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center border border-gray-200 group-hover:shadow-md transition-shadow">
                    {metadata.favicon ? (
                      <img 
                        src={metadata.favicon} 
                        alt="Site favicon" 
                        className="w-8 h-8 rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <Globe className="w-6 h-6 text-blue-600 hidden" />
                  </div>
                </div>
                
                {/* Content - with overflow hidden */}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                        {metadata.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2 leading-relaxed overflow-hidden">
                        {metadata.description}
                      </p>
                      <p className="text-xs text-blue-600 mt-2 truncate font-medium overflow-hidden">
                        {metadata.url}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors ml-2 flex-shrink-0" />
                  </div>
                </div>
              </div>
            </div>
          ) : error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h4 className="font-medium text-red-900">No Preview Available</h4>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* QR Code Options */}

      {/* Add QR Code Button */}
      <button
        onClick={handleAddQRCode}
        disabled={!isValidUrl || !url || isLoading || isGeneratingPreview}
        className={`w-full font-bold py-4 px-6 rounded-xl transition-all duration-200 text-lg flex items-center justify-center space-x-3 ${
          isValidUrl && url && !isLoading && !isGeneratingPreview
            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isGeneratingPreview ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <Plus className="w-5 h-5" />
            <span>Add QR Code to Canvas</span>
          </>
        )}
      </button>

      {/* Recent QR Codes */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Recent QR Codes</h3>
        {recentQRCodes.length > 0 ? (
          <div className="space-y-2">
            {recentQRCodes.map((qr, index) => (
              <button
                key={index}
                onClick={() => handleRecentQRClick(qr)}
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <QrCode className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{qr.title}</p>
                    <p className="text-xs text-gray-500 truncate">{qr.url}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 font-medium">No recent QR codes</p>
            <p className="text-xs text-gray-400 mt-1">Generated QR codes will appear here for quick reuse</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodePanel;