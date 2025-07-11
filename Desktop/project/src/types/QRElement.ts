export interface QRElement {
  id: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  foregroundColor: string;
  backgroundColor: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  rotation?: number;
  opacity?: number;
  isSelected: boolean;
  locked?: boolean;
  cornerStyle?: string;
  dotStyle?: string;
  hasIcon?: boolean;
  iconType?: string;
  iconName?: string;
}