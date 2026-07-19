import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-empty',
  standalone: true,
  imports: [],
  templateUrl: './empty.component.html',
})
export class EmptyComponent {
  icon = input.required<string>(); // ej: 'pi-list', 'pi-exclamation-circle'
  title = input.required<string>();
  description = input.required<string>();

  actionLabel = input<string>();
  actionIcon = input<string>();
  action = output<void>();
}