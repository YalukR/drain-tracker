import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { StorageService } from '../../core/services/storage.service';
import { CleaningLog, Drain, DrainEntry, Symptoms, LIQUID_COLORS, LiquidColor, PainLevel, BruiseColor } from '../../core/models';
import { NotificationService } from 'src/app/core/services/notification.service';
import { EmptyComponent } from 'src/app/shared/empty/empty.component';
import { DrainEntryCardComponent } from './drain-entry-card/drain-entry-card.component';
import { SymptomsSectionComponent } from './symptoms-section/symptoms-section.component';
import { CustomDateSectionComponent } from './custom-date-section/custom-date-section.component';
import { VolumeAlertComponent } from './volume-alert/volume-alert.component';
import { PillOption } from 'src/app/pages/clean/pill-select/pill-select.component';

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

type ClotSize = NonNullable<DrainEntry['clotSize']>;
type ClotStatus = NonNullable<DrainEntry['clotStatus']>;

const CLOT_SIZE_OPTIONS: PillOption<ClotSize>[] = [
  { value: 'pequeno', label: 'Pequeño' },
  { value: 'grande', label: 'Grande' },
];

const CLOT_STATUS_OPTIONS: PillOption<ClotStatus>[] = [
  { value: 'drenoSolo', label: 'Se drenó solo' },
  { value: 'atascado', label: 'Se atascó en el tubo' },
];

@Component({
  selector: 'app-clean',
  standalone: true,
  imports: [
    FormsModule, ButtonModule, EmptyComponent,
    DrainEntryCardComponent, SymptomsSectionComponent,
    CustomDateSectionComponent, VolumeAlertComponent,
  ],
  templateUrl: './clean.component.html'
})
export class CleanComponent implements OnInit {
  router = inject(Router);
  private storage = inject(StorageService);
  private notifications = inject(NotificationService);

  drains = signal<Drain[]>([]);
  amounts = signal<Record<string, number>>({});
  entries = signal<Record<string, Partial<DrainEntry>>>({});
  symptoms = signal<Symptoms>(DEFAULT_SYMPTOMS());
  bathed = false;
  bandageChanged = false;
  notes = '';
  saving = signal(false);
  saved = signal(false);
  loading = signal(true);

  useCustomDate = false;
  customDatePart = '';
  customTimePart = '';
  today = new Date().toISOString().split('T')[0];
  alertThresholdMl = signal<number | undefined>(undefined);

  liquidColors = LIQUID_COLORS;
  clotSizeOptions = CLOT_SIZE_OPTIONS;
  clotStatusOptions = CLOT_STATUS_OPTIONS;

  painOptions: PillOption<PainLevel>[] = [
    { value: 'ninguno', label: 'Ninguno' },
    { value: 'suave', label: 'Suave' },
    { value: 'moderado', label: 'Moderado' },
    { value: 'intenso', label: 'Intenso' },
  ];

  bruiseOptions: PillOption<BruiseColor>[] = [
    { value: 'rojo', label: 'Rojo', hex: '#ef4444' },
    { value: 'morado', label: 'Morado', hex: '#a855f7' },
    { value: 'verde', label: 'Verde', hex: '#22c55e' },
    { value: 'amarillo', label: 'Amarillo', hex: '#f59e0b' },
  ];

  nowStr = computed(() => {
    const now = new Date();
    return now.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
      + ' — ' + now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  });

  totalMl = computed(() =>
    this.drains().reduce((sum, d) => sum + this.getAmount(d.id), 0)
  );

  thresholdExceeded = computed(() => {
    const threshold = this.alertThresholdMl();
    return threshold !== undefined && this.totalMl() > threshold;
  });

  async ngOnInit(): Promise<void> {
    const [drains, settings] = await Promise.all([
      this.storage.getDrains(),
      this.storage.getSettings(),
    ]);

    this.drains.set(drains);
    this.alertThresholdMl.set(settings.alertThresholdMl);

    const init: Record<string, number> = {};
    const entryInit: Record<string, Partial<DrainEntry>> = {};
    drains.forEach(d => {
      init[d.id] = 0;
      entryInit[d.id] = { hasClot: false, leakingOutside: false };
    });
    this.amounts.set(init);
    this.entries.set(entryInit);
    this.loading.set(false);
  }

  getAmount(id: string): number { return this.amounts()[id] ?? 0; }
  setAmount(id: string, val: number): void {
    this.amounts.update(a => ({ ...a, [id]: val }));
  }

  getEntry(id: string): Partial<DrainEntry> { return this.entries()[id] ?? {}; }
  setEntryField(id: string, field: keyof DrainEntry, value: unknown): void {
    this.entries.update(e => ({ ...e, [id]: { ...e[id], [field]: value } }));
  }

  get resolvedTimestamp(): string {
    if (this.useCustomDate && this.customDatePart) {
      const time = this.customTimePart || '12:00:00';
      const [year, month, day] = this.customDatePart.split('-').map(Number);
      const [hour, minute, second] = time.split(':').map(Number);
      return new Date(year, month - 1, day, hour, minute, second ?? 0).toISOString();
    }
    return new Date().toISOString();
  }

  async save(): Promise<void> {
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
      timestamp: this.resolvedTimestamp,
      entries,
      bathed: this.bathed,
      bandageChanged: this.bandageChanged,
      symptoms: { ...this.symptoms() },
      notes: this.notes.trim() || undefined,
    };

    await this.storage.addLog(log);
    await this.notifications.reschedule();

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
    this.symptoms.set(DEFAULT_SYMPTOMS());
    this.bathed = false;
    this.bandageChanged = false;
    this.notes = '';
    this.customDatePart = '';
    this.customTimePart = '';
    setTimeout(() => this.saved.set(false), 3000);
  }
}