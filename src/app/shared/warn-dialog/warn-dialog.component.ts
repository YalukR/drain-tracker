import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogComponentComponent } from '../dialog-component/dialog-component.component';

@Component({
  selector: 'app-warning-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, DialogComponentComponent],
  templateUrl: './warn-dialog.component.html',
})
export class WarningDialogComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  @Input() header = 'Confirmar acción';
  @Input() message = '¿Estás seguro de que quieres continuar? Esta acción no se puede deshacer.';
  @Input() confirmWord = 'confirmar';
  @Input() acceptLabel = 'Eliminar';
  @Input() rejectLabel = 'Cancelar';
  @Input() maxWidth = '380px';
  @Input() loading = false;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  confirmationText = '';

  get isValid(): boolean {
    return this.confirmationText.trim().toLowerCase() === this.confirmWord.toLowerCase();
  }

  onVisibleChange(value: boolean): void {
    this.visible = value;
    this.visibleChange.emit(value);
    if (!value) this.reset();
  }

  onAccept(): void {
    if (!this.isValid || this.loading) return;
    this.confirmed.emit();
    this.reset();
    // No cerramos aquí: el padre decide cuándo cerrar (ej. tras un await exitoso).
  }

  onCancel(): void {
    this.cancelled.emit();
    this.close();
    this.reset();
  }

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.reset();
  }

  private reset(): void {
    this.confirmationText = '';
  }
}