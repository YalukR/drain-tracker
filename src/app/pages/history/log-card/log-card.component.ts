import { Component, input, output } from '@angular/core';
import { CleaningLog, LIQUID_COLORS } from 'src/app/core/models';

type BadgeVariant = 'cyan' | 'success' | 'danger' | 'warning' | 'neutral';

const BADGE_CLASSES: Record<BadgeVariant, string> = {
  cyan: 'bg-blue-soft text-blue dark:bg-blue-soft-dark dark:text-blue-dark',
  success: 'bg-green/10 text-green dark:bg-green-dark/10 dark:text-green-dark',
  danger: 'bg-danger/10 text-danger dark:bg-danger-dark/10 dark:text-danger-dark',
  warning: 'bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400',
  neutral: 'bg-surface-alt text-muted dark:bg-surface-alt-dark dark:text-muted-dark',
};

@Component({
  selector: 'app-log-card',
  standalone: true,
  imports: [],
  templateUrl: './log-card.component.html',
})
export class LogCardComponent {
  log = input.required<CleaningLog>();

  deleteRequested = output<string>();

  total(): number {
    return this.log().entries.reduce((s, e) => s + e.amountMl, 0);
  }

  hasSymptoms(): boolean {
    const s = this.log().symptoms;
    if (!s) return false;
    return s.redness || s.numbness || s.suctionSensation || s.tingling ||
      s.itching || s.skinColorChange || s.fever || s.painLevel !== 'ninguno';
  }

  getColorHex(value: string): string {
    return LIQUID_COLORS.find(c => c.value === value)?.hex ?? '#ccc';
  }

  getColorLabel(value: string): string {
    return LIQUID_COLORS.find(c => c.value === value)?.label ?? value;
  }

  badgeClasses(variant: BadgeVariant): string {
    return `inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${BADGE_CLASSES[variant]}`;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-MX', {
      weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  }

  onDeleteClick(): void {
    this.deleteRequested.emit(this.log().id);
  }
}