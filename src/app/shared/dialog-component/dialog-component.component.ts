import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog-component.component.html',
})
export class DialogComponentComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  @Input() header = '';
  @Input() maxWidth = '420px';
  @Input() closeOnBackdrop = true;
  @Input() showFooter = true;

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onBackdropClick(): void {
    if (this.closeOnBackdrop) {
      this.close();
    }
  }
}