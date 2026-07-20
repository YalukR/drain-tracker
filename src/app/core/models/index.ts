export interface Drain {
  id: string;
  label: string;       // ej: "Izquierdo", "Derecho", "Centro"
  startDate: string;   // ISO date string YYYY-MM-DD
}

export type LiquidColor = 'rojo_oscuro' | 'rojo_claro' | 'rosado' | 'amarillo_claro' | 'amarillo' | 'claro';

export const LIQUID_COLORS: { value: LiquidColor; label: string; hex: string }[] = [
  { value: 'rojo_oscuro',    label: 'Rojo oscuro',          hex: '#7f1d1d' },
  { value: 'rojo_claro',     label: 'Rojo claro',           hex: '#ef4444' },
  { value: 'rosado',         label: 'Rosado',               hex: '#f472b6' },
  { value: 'amarillo_claro', label: 'Amarillo claro',       hex: '#fde68a' },
  { value: 'amarillo',       label: 'Amarillo',             hex: '#f59e0b' },
  { value: 'claro',          label: 'Claro / transparente', hex: '#e0f2fe' },
];

export type LiquidColorOption = typeof LIQUID_COLORS[number];
export type ClotSize    = 'pequeno' | 'grande';
export type ClotStatus  = 'drenoSolo' | 'atascado';
export type PainLevel   = 'ninguno' | 'suave' | 'moderado' | 'intenso';
export type BruiseColor = 'rojo' | 'morado' | 'verde' | 'amarillo';

export interface DrainEntry {
  drainId: string;
  drainLabel: string;
  amountMl: number;
  liquidColor?: LiquidColor;
  hasClot: boolean;
  clotSize?: ClotSize;
  clotStatus?: ClotStatus;
  leakingOutside: boolean;
}

export interface Symptoms {
  redness: boolean;
  numbness: boolean;
  suctionSensation: boolean;
  painLevel: PainLevel;
  tingling: boolean;
  itching: boolean;
  skinColorChange: boolean;
  bruiseColor?: BruiseColor;
  fever: boolean;
  feverTemp?: number;
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

export interface AppSettings {
  surgeryDate?: string;        // YYYY-MM-DD — para calcular día de recuperación
  alertThresholdMl?: number;   // ml por limpieza que disparan aviso al médico
  reminderTime?: string;       // HH:mm (24h) — hora del día para recordar limpiar
}

export interface AppState {
  drains: Drain[];
  logs: CleaningLog[];
  settings: AppSettings;
}