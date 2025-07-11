// AR Utility functions for WebXR and device compatibility

export interface ARCapabilities {
  isSupported: boolean;
  hasWebXR: boolean;
  isMobile: boolean;
  browser: string;
  os: string;
}

export function checkARCapabilities(): ARCapabilities {
  const userAgent = navigator.userAgent;
  
  // Detect browser
  let browser = 'unknown';
  if (userAgent.includes('Chrome')) browser = 'chrome';
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'safari';
  else if (userAgent.includes('Firefox')) browser = 'firefox';
  else if (userAgent.includes('Edge')) browser = 'edge';
  
  // Detect OS
  let os = 'unknown';
  if (userAgent.includes('Android')) os = 'android';
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'ios';
  else if (userAgent.includes('Windows')) os = 'windows';
  else if (userAgent.includes('Mac')) os = 'macos';
  else if (userAgent.includes('Linux')) os = 'linux';
  
  // Check if mobile
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  // Check WebXR support
  const hasWebXR = 'xr' in navigator;
  
  // Determine AR support
  let isSupported = false;
  
  if (hasWebXR) {
    // WebXR is available, check for AR session support
    isSupported = true; // Will be verified async
  } else if (isMobile) {
    // Fallback for mobile devices without WebXR
    // iOS Safari 12+ or Chrome on Android
    if (os === 'ios' && browser === 'safari') {
      isSupported = true;
    } else if (os === 'android' && browser === 'chrome') {
      isSupported = true;
    }
  }
  
  return {
    isSupported,
    hasWebXR,
    isMobile,
    browser,
    os
  };
}

export async function requestARSession(): Promise<any> {
  if (!('xr' in navigator)) {
    throw new Error('WebXR not supported');
  }
  
  try {
    const session = await (navigator as any).xr.requestSession('immersive-ar', {
      requiredFeatures: ['local', 'hit-test'],
      optionalFeatures: ['dom-overlay', 'light-estimation']
    });
    
    return session;
  } catch (error) {
    console.error('Failed to create AR session:', error);
    throw error;
  }
}

export function generateARQRCode(baseUrl: string): string {
  // Generate QR code URL that points to AR viewer
  const arUrl = `${baseUrl}#ar-view`;
  return arUrl;
}

export function isARCompatibleDevice(): boolean {
  const capabilities = checkARCapabilities();
  
  // Check for specific device/browser combinations that support AR
  if (capabilities.hasWebXR) {
    return true;
  }
  
  // iOS Safari 12+
  if (capabilities.os === 'ios' && capabilities.browser === 'safari') {
    return true;
  }
  
  // Android Chrome 67+
  if (capabilities.os === 'android' && capabilities.browser === 'chrome') {
    return true;
  }
  
  return false;
}

export function getARInstructions(): string {
  const capabilities = checkARCapabilities();
  
  if (!capabilities.isMobile) {
    return 'Please scan this QR code with your mobile device to view in AR';
  }
  
  if (capabilities.hasWebXR) {
    return 'Tap to start AR experience';
  }
  
  if (capabilities.os === 'ios') {
    return 'Open in Safari to view in AR';
  }
  
  if (capabilities.os === 'android') {
    return 'Open in Chrome to view in AR';
  }
  
  return 'AR viewing requires a compatible mobile browser';
}