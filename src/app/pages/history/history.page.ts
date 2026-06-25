import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage.service';
import { PdfService } from '../../services/pdf.service';
import { CleaningLog, LIQUID_COLORS } from '../../models';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page anim-fade-in">

      <!-- Header -->
      <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:28px; gap:12px;">
        <div>
          <p class="section-label">Registros</p>
          <h1 class="page-title">Historial</h1>
        </div>
        @if (logs().length > 0) {
          <button class="btn btn-ghost" style="flex-shrink:0; margin-top:18px"
                  (click)="downloadPdf()" [disabled]="generating()">
            @if (generating()) {
              <i class="pi pi-spin pi-spinner"></i>
            } @else {
              <i class="pi pi-file-pdf"></i>
            }
            PDF
          </button>
        }
      </div>

      @if (logs().length === 0) {
        <div class="empty-state anim-scale-in">
          <div class="empty-state__icon"><i class="pi pi-list"></i></div>
          <h3>Sin registros aún</h3>
          <p>Los registros de tus limpiezas aparecerán aquí.</p>
        </div>
      } @else {
        <div style="display:flex; flex-direction:column; gap:12px;">
          @for (log of logs(); track log.id; let i = $index) {
            <div class="card anim-fade-up delay-{{i < 8 ? i+1 : 8}}">

              <!-- Header del registro -->
              <div style="padding:14px 16px 10px; display:flex; align-items:center; gap:10px;
                           border-bottom:1px solid var(--color-border-subtle);">
                <div style="flex:1;">
                  <div style="font-weight:600; font-size:15px;">{{ formatDate(log.timestamp) }}</div>
                  <div style="font-size:12px; color:var(--color-text-muted); margin-top:2px;">
                    <i class="pi pi-clock" style="font-size:11px;"></i>
                    {{ formatTime(log.timestamp) }}
                  </div>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                  @if (log.bathed) {
                    <span class="badge badge-cyan" title="Se bañó"><i class="pi pi-send" style="font-size:10px;"></i></span>
                  }
                  @if (log.bandageChanged) {
                    <span class="badge badge-success" title="Vendaje cambiado"><i class="pi pi-plus" style="font-size:10px;"></i></span>
                  }
                  @if (log.symptoms?.fever) {
                    <span class="badge badge-danger" title="Fiebre"><i class="pi pi-exclamation-triangle" style="font-size:10px;"></i></span>
                  }
                  <button class="btn btn-icon" style="width:30px; height:30px; padding:0"
                          (click)="confirmDelete(log.id)" aria-label="Eliminar">
                    <i class="pi pi-trash" style="font-size:13px;"></i>
                  </button>
                </div>
              </div>

              <!-- Entradas por drenaje -->
              <div style="padding:10px 16px;">
                @for (entry of log.entries; track entry.drainId) {
                  <div style="padding:8px 0; border-bottom:1px solid var(--color-border-subtle);">
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
                      <div style="display:flex; align-items:center; gap:8px; font-size:14px; font-weight:500;">
                        <i class="pi pi-circle-fill" style="font-size:7px; color:var(--color-primary);"></i>
                        {{ entry.drainLabel }}
                      </div>
                      <span style="font-weight:700; font-size:15px; color:var(--color-primary);">
                        {{ entry.amountMl }}
                        <span style="font-size:11px; font-weight:400; color:var(--color-text-muted);">ml</span>
                      </span>
                    </div>
                    <!-- Detalles de la entrada -->
                    <div style="display:flex; flex-wrap:wrap; gap:5px; margin-top:4px; padding-left:16px;">
                      @if (entry.liquidColor) {
                        <span class="badge badge-neutral" style="display:flex; align-items:center; gap:4px;">
                          <span [style.background]="getColorHex(entry.liquidColor)"
                                style="width:8px; height:8px; border-radius:50%; display:inline-block;"></span>
                          {{ getColorLabel(entry.liquidColor) }}
                        </span>
                      }
                      @if (entry.hasClot) {
                        <span class="badge badge-warning">
                          Coágulo {{ entry.clotSize === 'grande' ? 'grande' : 'pequeño' }}
                          {{ entry.clotStatus === 'atascado' ? '· se atascó' : '· se drenó' }}
                        </span>
                      }
                      @if (entry.leakingOutside) {
                        <span class="badge badge-danger">Fuga por piel</span>
                      }
                    </div>
                  </div>
                }

                <!-- Total -->
                <div style="display:flex; justify-content:space-between; align-items:center;
                             padding-top:8px; font-size:13px; color:var(--color-text-muted);">
                  <span>Total</span>
                  <span style="font-weight:700; color:var(--color-text);">{{ total(log) }} ml</span>
                </div>
              </div>

              <!-- Síntomas -->
              @if (hasSymptoms(log)) {
                <div style="padding:0 16px 12px;">
                  <div style="background:var(--color-surface2); border-radius:var(--r-md); padding:10px 12px;">
                    <p style="font-size:11px; font-weight:600; letter-spacing:.06em; text-transform:uppercase;
                               color:var(--color-text-muted); margin-bottom:8px;">Síntomas</p>
                    <div style="display:flex; flex-wrap:wrap; gap:5px;">
                      @if (log.symptoms.redness) {
                        <span class="badge badge-warning">Enrojecimiento</span>
                      }
                      @if (log.symptoms.numbness) {
                        <span class="badge badge-neutral">Adormecimiento</span>
                      }
                      @if (log.symptoms.suctionSensation) {
                        <span class="badge badge-neutral">Sensación de vacío</span>
                      }
                      @if (log.symptoms.tingling) {
                        <span class="badge badge-neutral">Pinchazos</span>
                      }
                      @if (log.symptoms.itching) {
                        <span class="badge badge-neutral">Comezón</span>
                      }
                      @if (log.symptoms.painLevel && log.symptoms.painLevel !== 'ninguno') {
                        <span class="badge" [class]="log.symptoms.painLevel === 'intenso' ? 'badge-danger' : 'badge-warning'">
                          Dolor {{ log.symptoms.painLevel }}
                        </span>
                      }
                      @if (log.symptoms.skinColorChange) {
                        <span class="badge badge-warning">
                          Cambio de piel{{ log.symptoms.bruiseColor ? ' · ' + log.symptoms.bruiseColor : '' }}
                        </span>
                      }
                      @if (log.symptoms.fever) {
                        <span class="badge badge-danger">
                          Fiebre{{ log.symptoms.feverTemp ? ' ' + log.symptoms.feverTemp + '°C' : '' }}
                        </span>
                      }
                    </div>
                  </div>
                </div>
              }

              <!-- Notas -->
              @if (log.notes) {
                <div style="padding:0 16px 12px;">
                  <div style="background:var(--color-surface2); border-radius:var(--r-md);
                               padding:8px 12px; font-size:13px; color:var(--color-text-muted); font-style:italic;">
                    <i class="pi pi-comment" style="font-size:11px; margin-right:6px;"></i>{{ log.notes }}
                  </div>
                </div>
              }

            </div>
          }
        </div>
      }
    </div>

    <!-- ── Modal de confirmación ─────────────────────────────────────────── -->
    @if (deleteTargetId()) {
      <div style="position:fixed; inset:0; background:rgba(0,0,0,.7); z-index:500;
                  display:flex; align-items:center; justify-content:center; padding:24px;"
           class="anim-fade-in" (click)="cancelDelete()">
        <div class="card card-body anim-scale-in"
             style="max-width:320px; width:100%; text-align:center;"
             (click)="$event.stopPropagation()">
          <div style="width:52px; height:52px; border-radius:50%; background:var(--color-danger-dim);
                       display:flex; align-items:center; justify-content:center; margin:0 auto 16px;">
            <i class="pi pi-trash" style="font-size:22px; color:var(--color-danger);"></i>
          </div>
          <h3 style="font-size:17px; font-weight:700; margin-bottom:8px;">¿Eliminar registro?</h3>
          <p style="font-size:14px; color:var(--color-text-muted); margin-bottom:24px; line-height:1.5;">
            Esta acción no se puede deshacer. El registro se eliminará permanentemente.
          </p>
          <div style="display:flex; gap:10px;">
            <button class="btn btn-surface btn-full" (click)="cancelDelete()">Cancelar</button>
            <button class="btn btn-danger btn-full" (click)="confirmDeleteAction()">
              <i class="pi pi-trash"></i> Eliminar
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class HistoryPage implements OnInit {
  private storage = inject(StorageService);
  private pdfService = inject(PdfService);

  logs = signal<CleaningLog[]>([]);
  generating = signal(false);
  deleteTargetId = signal<string | null>(null);

  ngOnInit(): void { this.logs.set(this.storage.getLogs()); }

  total(log: CleaningLog): number {
    return log.entries.reduce((s, e) => s + e.amountMl, 0);
  }

  hasSymptoms(log: CleaningLog): boolean {
    if (!log.symptoms) return false;
    const s = log.symptoms;
    return s.redness || s.numbness || s.suctionSensation || s.tingling ||
           s.itching || s.skinColorChange || s.fever || s.painLevel !== 'ninguno';
  }

  getColorHex(value: string): string {
    return LIQUID_COLORS.find(c => c.value === value)?.hex ?? '#ccc';
  }

  getColorLabel(value: string): string {
    return LIQUID_COLORS.find(c => c.value === value)?.label ?? value;
  }

  confirmDelete(id: string): void { this.deleteTargetId.set(id); }
  cancelDelete(): void { this.deleteTargetId.set(null); }

  confirmDeleteAction(): void {
    const id = this.deleteTargetId();
    if (!id) return;
    this.storage.deleteLog(id);
    this.logs.set(this.storage.getLogs());
    this.deleteTargetId.set(null);
  }

  async downloadPdf(): Promise<void> {
    this.generating.set(true);
    try {
      await this.pdfService.generate(this.logs(), this.storage.getDrains());
    } finally {
      this.generating.set(false);
    }
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-MX', {
      weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  }
}
