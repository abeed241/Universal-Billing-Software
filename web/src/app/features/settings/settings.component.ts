import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { StoreService } from '../../core/store.service';

@Component({
  selector: 'app-settings',
  imports: [FormsModule],
  template: `
    <div class="form-narrow card">
      <h3>Account</h3>
      <p class="muted">{{ auth.user()?.email ?? '—' }}</p>

      <h3>Store details</h3>
      <label class="field">
        <span class="field-label">Store Name *</span>
        <input class="field-input" [(ngModel)]="name" />
      </label>
      <label class="field">
        <span class="field-label">Address</span>
        <textarea class="field-textarea" [(ngModel)]="address" placeholder="Store address"></textarea>
      </label>
      <label class="field">
        <span class="field-label">Phone</span>
        <input class="field-input" type="tel" [(ngModel)]="phone" />
      </label>
      <label class="field">
        <span class="field-label">Tax Rate (%)</span>
        <input class="field-input" type="number" [(ngModel)]="taxRate" />
      </label>
      <p class="muted">Currency: {{ store.store()?.currency ?? 'INR' }} · Shown on receipts</p>

      <button class="btn" type="button" [disabled]="saving" (click)="save()">
        @if (saving) {
          <span class="spinner"></span>
        }
        Save Settings
      </button>
      <button class="btn btn-danger" style="margin-top:24px;width:100%" type="button" (click)="signOut()">
        Sign Out
      </button>
    </div>
  `,
})
export class SettingsComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly store = inject(StoreService);
  private readonly router = inject(Router);

  name = '';
  address = '';
  phone = '';
  taxRate = '0';
  saving = false;

  ngOnInit(): void {
    const store = this.store.store();
    if (!store) return;
    this.name = store.name;
    this.address = store.address ?? '';
    this.phone = store.phone ?? '';
    this.taxRate = String(store.tax_rate);
  }

  async save(): Promise<void> {
    if (!this.name.trim()) {
      alert('Store name is required');
      return;
    }
    const tax = parseFloat(this.taxRate);
    if (isNaN(tax) || tax < 0 || tax > 100) {
      alert('Tax rate must be between 0 and 100');
      return;
    }

    this.saving = true;
    const { error } = await this.store.updateStore({
      name: this.name.trim(),
      address: this.address.trim() || null,
      phone: this.phone.trim() || null,
      tax_rate: tax,
    });
    this.saving = false;

    if (error) {
      alert(error);
      return;
    }
    alert('Store settings updated');
  }

  async signOut(): Promise<void> {
    if (!confirm('Are you sure you want to sign out?')) return;
    await this.auth.signOut();
    await this.router.navigateByUrl('/login');
  }
}
