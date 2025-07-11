export interface GraphicElement {
  id: string;
  type: 'circle' | 'rectangle' | 'triangle' | 'star' | 'pentagon' | 'hexagon' | 'heart' | 'diamond' | 'octagon' | 'oval' | 'line' | 'arrow' | 'plus' | 'cross' | 'lightning' | 'icon' | 'clipart';
  x: number;
  y: number;
  width: number;
  height: number;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  rotation?: number;
  opacity?: number;
  isSelected: boolean;
  locked?: boolean;
  groupId?: string;
  isIcon?: boolean;
  iconType?: string;
  iconName?: string;
  isClipart?: boolean;
  clipartType?: string;
  clipartName?: string;
  emoji?: string;
}