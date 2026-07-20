import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { AppSettings, Drain, CleaningLog, DrainEntry, Symptoms } from '../models';

const DB_NAME = 'drain_tracker';
const LEGACY_LOCALSTORAGE_KEY = 'dt_state_v1';
const DEV_FALLBACK_KEY = 'dt_dev_fallback_v1'; // solo para ng serve, nunca en la app real

interface DevState {
  drains: Drain[];
  logs: CleaningLog[];
  settings: AppSettings;
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  private sqlite = new SQLiteConnection(CapacitorSQLite);
  private db!: SQLiteDBConnection;
  private ready: Promise<void>;

  // true = corriendo en `ng serve` en navegador; usamos el fallback en vez de SQLite real.
  private readonly useDevFallback = !Capacitor.isNativePlatform();

  constructor() {
    this.ready = this.init();
  }

  private async init(): Promise<void> {
    // En navegador (dev con `ng serve`) no inicializamos SQLite/jeep-sqlite en absoluto —
    // hay un bug conocido de compatibilidad entre jeep-sqlite (Stencil) y el dev-server
    // de Angular basado en Vite (https://github.com/ionic-team/stencil/issues/5457).
    // Usamos un fallback simple de localStorage solo para desarrollo; en Android/iOS
    // reales (Capacitor.isNativePlatform() === true) esto nunca se ejecuta.
    if (this.useDevFallback) {
      return;
    }

    await this.sqlite.checkConnectionsConsistency();
    const isConn = (await this.sqlite.isConnection(DB_NAME, false)).result;

    this.db = isConn
      ? await this.sqlite.retrieveConnection(DB_NAME, false)
      : await this.sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false);

    await this.db.open();
    await this.createSchema();
    await this.migrateFromLocalStorageIfNeeded();
  }

  private async createSchema(): Promise<void> {
    await this.db.execute(`
    CREATE TABLE IF NOT EXISTS drains (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      startDate TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      bathed INTEGER NOT NULL DEFAULT 0,
      bandageChanged INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      symptoms TEXT NOT NULL,
      entries TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      surgeryDate TEXT,
      alertThresholdMl REAL,
      reminderTime TEXT
    );
  `);
  }

  // Migra datos existentes de localStorage la primera vez que corre, y borra la llave legada.
  private async migrateFromLocalStorageIfNeeded(): Promise<void> {
    const raw = localStorage.getItem(LEGACY_LOCALSTORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      const drains: Drain[] = parsed.drains ?? [];
      const logs: CleaningLog[] = parsed.logs ?? [];
      const settings: AppSettings = parsed.settings ?? {};

      for (const d of drains) {
        await this.db.run(
          `INSERT OR REPLACE INTO drains (id, label, startDate) VALUES (?, ?, ?)`,
          [d.id, d.label, d.startDate]
        );
      }

      for (const log of logs) {
        await this.db.run(
          `INSERT OR REPLACE INTO logs (id, timestamp, bathed, bandageChanged, notes, symptoms, entries)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            log.id, log.timestamp, log.bathed ? 1 : 0, log.bandageChanged ? 1 : 0,
            log.notes ?? null, JSON.stringify(log.symptoms), JSON.stringify(log.entries),
          ]
        );
      }

      await this.db.run(
        `INSERT OR REPLACE INTO settings (id, surgeryDate, alertThresholdMl, reminderTime)
   VALUES (1, ?, ?, ?)`,
        [settings.surgeryDate ?? null, settings.alertThresholdMl ?? null, (settings as any).reminderTime ?? null]
      );

      localStorage.removeItem(LEGACY_LOCALSTORAGE_KEY);
    } catch {
      // Si el JSON legado está corrupto, no migramos pero tampoco rompemos el arranque de la app
    }
  }

  // ── Fallback de desarrollo (solo navegador / ng serve) ─────────────────────
  private loadDevState(): DevState {
    try {
      const raw = localStorage.getItem(DEV_FALLBACK_KEY);
      if (!raw) return { drains: [], logs: [], settings: {} };
      return JSON.parse(raw) as DevState;
    } catch {
      return { drains: [], logs: [], settings: {} };
    }
  }

  private saveDevState(state: DevState): void {
    localStorage.setItem(DEV_FALLBACK_KEY, JSON.stringify(state));
  }

  // ── Drains ───────────────────────────────────────────────────────────────
  async getDrains(): Promise<Drain[]> {
    await this.ready;
    if (this.useDevFallback) return this.loadDevState().drains;

    const res = await this.db.query(`SELECT * FROM drains ORDER BY startDate ASC`);
    return (res.values ?? []) as Drain[];
  }

  async saveDrains(drains: Drain[]): Promise<void> {
    await this.ready;
    if (this.useDevFallback) {
      const state = this.loadDevState();
      this.saveDevState({ ...state, drains });
      return;
    }

    await this.db.run(`DELETE FROM drains`);
    for (const d of drains) {
      await this.db.run(
        `INSERT INTO drains (id, label, startDate) VALUES (?, ?, ?)`,
        [d.id, d.label, d.startDate]
      );
    }
  }

  // ── Logs ─────────────────────────────────────────────────────────────────
  async getLogs(): Promise<CleaningLog[]> {
    await this.ready;
    if (this.useDevFallback) {
      return [...this.loadDevState().logs].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    }

    const res = await this.db.query(`SELECT * FROM logs ORDER BY timestamp DESC`);
    return (res.values ?? []).map(row => this.rowToLog(row));
  }

  async addLog(log: CleaningLog): Promise<void> {
    await this.ready;
    if (this.useDevFallback) {
      const state = this.loadDevState();
      this.saveDevState({ ...state, logs: [log, ...state.logs] });
      return;
    }

    await this.db.run(
      `INSERT INTO logs (id, timestamp, bathed, bandageChanged, notes, symptoms, entries)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        log.id, log.timestamp, log.bathed ? 1 : 0, log.bandageChanged ? 1 : 0,
        log.notes ?? null, JSON.stringify(log.symptoms), JSON.stringify(log.entries),
      ]
    );
  }

  async deleteLog(id: string): Promise<void> {
    await this.ready;
    if (this.useDevFallback) {
      const state = this.loadDevState();
      this.saveDevState({ ...state, logs: state.logs.filter(l => l.id !== id) });
      return;
    }

    await this.db.run(`DELETE FROM logs WHERE id = ?`, [id]);
  }

  // ── Settings ─────────────────────────────────────────────────────────────
  async getSettings(): Promise<AppSettings> {
    await this.ready;
    if (this.useDevFallback) return this.loadDevState().settings;

    const res = await this.db.query(`SELECT * FROM settings WHERE id = 1`);
    const row = res.values?.[0];
    if (!row) return {};
    return {
      surgeryDate: row.surgeryDate ?? undefined,
      alertThresholdMl: row.alertThresholdMl ?? undefined,
      reminderTime: row.reminderTime ?? undefined,
    };
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    await this.ready;
    if (this.useDevFallback) {
      const state = this.loadDevState();
      this.saveDevState({ ...state, settings });
      return;
    }

    await this.db.run(
      `INSERT OR REPLACE INTO settings (id, surgeryDate, alertThresholdMl, reminderTime)
     VALUES (1, ?, ?, ?)`,
      [settings.surgeryDate ?? null, settings.alertThresholdMl ?? null, settings.reminderTime ?? null]
    );
  }

  async patchSettings(patch: Partial<AppSettings>): Promise<void> {
    const current = await this.getSettings();
    await this.saveSettings({ ...current, ...patch });
  }

  // ── Utils ────────────────────────────────────────────────────────────────
  async clear(): Promise<void> {
    await this.ready;
    if (this.useDevFallback) {
      localStorage.removeItem(DEV_FALLBACK_KEY);
      return;
    }

    await this.db.run(`DELETE FROM drains`);
    await this.db.run(`DELETE FROM logs`);
    await this.db.run(`DELETE FROM settings`);
  }

  private rowToLog(row: any): CleaningLog {
    return {
      id: row.id,
      timestamp: row.timestamp,
      bathed: !!row.bathed,
      bandageChanged: !!row.bandageChanged,
      notes: row.notes ?? undefined,
      symptoms: JSON.parse(row.symptoms) as Symptoms,
      entries: JSON.parse(row.entries) as DrainEntry[],
    };
  }
}