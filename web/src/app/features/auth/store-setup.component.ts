import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { StoreService } from '../../core/store.service';

@Component({
  selector: 'app-store-setup',
  imports: [FormsModule],
  template: `
    <div class="auth-shell">
      <div class="auth-card">
        <h1>Set Up Your Store</h1>
        <p class="subtitle">This info appears on your receipts</p>

        <label class="field">
          <span class="field-label">Store Name *</span>
          <input class="field-input" [(ngModel)]="name" placeholder="My Retail Store" />
        </label>
        <label class="field">
          <span class="field-label">Address</span>
          <textarea class="field-textarea" [(ngModel)]="address" placeholder="123 Main Street"></textarea>
        </label>
        <label class="field">
          <span class="field-label">Phone</span>
          <input class="field-input" type="tel" [(ngModel)]="phone" placeholder="+91 98765 43210" />
        </label>
        <label class="field">
          <span class="field-label">Tax Rate (%)</span>
          <input class="field-input" type="number" [(ngModel)]="taxRate" placeholder="18" />
        </label>

        @if (error) {
          <p class="form-error">{{ error }}</p>
        }

        <button class="btn" type="button" [disabled]="loading" (click)="submit()">
          @if (loading) {
            <span class="spinner"></span>
          }
          Continue
        </button>
      </div>
    </div>
  `,
})
export class StoreSetupComponent {
  private readonly stores = inject(StoreService);
  private readonly router = inject(Router);

  name = '';
  address = '';
  phone = '';
  taxRate = '0';
  loading = false;
  error: string | null = null;

  async submit(): Promise<void> {
    this.error = null;
    if (!this.name.trim()) {
      this.error = 'Store name is required.';
      return;
    }

    const tax = parseFloat(this.taxRate) || 0;
    if (tax < 0 || tax > 100) {
      this.error = 'Tax rate must be between 0 and 100.';
      return;
    }

    this.loading = true;
    try {
      const { error } = await this.stores.createStore({
        name: this.name.trim(),
        address: this.address.trim() || undefined,
        phone: this.phone.trim() || undefined,
        tax_rate: tax,
        currency: 'INR',
      });
      if (error) {
        this.error = error;
        return;
      }
      await this.router.navigateByUrl('/');
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Something went wrong. Please try again.';
    } finally {
      this.loading = false;
    }
  }
}
