import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { CleaningLog, DrainEntry, Symptoms, LIQUID_COLORS, LiquidColor, PainLevel, BruiseColor } from '../../models';

const DEFAULT_SYMPTOMS = (): Symptoms => ({
  redness: false,
  numbness: false,
  suctionSensation: false,
  painLevel: 'ninguno',
  tingling: false,
  itching: false,
  skinColorChange: false,
  bruiseColor: undefined,
  fever: false,
  feverTemp: undefined,
});

@Component({
  selector: 'app-clean',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clean.page.html'
})
export class CleanPage implements OnInit {
  router = inject(Router);
  private storage = inject(StorageService);

  drains = signal(this.storage.getDrains());
  amounts = signal<Record<string, number>>({});
  entries = signal<Record<string, Partial<DrainEntry>>>({});
  symptoms: Symptoms = DEFAULT_SYMPTOMS();
  bathed = false;
  bandageChanged = false;
  notes = '';
  saving = signal(false);
  saved = signal(false);

  liquidColors = LIQUID_COLORS;
  painOptions: { v: PainLevel; l: string }[] = [
    { v: 'ninguno', l: 'Ninguno' },
    { v: 'suave', l: 'Suave' },
    { v: 'moderado', l: 'Moderado' },
    { v: 'intenso', l: 'Intenso' },
  ];
  bruiseOptions: { v: BruiseColor; l: string; hex: string }[] = [
    { v: 'rojo', l: 'Rojo', hex: '#ef4444' },
    { v: 'morado', l: 'Morado', hex: '#a855f7' },
    { v: 'verde', l: 'Verde', hex: '#22c55e' },
    { v: 'amarillo', l: 'Amarillo', hex: '#f59e0b' },
  ];

  nowStr = computed(() => {
    const now = new Date();
    return now.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
      + ' — ' + now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  });

  ngOnInit(): void {
    const init: Record<string, number> = {};
    const entryInit: Record<string, Partial<DrainEntry>> = {};
    this.drains().forEach(d => {
      init[d.id] = 0;
      entryInit[d.id] = { hasClot: false, leakingOutside: false };
    });
    this.amounts.set(init);
    this.entries.set(entryInit);
  }

  getAmount(id: string): number { return this.amounts()[id] ?? 0; }
  setAmount(id: string, val: number): void {
    this.amounts.update(a => ({ ...a, [id]: Math.max(0, Math.round(Number(val) || 0)) }));
  }
  increment(id: string): void { this.setAmount(id, this.getAmount(id) + 5); }
  decrement(id: string): void { this.setAmount(id, this.getAmount(id) - 5); }

  getEntry(id: string): Partial<DrainEntry> { return this.entries()[id] ?? {}; }
  setEntryField(id: string, field: keyof DrainEntry, value: unknown): void {
    this.entries.update(e => ({ ...e, [id]: { ...e[id], [field]: value } }));
  }
  getColor(id: string): LiquidColor | undefined { return this.getEntry(id).liquidColor; }
  setColor(id: string, color: LiquidColor): void { this.setEntryField(id, 'liquidColor', color); }

  save(): void {
    this.saving.set(true);
    const entries: DrainEntry[] = this.drains().map(d => ({
      drainId: d.id,
      drainLabel: d.label,
      amountMl: this.getAmount(d.id),
      liquidColor: this.getEntry(d.id).liquidColor,
      hasClot: this.getEntry(d.id).hasClot ?? false,
      clotSize: this.getEntry(d.id).clotSize,
      clotStatus: this.getEntry(d.id).clotStatus,
      leakingOutside: this.getEntry(d.id).leakingOutside ?? false,
    }));

    const log: CleaningLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      entries,
      bathed: this.bathed,
      bandageChanged: this.bandageChanged,
      symptoms: { ...this.symptoms },
      notes: this.notes.trim() || undefined,
    };

    this.storage.addLog(log);

    setTimeout(() => {
      this.saving.set(false);
      this.saved.set(true);
      const reset: Record<string, number> = {};
      const entryReset: Record<string, Partial<DrainEntry>> = {};
      this.drains().forEach(d => {
        reset[d.id] = 0;
        entryReset[d.id] = { hasClot: false, leakingOutside: false };
      });
      this.amounts.set(reset);
      this.entries.set(entryReset);
      this.symptoms = DEFAULT_SYMPTOMS();
      this.bathed = false;
      this.bandageChanged = false;
      this.notes = '';
      setTimeout(() => this.saved.set(false), 3000);
    }, 400);
  }
}
