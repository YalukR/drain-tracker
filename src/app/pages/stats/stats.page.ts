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
  templateUrl: './stats.page.html' 
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
