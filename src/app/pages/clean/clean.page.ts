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
  template: `
    <div class="page anim-fade-in">

      <div style="margin-bottom:28px;">
        <p class="section-label">Nueva limpieza</p>
        <h1 class="page-title">Registrar vaciado</h1>
        <p style="font-size:13px; color:var(--color-text-muted); margin-top:6px;">
          {{ nowStr() }}
        </p>
      </div>

      @if (drains().length === 0) {
        <div class="empty-state anim-scale-in">
          <div class="empty-state__icon"><i class="pi pi-exclamation-circle"></i></div>
          <h3>Sin drenajes configurados</h3>
          <p>Primero agrega tus drenajes en la pantalla de inicio.</p>
          <button class="btn btn-primary" style="margin-top:8px" (click)="router.navigate(['/'])">
            <i class="pi pi-home"></i> Ir a inicio
          </button>
        </div>
      } @else {

        <!-- ── Por drenaje ─────────────────────────────────────────────── -->
        <p class="section-label">Cantidad por drenaje</p>
        <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:24px;">
          @for (d of drains(); track d.id; let i = $index) {
            <div class="card card-body anim-fade-up delay-{{i+1}}">

              <!-- Nombre drenaje -->
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:14px;">
                <i class="pi pi-circle-fill" style="font-size:8px; color:var(--color-primary);"></i>
                <span style="font-weight:600; font-size:15px;">{{ d.label }}</span>
              </div>

              <!-- Cantidad -->
              <div style="display:flex; align-items:center; gap:10px; margin-bottom:14px;">
                <button class="btn btn-icon" (click)="decrement(d.id)" [disabled]="getAmount(d.id) <= 0">
                  <i class="pi pi-minus"></i>
                </button>
                <div style="flex:1; position:relative;">
                  <input type="number" [ngModel]="getAmount(d.id)"
                         (ngModelChange)="setAmount(d.id, $event)"
                         min="0" max="999"
                         style="text-align:center; font-size:22px; font-weight:700;">
                  <span style="position:absolute; right:12px; top:50%; transform:translateY(-50%);
                               font-size:12px; color:var(--color-text-muted); pointer-events:none;">ml</span>
                </div>
                <button class="btn btn-icon" (click)="increment(d.id)">
                  <i class="pi pi-plus"></i>
                </button>
              </div>

              <!-- Color del líquido -->
              <div class="field" style="margin-bottom:12px;">
                <label>Color del líquido</label>
                <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:6px;">
                  @for (c of liquidColors; track c.value) {
                    <button
                      (click)="setColor(d.id, c.value)"
                      [style.border-color]="getColor(d.id) === c.value ? c.hex : 'transparent'"
                      style="padding:8px 6px; border-radius:var(--r-md); border:2px solid transparent;
                             background:var(--color-surface2); cursor:pointer; transition:all 150ms;
                             display:flex; flex-direction:column; align-items:center; gap:5px;">
                      <span [style.background]="c.hex"
                            style="width:20px; height:20px; border-radius:50%;
                                   border:1px solid rgba(255,255,255,.15); display:block;"></span>
                      <span style="font-size:10px; color:var(--color-text-muted); text-align:center; line-height:1.2;">
                        {{ c.label }}
                      </span>
                    </button>
                  }
                </div>
              </div>

              <!-- Coágulo -->
              <div style="margin-bottom:10px;">
                <label class="dt-toggle" style="margin-bottom:10px; display:flex;">
                  <input type="checkbox" [ngModel]="getEntry(d.id).hasClot"
                         (ngModelChange)="setEntryField(d.id, 'hasClot', $event)">
                  <span>Salió coágulo</span>
                </label>

                @if (getEntry(d.id).hasClot) {
                  <div style="padding:12px; background:var(--color-surface2);
                               border-radius:var(--r-md); margin-top:8px;
                               display:flex; flex-direction:column; gap:10px;" class="anim-scale-in">
                    <div>
                      <p style="font-size:12px; color:var(--color-text-muted); margin-bottom:6px;">Tamaño</p>
                      <div style="display:flex; gap:8px;">
                        @for (opt of [{v:'pequeno',l:'Pequeño'},{v:'grande',l:'Grande'}]; track opt.v) {
                          <button (click)="setEntryField(d.id, 'clotSize', opt.v)"
                            [style.background]="getEntry(d.id).clotSize===opt.v ? 'var(--color-primary-dim)' : 'transparent'"
                            [style.border-color]="getEntry(d.id).clotSize===opt.v ? 'var(--color-primary)' : 'var(--color-border)'"
                            style="flex:1; padding:8px; border-radius:var(--r-md); border:1.5px solid;
                                   font-size:13px; font-weight:500; color:var(--color-text);
                                   cursor:pointer; transition:all 150ms; font-family:var(--font);">
                            {{ opt.l }}
                          </button>
                        }
                      </div>
                    </div>
                    <div>
                      <p style="font-size:12px; color:var(--color-text-muted); margin-bottom:6px;">¿Qué pasó?</p>
                      <div style="display:flex; gap:8px;">
                        @for (opt of [{v:'drenoSolo',l:'Se drenó solo'},{v:'atascado',l:'Se atascó en el tubo'}]; track opt.v) {
                          <button (click)="setEntryField(d.id, 'clotStatus', opt.v)"
                            [style.background]="getEntry(d.id).clotStatus===opt.v ? 'var(--color-primary-dim)' : 'transparent'"
                            [style.border-color]="getEntry(d.id).clotStatus===opt.v ? 'var(--color-primary)' : 'var(--color-border)'"
                            style="flex:1; padding:8px; border-radius:var(--r-md); border:1.5px solid;
                                   font-size:12px; font-weight:500; color:var(--color-text);
                                   cursor:pointer; transition:all 150ms; font-family:var(--font); text-align:center;">
                            {{ opt.l }}
                          </button>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>

              <!-- Fuga por la piel -->
              <label class="dt-toggle">
                <input type="checkbox" [ngModel]="getEntry(d.id).leakingOutside"
                       (ngModelChange)="setEntryField(d.id, 'leakingOutside', $event)">
                <span>Hubo fuga por el orificio de la piel</span>
              </label>

            </div>
          }
        </div>

        <!-- ── Síntomas ────────────────────────────────────────────────── -->
        <p class="section-label">Síntomas</p>
        <div class="card card-body anim-fade-up" style="display:flex; flex-direction:column; gap:14px; margin-bottom:24px;">

          <label class="dt-toggle">
            <input type="checkbox" [(ngModel)]="symptoms.redness">
            <span>Enrojecimiento en la herida</span>
          </label>

          <label class="dt-toggle">
            <input type="checkbox" [(ngModel)]="symptoms.numbness">
            <span>Adormecimiento</span>
          </label>

          <label class="dt-toggle">
            <input type="checkbox" [(ngModel)]="symptoms.suctionSensation">
            <span>Sensación de vacío / succión</span>
          </label>

          <label class="dt-toggle">
            <input type="checkbox" [(ngModel)]="symptoms.tingling">
            <span>Pinchazos</span>
          </label>

          <label class="dt-toggle">
            <input type="checkbox" [(ngModel)]="symptoms.itching">
            <span>Comezón</span>
          </label>

          <!-- Nivel de dolor -->
          <div>
            <p style="font-size:13px; font-weight:500; color:var(--color-text-muted); margin-bottom:8px;">Nivel de dolor</p>
            <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:6px;">
              @for (opt of painOptions; track opt.v) {
                <button (click)="symptoms.painLevel = opt.v"
                  [style.background]="symptoms.painLevel===opt.v ? 'var(--color-primary-dim)' : 'transparent'"
                  [style.border-color]="symptoms.painLevel===opt.v ? 'var(--color-primary)' : 'var(--color-border)'"
                  style="padding:8px 4px; border-radius:var(--r-md); border:1.5px solid;
                         font-size:12px; font-weight:500; color:var(--color-text);
                         cursor:pointer; transition:all 150ms; font-family:var(--font); text-align:center;">
                  {{ opt.l }}
                </button>
              }
            </div>
          </div>

          <!-- Cambios en la piel -->
          <label class="dt-toggle">
            <input type="checkbox" [(ngModel)]="symptoms.skinColorChange">
            <span>Cambio de coloración en la piel</span>
          </label>

          @if (symptoms.skinColorChange) {
            <div style="padding:12px; background:var(--color-surface2); border-radius:var(--r-md);" class="anim-scale-in">
              <p style="font-size:12px; color:var(--color-text-muted); margin-bottom:8px;">Color del hematoma</p>
              <div style="display:flex; gap:8px; flex-wrap:wrap;">
                @for (opt of bruiseOptions; track opt.v) {
                  <button (click)="symptoms.bruiseColor = opt.v"
                    [style.background]="symptoms.bruiseColor===opt.v ? opt.hex+'33' : 'transparent'"
                    [style.border-color]="symptoms.bruiseColor===opt.v ? opt.hex : 'var(--color-border)'"
                    style="padding:8px 14px; border-radius:var(--r-full); border:1.5px solid;
                           font-size:12px; font-weight:500; color:var(--color-text);
                           cursor:pointer; transition:all 150ms; font-family:var(--font);">
                    {{ opt.l }}
                  </button>
                }
              </div>
            </div>
          }

          <!-- Fiebre -->
          <label class="dt-toggle">
            <input type="checkbox" [(ngModel)]="symptoms.fever">
            <span>Fiebre</span>
          </label>

          @if (symptoms.fever) {
            <div class="field anim-scale-in" style="margin-bottom:0;">
              <label>Temperatura (°C)</label>
              <input type="number" [(ngModel)]="symptoms.feverTemp"
                     min="35" max="42" step="0.1" placeholder="ej: 38.5">
            </div>
          }

        </div>

        <!-- ── Actividades ─────────────────────────────────────────────── -->
        <p class="section-label">Actividades</p>
        <div class="card card-body anim-fade-up" style="display:flex; flex-direction:column; gap:14px; margin-bottom:24px;">
          <label class="dt-toggle">
            <input type="checkbox" [(ngModel)]="bathed">
            <span>Se bañó / duchó</span>
          </label>
          <label class="dt-toggle">
            <input type="checkbox" [(ngModel)]="bandageChanged">
            <span>Se cambió el vendaje</span>
          </label>
        </div>

        <!-- ── Notas ───────────────────────────────────────────────────── -->
        <p class="section-label">Notas adicionales (opcional)</p>
        <div class="field anim-fade-up" style="margin-bottom:24px;">
          <textarea [(ngModel)]="notes" rows="3"
                    placeholder="Cualquier observación adicional..."></textarea>
        </div>

        <!-- ── Guardar ─────────────────────────────────────────────────── -->
        <button class="btn btn-primary btn-full anim-fade-up"
                style="font-size:16px; padding:14px;"
                (click)="save()" [disabled]="saving()">
          @if (saving()) {
            <i class="pi pi-spin pi-spinner"></i> Guardando...
          } @else {
            <i class="pi pi-check-circle"></i> Guardar registro
          }
        </button>

        @if (saved()) {
          <div class="anim-scale-in"
               style="margin-top:16px; text-align:center;
                      color:var(--color-success); font-size:14px; font-weight:600;">
            <i class="pi pi-check"></i> Registro guardado correctamente
          </div>
        }
      }
    </div>
  `
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
    { v: 'suave',   l: 'Suave'   },
    { v: 'moderado',l: 'Moderado'},
    { v: 'intenso', l: 'Intenso' },
  ];
  bruiseOptions: { v: BruiseColor; l: string; hex: string }[] = [
    { v: 'rojo',     l: 'Rojo',     hex: '#ef4444' },
    { v: 'morado',   l: 'Morado',   hex: '#a855f7' },
    { v: 'verde',    l: 'Verde',    hex: '#22c55e' },
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
