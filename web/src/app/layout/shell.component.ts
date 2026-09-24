import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { StoreService } from '../core/store.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <header class="app-topbar">
        <div class="app-topbar-inner">
          <div>
            <div class="brand-title">Universal Billing</div>
            @if (store.store()?.name) {
              <div class="brand-store">{{ store.store()?.name }}</div>
            }
          </div>
          <nav class="nav-tabs">
            @for (tab of tabs; track tab.path) {
              <a class="nav-tab" [routerLink]="tab.path" routerLinkActive="active">{{ tab.label }}</a>
            }
          </nav>
        </div>
      </header>

      <main class="app-main">
        <router-outlet />
      </main>

      <nav class="app-bottombar">
        @for (tab of tabs; track tab.path) {
          <a class="nav-tab" [routerLink]="tab.path" routerLinkActive="active">{{ tab.label }}</a>
        }
      </nav>
    </div>
  `,
})
export class ShellComponent {
  readonly store = inject(StoreService);

  readonly tabs = [
    { path: '/dashboard', label: 'Home' },
    { path: '/products', label: 'Products' },
    { path: '/billing', label: 'Bill' },
    { path: '/history', label: 'History' },
    { path: '/settings', label: 'Settings' },
  ];
}
