export interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  isBold: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  isBulletList?: boolean;
  isNumberedList?: boolean;
  alignment: 'left' | 'center' | 'right';
  isSelected: boolean;
  lineHeight?: number;
  letterSpacing?: number;
  opacity?: number;
  rotation?: number;
  textCase?: 'normal' | 'lowercase' | 'uppercase';
  curveStyle?: 'none' | 'slight-up' | 'medium-up' | 'full-up' | 'slight-down' | 'full-down';
}