import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { Drain } from '../../../core/models';

@Component({
  selector: 'app-drain-lists',
  standalone: true,
  imports: [],
  templateUrl: './drain-lists.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrainListsComponent {
  drains = input.required<Drain[]>();
  delete = output<Drain>();

  formatDate(d: string): string {
    return new Date(d + 'T12:00:00').toLocaleDateString('es-MX', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  }
}