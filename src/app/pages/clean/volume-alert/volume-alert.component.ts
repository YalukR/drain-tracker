import { Component, input } from '@angular/core';

@Component({
  selector: 'app-volume-alert',
  standalone: true,
  imports: [],
  templateUrl: './volume-alert.component.html',
})
export class VolumeAlertComponent {
  totalMl = input.required<number>();
  thresholdMl = input.required<number>();
}