import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-custom-date-section',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './custom-date-section.component.html',
})
export class CustomDateSectionComponent {
  useCustomDate = model.required<boolean>();
  datePart = model.required<string>();
  timePart = model.required<string>();
  maxDate = input.required<string>();
}