import { Injectable } from '@angular/core';
import { AppState, Drain, CleaningLog } from '../models';

const KEY = 'dt_state_v1';

const DEFAULT: AppState = { drains: [], logs: [] };

@Injectable({ providedIn: 'root' })
export class StorageService {

  private load(): AppState {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
    } catch {
      return DEFAULT;
    }
  }

  private save(state: AppState): void {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  getState(): AppState { return this.load(); }

  // Drains
  getDrains(): Drain[] { return this.load().drains; }

  saveDrains(drains: Drain[]): void {
    const state = this.load();
    this.save({ ...state, drains });
  }

  // Logs
  getLogs(): CleaningLog[] {
    return this.load().logs.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  addLog(log: CleaningLog): void {
    const state = this.load();
    this.save({ ...state, logs: [log, ...state.logs] });
  }

  deleteLog(id: string): void {
    const state = this.load();
    this.save({ ...state, logs: state.logs.filter(l => l.id !== id) });
  }

  clear(): void { localStorage.removeItem(KEY); }
}
