export interface ImageElement {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
  filter?: string;
  transform?: string;
  isSelected: boolean;
  originalWidth: number;
  originalHeight: number;
  locked?: boolean;
  cropData?: {
    x: number;
    y: number;
    width: number;
    height: number;
    shape: string;
  } | null;
  clipPath?: string;
}