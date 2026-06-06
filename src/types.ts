export interface Petal {
  id: number;
  angle: number; // The angle of the petal relative to center (in degrees, 0-360)
  isPlucked: boolean;
  scaleX: number; // Slight scale variations to look natural and organic
  scaleY: number; // Slight scale variations to look natural and organic
}

export type PluckResult = 'SEVIYOR' | 'SEVMIYOR';

export interface GameHistoryEntry {
  step: number;
  petalId: number;
  result: PluckResult;
}

export interface Sparkle {
  id: number;
  x: number; // percentage pos
  y: number; // percentage pos
  size: number; // size in px
  delay: number; // delay in s
}
