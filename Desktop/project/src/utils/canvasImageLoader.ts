import { TextElement } from '../types/TextElement';
import { ImageElement } from '../types/ImageElement';
import { GraphicElement } from '../types/GraphicElement';
import { QRElement } from '../types/QRElement';
import QRCode from 'qrcode';

interface CanvasToImageOptions {
  textElements: TextElement[];
  imageElements: ImageElement[];
  graphicElements: GraphicElement[];
  qrElements: QRElement[];
  canvasSize: { width: number; height: number };
  canvasBackgroundColor: string;
}

export async function createCanvasFromImage(options: CanvasToImageOptions): Promise<string | null> {
  const {
    textElements,
    imageElements,
    graphicElements,
    qrElements,
    canvasSize,
    canvasBackgroundColor
  } = options;

  try {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Set canvas size to higher resolution for better quality
    const scale = 2; // 2x resolution for crisp textures
    canvas.width = canvasSize.width * scale;
    canvas.height = canvasSize.height * scale;
    
    // Scale the context to maintain proper proportions
    ctx.scale(scale, scale);
    
    // Improve rendering quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.textRenderingOptimization = 'optimizeQuality';

    // Fill with background color
    ctx.fillStyle = canvasBackgroundColor;
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // Helper function to apply transformations
    const applyTransform = (element: any, callback: () => void) => {
      ctx.save();
      
      // Apply opacity
      if (element.opacity !== undefined) {
        ctx.globalAlpha = element.opacity / 100;
      }
      
      // Apply rotation if present
      if (element.rotation) {
        const centerX = element.x + (element.width || 0) / 2;
        const centerY = element.y + (element.height || 0) / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate((element.rotation * Math.PI) / 180);
        ctx.translate(-centerX, -centerY);
      }
      
      callback();
      ctx.restore();
    };

    // Render graphics first (background layer)
    for (const graphic of graphicElements) {
      applyTransform(graphic, () => {
        ctx.fillStyle = graphic.fillColor || '#000000';
        
        if (graphic.strokeWidth && graphic.strokeWidth > 0) {
          ctx.strokeStyle = graphic.strokeColor || '#000000';
          ctx.lineWidth = graphic.strokeWidth;
          
          // Set stroke style
          if (graphic.strokeStyle === 'dashed') {
            ctx.setLineDash([5, 5]);
          } else if (graphic.strokeStyle === 'dotted') {
            ctx.setLineDash([2, 2]);
          } else {
            ctx.setLineDash([]);
          }
        }
        
        const x = graphic.x;
        const y = graphic.y;
        const width = graphic.width;
        const height = graphic.height;
        
        // Draw different shapes
        ctx.beginPath();
        
        if (graphic.type === 'circle') {
          ctx.arc(x + width / 2, y + height / 2, Math.min(width, height) / 2, 0, 2 * Math.PI);
        } else if (graphic.type === 'rectangle') {
          ctx.rect(x, y, width, height);
        } else if (graphic.type === 'triangle') {
          ctx.moveTo(x + width / 2, y);
          ctx.lineTo(x + width, y + height);
          ctx.lineTo(x, y + height);
          ctx.closePath();
        } else if (graphic.type === 'star') {
          // Draw star shape
          const centerX = x + width / 2;
          const centerY = y + height / 2;
          const outerRadius = Math.min(width, height) / 2;
          const innerRadius = outerRadius * 0.4;
          const spikes = 5;
          
          for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes;
            const pointX = centerX + Math.cos(angle) * radius;
            const pointY = centerY + Math.sin(angle) * radius;
            
            if (i === 0) {
              ctx.moveTo(pointX, pointY);
            } else {
              ctx.lineTo(pointX, pointY);
            }
          }
          ctx.closePath();
        } else if (graphic.type === 'heart') {
          // Draw heart shape
          const centerX = x + width / 2;
          const centerY = y + height / 2;
          const scale = Math.min(width, height) / 100;
          
          ctx.moveTo(centerX, centerY + 20 * scale);
          ctx.bezierCurveTo(centerX, centerY + 10 * scale, centerX - 20 * scale, centerY - 10 * scale, centerX - 20 * scale, centerY - 20 * scale);
          ctx.bezierCurveTo(centerX - 20 * scale, centerY - 30 * scale, centerX, centerY - 30 * scale, centerX, centerY - 20 * scale);
          ctx.bezierCurveTo(centerX, centerY - 30 * scale, centerX + 20 * scale, centerY - 30 * scale, centerX + 20 * scale, centerY - 20 * scale);
          ctx.bezierCurveTo(centerX + 20 * scale, centerY - 10 * scale, centerX, centerY + 10 * scale, centerX, centerY + 20 * scale);
        } else if (graphic.type === 'line') {
          ctx.moveTo(x, y + height / 2);
          ctx.lineTo(x + width, y + height / 2);
        }
        
        // Handle icons and clipart
        if (graphic.isIcon && graphic.iconType) {
          const iconMap: { [key: string]: string } = {
            'sun': '☀️', 'moon': '🌙', 'cloud': '☁️', 'umbrella': '☂️',
            'tree': '🌳', 'flower': '🌸', 'leaf': '🍃', 'apple': '🍎',
            'phone': '📱', 'mail': '✉️', 'camera': '📷', 'music': '🎵',
            'lightbulb': '💡', 'rocket': '🚀', 'globe': '🌍', 'compass': '🧭',
            'home': '🏠', 'coffee': '☕', 'gift': '🎁', 'crown': '👑',
            'key': '🔑', 'lock': '🔒', 'bell': '🔔', 'clock': '🕐',
            'car': '🚗', 'plane': '✈️', 'ship': '🚢', 'bike': '🚲'
          };
          const iconSymbol = iconMap[graphic.iconType] || '❓';
          ctx.font = `${Math.min(width, height) * 0.8}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(iconSymbol, x + width / 2, y + height / 2);
        } else if (graphic.isClipart && graphic.emoji) {
          ctx.font = `${Math.min(width, height) * 0.8}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(graphic.emoji, x + width / 2, y + height / 2);
        } else {
          // Fill and stroke regular shapes
          ctx.fill();
          if (graphic.strokeWidth && graphic.strokeWidth > 0) {
            ctx.stroke();
          }
        }
      });
    }

    // Render images
    for (const image of imageElements) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = image.src;
        });
        
        applyTransform(image, () => {
          // Apply filters if present
          if (image.filter && image.filter !== 'none') {
            ctx.filter = image.filter;
          }
          
          // Apply clip path if present
          if (image.clipPath && image.clipPath !== 'none') {
            ctx.save();
            if (image.clipPath.includes('circle')) {
              ctx.beginPath();
              ctx.arc(
                image.x + image.width / 2,
                image.y + image.height / 2,
                Math.min(image.width, image.height) / 2,
                0,
                2 * Math.PI
              );
              ctx.clip();
            }
          }
          
          ctx.drawImage(img, image.x, image.y, image.width, image.height);
          
          if (image.clipPath && image.clipPath !== 'none') {
            ctx.restore();
          }
          
          ctx.filter = 'none';
        });
      } catch (error) {
        console.error('Error loading image:', error);
      }
    }

    // Render QR codes
    for (const qr of qrElements) {
      try {
        const qrDataUrl = await QRCode.toDataURL(qr.url, {
          width: qr.width,
          height: qr.height,
          color: {
            dark: qr.foregroundColor,
            light: qr.backgroundColor,
          },
          errorCorrectionLevel: qr.errorCorrectionLevel,
          margin: 1,
        });
        
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to load QR code'));
          img.src = qrDataUrl;
        });
        
        applyTransform(qr, () => {
          ctx.drawImage(img, qr.x, qr.y, qr.width, qr.height);
        });
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    }

    // Render text elements (top layer)
    for (const text of textElements) {
      applyTransform(text, () => {
        // Set text properties
        const fontSize = text.fontSize;
        let fontWeight = text.isBold ? 'bold' : 'normal';
        let fontStyle = text.isItalic ? 'italic' : 'normal';
        
        ctx.fillStyle = text.color;
        ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${text.fontFamily}`;
        ctx.textAlign = text.alignment === 'center' ? 'center' : text.alignment === 'right' ? 'end' : 'start';
        ctx.textBaseline = 'top';
        
        // Handle text case
        let displayText = text.text;
        if (text.textCase === 'uppercase') {
          displayText = displayText.toUpperCase();
        } else if (text.textCase === 'lowercase') {
          displayText = displayText.toLowerCase();
        }
        
        // Calculate text position
        const textX = text.alignment === 'center' ? text.x + (text.width || 200) / 2 : 
                     text.alignment === 'right' ? text.x + (text.width || 200) : text.x;
        
        // Handle multi-line text
        const lines = displayText.split('\n');
        const lineHeight = fontSize * (text.lineHeight || 1.2);
        
        lines.forEach((line, index) => {
          const y = text.y + (index * lineHeight);
          
          // Apply letter spacing if needed
          if (text.letterSpacing && text.letterSpacing !== 0) {
            // Manual letter spacing
            let currentX = textX;
            for (let i = 0; i < line.length; i++) {
              ctx.fillText(line[i], currentX, y);
              currentX += ctx.measureText(line[i]).width + text.letterSpacing;
            }
          } else {
            ctx.fillText(line, textX, y);
          }
          
          // Draw underline if needed
          if (text.isUnderline) {
            const textWidth = ctx.measureText(line).width;
            const underlineY = y + fontSize + 2;
            const underlineX = text.alignment === 'center' ? textX - textWidth / 2 : 
                             text.alignment === 'right' ? textX - textWidth : textX;
            
            ctx.beginPath();
            ctx.moveTo(underlineX, underlineY);
            ctx.lineTo(underlineX + textWidth, underlineY);
            ctx.strokeStyle = text.color;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });
    }

    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL('image/png', 1.0); // Maximum quality PNG
    
    console.log('Canvas texture generated successfully', {
      dimensions: `${canvas.width}x${canvas.height} (${scale}x scale)`,
      elements: {
        text: textElements.length,
        images: imageElements.length,
        graphics: graphicElements.length,
        qr: qrElements.length
      }
    });

    return dataUrl;
  } catch (error) {
    console.error('Error creating canvas image:', error);
    return null;
  }
}