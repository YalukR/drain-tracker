import { Injectable } from '@angular/core';
import { AppState, AppSettings, Drain, CleaningLog } from '../models';

const KEY = 'dt_state_v1';

const DEFAULT: AppState = {
  drains: [],
  logs: [],
  settings: {},
};

@Injectable({ providedIn: 'root' })
export class StorageService {

  private load(): AppState {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return DEFAULT;
      const parsed = JSON.parse(raw);
      // Garantizar que settings existe aunque el estado sea de una versión anterior
      return { ...DEFAULT, ...parsed, settings: { ...DEFAULT.settings, ...parsed.settings } };
    } catch {
      return DEFAULT;
    }
  }

  private save(state: AppState): void {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  getState(): AppState { return this.load(); }

  // ── Drains ────────────────────────────────────────────────────────────────
  getDrains(): Drain[] { return this.load().drains; }

  saveDrains(drains: Drain[]): void {
    this.save({ ...this.load(), drains });
  }

  // ── Logs ──────────────────────────────────────────────────────────────────
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

  // ── Settings ──────────────────────────────────────────────────────────────
  getSettings(): AppSettings { return this.load().settings; }

  saveSettings(settings: AppSettings): void {
    this.save({ ...this.load(), settings });
  }

  patchSettings(patch: Partial<AppSettings>): void {
    const current = this.load().settings;
    this.save({ ...this.load(), settings: { ...current, ...patch } });
  }

  // ── Utils ─────────────────────────────────────────────────────────────────
  clear(): void { localStorage.removeItem(KEY); }
}2