export interface Drain {
  id: string;
  label: string;       // ej: "Izquierdo", "Derecho", "Centro"
  startDate: string;   // ISO date string YYYY-MM-DD
}

export type LiquidColor = 'rojo_oscuro' | 'rojo_claro' | 'rosado' | 'amarillo_claro' | 'amarillo' | 'claro';

export const LIQUID_COLORS: { value: LiquidColor; label: string; hex: string }[] = [
  { value: 'rojo_oscuro',    label: 'Rojo oscuro',       hex: '#7f1d1d' },
  { value: 'rojo_claro',     label: 'Rojo claro',        hex: '#ef4444' },
  { value: 'rosado',         label: 'Rosado',            hex: '#f472b6' },
  { value: 'amarillo_claro', label: 'Amarillo claro',    hex: '#fde68a' },
  { value: 'amarillo',       label: 'Amarillo',          hex: '#f59e0b' },
  { value: 'claro',          label: 'Claro / transparente', hex: '#e0f2fe' },
];

export type ClotSize = 'pequeno' | 'grande';
export type ClotStatus = 'drenoSolo' | 'atascado';
export type PainLevel = 'ninguno' | 'suave' | 'moderado' | 'intenso';
export type BruiseColor = 'rojo' | 'morado' | 'verde' | 'amarillo';

export interface DrainEntry {
  drainId: string;
  drainLabel: string;
  amountMl: number;
  liquidColor?: LiquidColor;
  hasClot: boolean;
  clotSize?: ClotSize;
  clotStatus?: ClotStatus;
  leakingOutside: boolean;   // drenaje por el agujero de la piel
}

export interface Symptoms {
  redness: boolean;           // enrojecimiento en la herida
  numbness: boolean;          // adormecimiento
  suctionSensation: boolean;  // sensación de vacío/succión
  painLevel: PainLevel;
  tingling: boolean;          // pinchazos
  itching: boolean;           // comezón
  skinColorChange: boolean;   // cambios en coloración de piel
  bruiseColor?: BruiseColor;
  fever: boolean;
  feverTemp?: number;         // temperatura si hay fiebre
}

export interface CleaningLog {
  id: string;
  timestamp: string;
  entries: DrainEntry[];
  bathed: boolean;
  bandageChanged: boolean;
  symptoms: Symptoms;
  notes?: string;
}

export interface AppState {
  drains: Drain[];
  logs: CleaningLog[];
}
