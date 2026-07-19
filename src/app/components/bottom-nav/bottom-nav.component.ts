import { Component, inject } from '@angular/core';

import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterModule],
  template: `
    <nav class="bnav">
      @for (item of items; track item.path) {
        <a class="bnav__item" [class.bnav__item--active]="active() === item.path"
           [routerLink]="item.path" [attr.aria-label]="item.label">
          <span class="bnav__pill">
            <i [class]="'pi ' + item.icon"></i>
          </span>
          <span class="bnav__label">{{ item.label }}</span>
        </a>
      }
    </nav>
  `,
  styles: [`
    .bnav {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      height: var(--nav-h);
      background: var(--ink-900);
      border-top: 1px solid var(--color-border-subtle);
      display: flex;
      padding-bottom: env(safe-area-inset-bottom);
      z-index: 200;
    }
    .bnav__item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      text-decoration: none;
      color: var(--color-text-muted);
      transition: color 150ms;
      -webkit-tap-highlight-color: transparent;
      cursor: pointer;

      &--active {
        color: var(--color-primary);
        .bnav__pill { background: var(--color-primary-dim); }
      }
      &:active .bnav__pill { transform: scale(0.88); }
    }
    .bnav__pill {
      width: 44px; height: 28px;
      border-radius: var(--r-full);
      display: flex; align-items: center; justify-content: center;
      transition: background 150ms, transform 200ms var(--ease-spring);
      i { font-size: 19px; }
    }
    .bnav__label {
      font-size: 10px;
      font-weight: 500;
      letter-spacing: .02em;
    }
  `]
})
export class BottomNavComponent {
  private router = inject(Router);

  items = [
    { path: '/',         icon: 'pi-home',        label: 'Inicio'     },
    { path: '/clean',    icon: 'pi-plus-circle',  label: 'Registrar'  },
    { path: '/history',  icon: 'pi-list',         label: 'Historial'  },
    { path: '/stats',    icon: 'pi-chart-bar',    label: 'Estadísticas'},
  ];

  active = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).urlAfterRedirects),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );
}
