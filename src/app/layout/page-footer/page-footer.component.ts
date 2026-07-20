import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule, NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-page-footer',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './page-footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageFooterComponent {
  private router = inject(Router);

  items: NavItem[] = this.router.config
    .filter(route => route.data?.['icon'] && route.data?.['label'])
    .map(route => ({
      path: `/${route.path}`,
      icon: route.data!['icon'],
      label: route.data!['label'],
    }));

  active = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).urlAfterRedirects),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );
}