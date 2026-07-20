import { Component, input } from '@angular/core';

interface Comparison {
  label: string;
  value: number;
  diff: number | null;
}

type BadgeVariant = 'success' | 'danger' | 'neutral';

const BADGE_CLASSES: Record<BadgeVariant, string> = {
  success: 'bg-green/10 text-green dark:bg-green-dark/10 dark:text-green-dark',
  danger: 'bg-danger/10 text-danger dark:bg-danger-dark/10 dark:text-danger-dark',
  neutral: 'bg-surface-alt text-muted dark:bg-surface-alt-dark dark:text-muted-dark',
};

@Component({
  selector: 'app-cleaning-comparison',
  standalone: true,
  imports: [],
  templateUrl: './cleaning-comparison.component.html',
})
export class CleaningComparisonComponent {
  comparisons = input.required<Comparison[]>();

  badgeClasses(diff: number): string {
    const variant: BadgeVariant = diff < 0 ? 'success' : diff > 0 ? 'danger' : 'neutral';
    return `inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${BADGE_CLASSES[variant]}`;
  }
}