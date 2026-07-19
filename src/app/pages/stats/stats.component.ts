import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { StorageService } from '../../core/services/storage.service';
import { CleaningLog } from '../../core/models';
import { ChartsComponent, ChartPoint } from '../../shared/charts/charts.component';
import { EmptyComponent } from 'src/app/shared/empty/empty.component';

interface DayTotal {
  date: string;
  label: string;
  total: number;
  byDrain: Record<string, number>;
}

type BadgeVariant = 'success' | 'danger' | 'neutral';

const BADGE_CLASSES: Record<BadgeVariant, string> = {
  success: 'bg-green/10 text-green dark:bg-green-dark/10 dark:text-green-dark',
  danger: 'bg-danger/10 text-danger dark:bg-danger-dark/10 dark:text-danger-dark',
  neutral: 'bg-surface-alt text-muted dark:bg-surface-alt-dark dark:text-muted-dark',
};

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [ChartsComponent, EmptyComponent],
  templateUrl: './stats.component.html'
})
export class StatsComponent implements OnInit {
  private storage = inject(StorageService);
  logs = signal<CleaningLog[]>([]);

  ngOnInit(): void {
    this.logs.set(this.storage.getLogs());
    this.settings = this.storage.getSettings();
  }

  settings: ReturnType<StorageService['getSettings']> = {};

  // ── Día de recuperación ───────────────────────────────────────────────
  recoveryDay = computed(() => {
    if (!this.settings.surgeryDate) return null;
    const surgery = new Date(this.settings.surgeryDate + 'T12:00:00');
    const today = new Date();
    const diff = Math.floor((today.getTime() - surgery.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff + 1 : null;
  });

  // ── Resumen global ────────────────────────────────────────────────────
  totalLogs = computed(() => this.logs().length);

  totalMl = computed(() =>
    this.logs().reduce((s, l) => s + l.entries.reduce((es, e) => es + e.amountMl, 0), 0)
  );

  avgMl = computed(() =>
    this.totalLogs() === 0 ? 0 : Math.round(this.totalMl() / this.totalLogs())
  );

  // ── Totales por día (últimos 14 días con datos) ───────────────────────
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

  // Adapta dailyTotals al formato genérico que espera ChartsComponent
  trendChartData = computed((): ChartPoint[] =>
    this.dailyTotals().map(d => ({ label: d.label, value: d.total }))
  );

  // ── Por drenaje ───────────────────────────────────────────────────────
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

  // ── Comparación últimas 5 limpiezas ──────────────────────────────────
  comparisons = computed(() => {
    const last5 = [...this.logs()].slice(0, 5).reverse();
    return last5.map((l, i) => {
      const val = l.entries.reduce((s, e) => s + e.amountMl, 0);
      const prev = i > 0 ? last5[i - 1].entries.reduce((s, e) => s + e.amountMl, 0) : null;
      return {
        label: this.shortDateFull(l.timestamp),
        value: val,
        diff: prev !== null ? val - prev : null,
      };
    }).reverse();
  });

  comparisonBadgeClasses(diff: number): string {
    const variant: BadgeVariant = diff < 0 ? 'success' : diff > 0 ? 'danger' : 'neutral';
    return `inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${BADGE_CLASSES[variant]}`;
  }

  // ── Tendencia general ─────────────────────────────────────────────────
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
    return t > 10 ? 'pi-arrow-down' : t < -10 ? 'pi-arrow-up' : 'pi-minus';
  });

  trendColorClass = computed(() => {
    const t = this.trend();
    if (t > 10) return 'text-green dark:text-green-dark';
    if (t < -10) return 'text-danger dark:text-danger-dark';
    return 'text-muted dark:text-muted-dark';
  });

  trendLabel = computed(() => {
    const t = this.trend();
    return t > 10 ? 'Bajando' : t < -10 ? 'Subiendo' : 'Estable';
  });

  // ── Helpers ───────────────────────────────────────────────────────────
  shortDate(d: string): string {
    return new Date(d + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' });
  }

  shortDateFull(iso: string): string {
    return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }) +
      ' ' + new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  }
}