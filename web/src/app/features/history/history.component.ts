import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BillsService } from '../../core/bills.service';
import { formatCurrency, formatDate, formatPaymentMethod } from '../../core/format';
import type { Bill } from '../../core/models';
import { StoreService } from '../../core/store.service';
import { EmptyStateComponent } from '../../shared/empty-state.component';

@Component({
  selector: 'app-history',
  imports: [RouterLink, EmptyStateComponent],
  template: `
    @if (loading) {
      <app-empty-state title="Loading sales..." [loading]="true" />
    } @else if (bills.length === 0) {
      <app-empty-state title="No sales yet" message="Create your first bill from the Bill tab" />
    } @else {
      @for (bill of bills; track bill.id) {
        <a class="history-card" [routerLink]="['/bills', bill.id]">
          <div class="history-row">
            <span class="invoice">{{ bill.invoice_number }}</span>
            <span class="amount">{{ money(bill.total) }}</span>
          </div>
          <div class="history-row">
            <span class="muted">{{ formatDate(bill.created_at) }}</span>
            <span class="muted">{{ formatPaymentMethod(bill.payment_method) }}</span>
          </div>
        </a>
      }
    }
  `,
})
export class HistoryComponent implements OnInit {
  readonly store = inject(StoreService);
  private readonly billsApi = inject(BillsService);

  bills: Bill[] = [];
  loading = true;
  formatDate = formatDate;
  formatPaymentMethod = formatPaymentMethod;

  money(value: number): string {
    return formatCurrency(value, this.store.store()?.currency ?? 'INR');
  }

  async ngOnInit(): Promise<void> {
    const store = this.store.store();
    if (!store) return;
    const { data, error } = await this.billsApi.listRecent(store.id);
    if (error) alert(error);
    else this.bills = data;
    this.loading = false;
  }
}
