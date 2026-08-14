import { Routes } from '@angular/router';

import { authGuard, configuredGuard, guestGuard, noStoreGuard, storeGuard } from './core/guards';
import { ShellComponent } from './layout/shell.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { SetupComponent } from './features/auth/setup.component';
import { StoreSetupComponent } from './features/auth/store-setup.component';
import { BillingComponent } from './features/billing/billing.component';
import { ReceiptComponent } from './features/billing/receipt.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { HistoryComponent } from './features/history/history.component';
import { ProductFormComponent } from './features/products/product-form.component';
import { ProductsComponent } from './features/products/products.component';
import { SettingsComponent } from './features/settings/settings.component';

export const routes: Routes = [
  { path: 'setup', component: SetupComponent },
  { path: 'login', component: LoginComponent, canActivate: [configuredGuard, guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [configuredGuard, guestGuard] },
  {
    path: 'store-setup',
    component: StoreSetupComponent,
    canActivate: [configuredGuard, authGuard, noStoreGuard],
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [configuredGuard, authGuard, storeGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'products/new', component: ProductFormComponent },
      { path: 'products/:id', component: ProductFormComponent },
      { path: 'billing', component: BillingComponent },
      { path: 'history', component: HistoryComponent },
      { path: 'bills/:id', component: ReceiptComponent },
      { path: 'settings', component: SettingsComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
