import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage.service';
import { CleaningLog } from '../../models';

interface DayTotal {
  date: string;
  label: string;
  total: number;
  byDrain: Record<string, number>;
}

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page anim-fade-in">

      <div style="margin-bottom:28px;">
        <p class="section-label">Análisis</p>
        <h1 class="page-title">Estadísticas</h1>
      </div>

      @if (logs().length < 2) {
        <div class="empty-state anim-scale-in">
          <div class="empty-state__icon"><i class="pi pi-chart-bar"></i></div>
          <h3>Pocos datos aún</h3>
          <p>Necesitás al menos 2 registros para ver tendencias.</p>
        </div>
      } @else {

        <!-- Resumen global -->
        <p class="section-label">Resumen</p>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:24px;">
          <div class="card card-body anim-fade-up delay-1" style="text-align:center;">
            <div style="font-size:28px; font-weight:700; color:var(--color-primary);">
              {{ totalLogs() }}
            </div>
            <div style="font-size:12px; color:var(--color-text-muted); margin-top:4px;">Limpiezas</div>
          </div>
          <div class="card card-body anim-fade-up delay-2" style="text-align:center;">
            <div style="font-size:28px; font-weight:700; color:var(--color-primary);">
              {{ totalMl() }}
            </div>
            <div style="font-size:12px; color:var(--color-text-muted); margin-top:4px;">ml totales</div>
          </div>
          <div class="card card-body anim-fade-up delay-3" style="text-align:center;">
            <div style="font-size:28px; font-weight:700; color:var(--color-primary);">
              {{ avgMl() }}
            </div>
            <div style="font-size:12px; color:var(--color-text-muted); margin-top:4px;">ml promedio</div>
          </div>
          <div class="card card-body anim-fade-up delay-4" style="text-align:center;">
            <div style="font-size:22px; font-weight:700;" [style.color]="trendColor()">
              <i [class]="'pi ' + trendIcon()"></i>
            </div>
            <div style="font-size:12px; color:var(--color-text-muted); margin-top:4px;">Tendencia</div>
            <div style="font-size:11px; font-weight:600; margin-top:2px;" [style.color]="trendColor()">
              {{ trendLabel() }}
            </div>
          </div>
        </div>

        <!-- Gráfico de barras por día -->
        <p class="section-label">Fluido por día (últimos {{ dailyTotals().length }} días)</p>
        <div class="card card-body anim-fade-up delay-3" style="margin-bottom:24px;">
          @if (dailyTotals().length > 0) {
            <div style="display:flex; align-items:flex-end; gap:6px; height:120px; padding-bottom:24px; position:relative;">
              @for (day of dailyTotals(); track day.date) {
                <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:4px; height:100%; justify-content:flex-end;">
                  <span style="font-size:10px; color:var(--color-primary); font-weight:600; writing-mode:horizontal-tb;">
                    {{ day.total > 0 ? day.total : '' }}
                  </span>
                  <div [style.height.%]="barHeight(day.total)"
                       style="width:100%; border-radius:4px 4px 0 0; min-height:4px;
                              background:linear-gradient(to top, var(--cyan-700), var(--cyan-400));
                              transition:height 600ms var(--ease-out);">
                  </div>
                  <span style="font-size:10px; color:var(--color-text-muted); position:absolute; bottom:0;">
                    {{ day.label }}
                  </span>
                </div>
              }
            </div>
          }
        </div>

        <!-- Por drenaje -->
        @if (drainIds().length > 1) {
          <p class="section-label">Promedio por drenaje</p>
          <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:24px;">
            @for (dr of drainAvgs(); track dr.id; let i = $index) {
              <div class="card card-body anim-fade-up delay-{{i+1}}">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                  <span style="font-weight:600; font-size:14px;">
                    <i class="pi pi-circle-fill" style="font-size:8px; color:var(--color-primary); margin-right:6px;"></i>
                    {{ dr.label }}
                  </span>
                  <span style="font-size:15px; font-weight:700; color:var(--color-primary);">
                    {{ dr.avg }} ml/reg
                  </span>
                </div>
                <!-- Mini barra -->
                <div style="height:6px; background:var(--color-surface2); border-radius:var(--r-full); overflow:hidden;">
                  <div [style.width.%]="dr.pct"
                       style="height:100%; background:linear-gradient(to right, var(--cyan-700), var(--cyan-400));
                              border-radius:var(--r-full); transition:width 700ms var(--ease-out);">
                  </div>
                </div>
              </div>
            }
          </div>
        }

        <!-- Tendencia detallada -->
        <p class="section-label">Comparación últimas limpiezas</p>
        <div class="card card-body anim-fade-up">
          @for (c of comparisons(); track c.label) {
            <div style="display:flex; justify-content:space-between; align-items:center;
                         padding:10px 0; border-bottom:1px solid var(--color-border-subtle);">
              <span style="font-size:13px; color:var(--color-text-muted);">{{ c.label }}</span>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:14px; font-weight:600;">{{ c.value }} ml</span>
                @if (c.diff !== null) {
                  <span class="badge" [class]="c.diff < 0 ? 'badge-success' : c.diff > 0 ? 'badge-danger' : 'badge-neutral'">
                    <i [class]="'pi ' + (c.diff < 0 ? 'pi-arrow-down' : c.diff > 0 ? 'pi-arrow-up' : 'pi-minus')"
                       style="font-size:9px;"></i>
                    {{ c.diff !== 0 ? (c.diff > 0 ? '+' : '') + c.diff : '=' }}
                  </span>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class StatsPage implements OnInit {
  private storage = inject(StorageService);
  logs = signal<CleaningLog[]>([]);

  ngOnInit(): void { this.logs.set(this.storage.getLogs()); }

  totalLogs = computed(() => this.logs().length);

  totalMl = computed(() =>
    this.logs().reduce((s, l) => s + l.entries.reduce((es, e) => es + e.amountMl, 0), 0)
  );

  avgMl = computed(() =>
    this.totalLogs() === 0 ? 0 : Math.round(this.totalMl() / this.totalLogs())
  );

  // Totales por día (últimos 14 días con datos)
  dailyTotals = computed((): DayTotal[] => {
    const map = new Map<string, DayTotal>();
    this.logs().forEach(l => {
      const d = l.timestamp.split('T')[0];
      const total = l.entries.reduce((s, e) => s + e.amountMl, 0);
      if (!map.has(d)) {
        map.set(d, { date: d, label: this.shortDate(d), total: 0, byDrain: {} });
      }
      const entry = map.get(d)!;
      entry.total += total;
      l.entries.forEach(e => {
        entry.byDrain[e.drainId] = (entry.byDrain[e.drainId] || 0) + e.amountMl;
      });
    });
    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-14)
      .map(([, v]) => v);
  });

  maxDay = computed(() => Math.max(...this.dailyTotals().map(d => d.total), 1));

  barHeight(total: number): number {
    return Math.max(Math.round((total / this.maxDay()) * 100), total > 0 ? 4 : 0);
  }

  // IDs únicos de drenajes en los logs
  drainIds = computed(() => {
    const ids = new Map<string, string>();
    this.logs().forEach(l => l.entries.forEach(e => ids.set(e.drainId, e.drainLabel)));
    return [...ids.entries()].map(([id, label]) => ({ id, label }));
  });

  drainAvgs = computed(() => {
    const totals: Record<string, { label: string; sum: number; count: number }> = {};
    this.logs().forEach(l => l.entries.forEach(e => {
      if (!totals[e.drainId]) totals[e.drainId] = { label: e.drainLabel, sum: 0, count: 0 };
      totals[e.drainId].sum += e.amountMl;
      totals[e.drainId].count++;
    }));
    const avgs = Object.entries(totals).map(([id, v]) => ({
      id, label: v.label, avg: Math.round(v.sum / v.count)
    }));
    const max = Math.max(...avgs.map(a => a.avg), 1);
    return avgs.map(a => ({ ...a, pct: Math.round((a.avg / max) * 100) }));
  });

  // Últimas 5 limpiezas con diferencia vs anterior
  comparisons = computed(() => {
    const last5 = [...this.logs()].slice(0, 5).reverse();
    return last5.map((l, i) => {
      const val = l.entries.reduce((s, e) => s + e.amountMl, 0);
      const prev = i > 0 ? last5[i - 1].entries.reduce((s, e) => s + e.amountMl, 0) : null;
      return {
        label: this.shortDateFull(l.timestamp),
        value: val,
        diff: prev !== null ? val - prev : null
      };
    }).reverse();
  });

  // Tendencia: compara primera mitad vs segunda mitad de logs
  trend = computed(() => {
    const ls = [...this.logs()].reverse();
    if (ls.length < 2) return 0;
    const mid = Math.floor(ls.length / 2);
    const first = ls.slice(0, mid).reduce((s, l) => s + l.entries.reduce((es, e) => es + e.amountMl, 0), 0) / mid;
    const second = ls.slice(mid).reduce((s, l) => s + l.entries.reduce((es, e) => es + e.amountMl, 0), 0) / (ls.length - mid);
    return first - second; // positivo = bajando (bueno)
  });

  trendIcon = computed(() => {
    const t = this.trend();
    if (t > 10) return 'pi-arrow-down';
    if (t < -10) return 'pi-arrow-up';
    return 'pi-minus';
  });

  trendColor = computed(() => {
    const t = this.trend();
    if (t > 10) return 'var(--color-success)';
    if (t < -10) return 'var(--color-danger)';
    return 'var(--color-text-muted)';
  });

  trendLabel = computed(() => {
    const t = this.trend();
    if (t > 10) return 'Bajando';
    if (t < -10) return 'Subiendo';
    return 'Estable';
  });

  shortDate(d: string): string {
    return new Date(d + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' });
  }

  shortDateFull(iso: string): string {
    return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }) +
      ' ' + new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  }
}
