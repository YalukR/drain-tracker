import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-header.component.html',
})
export class PageHeaderComponent {
  @Input() title = '';
  /**
   * Controla si se muestra la flecha de regreso.
   * - true: usa Location.back() (historial real del navegador)
   * - string: navega a esa ruta específica en vez de usar el historial
   * - false/undefined: no muestra el botón
   */
  @Input() backTo: string | boolean = false;
  @Input() centered = false;

  constructor(private router: Router, private location: Location) { }

  get showBack(): boolean {
    return !!this.backTo;
  }

  goBack(): void {
    if (typeof this.backTo === 'string') {
      this.router.navigateByUrl(this.backTo);
    } else {
      this.location.back();
    }
  }
}