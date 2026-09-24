import { Component, inject, Input, OnInit } from '@angular/core';

import { BillsService } from '../../core/bills.service';
import { formatCurrency, formatDate, formatPaymentMethod } from '../../core/format';
import type { BillWithItems } from '../../core/models';
import { buildReceiptHtml, downloadHtml, printHtml } from '../../core/receipt';
import { StoreService } from '../../core/store.service';
import { EmptyStateComponent } from '../../shared/empty-state.component';

@Component({
  selector: 'app-receipt',
  imports: [EmptyStateComponent],
  template: `
    @if (loading) {
      <app-empty-state title="Loading receipt..." [loading]="true" />
    } @else if (!bill || !store.store()) {
      <app-empty-state title="Receipt not found" message="This bill may have been deleted" />
    } @else {
      <div class="receipt-header">
        <h1 style="margin:0">{{ store.store()?.name }}</h1>
        @if (store.store()?.address) {
          <div class="muted">{{ store.store()?.address }}</div>
        }
        @if (store.store()?.phone) {
          <div class="muted">{{ store.store()?.phone }}</div>
        }
      </div>

      <div class="card" style="margin-bottom:24px">
        <div class="amount" style="font-size:18px">{{ bill.invoice_number }}</div>
        <div class="muted">{{ formatDate(bill.created_at) }}</div>
        <div class="muted">Payment: {{ formatPaymentMethod(bill.payment_method) }}</div>
      </div>

      <h3>Items</h3>
      @for (item of bill.bill_items; track item.id) {
        <div class="history-card">
          <div class="history-row">
            <div>
              <div class="invoice">{{ item.product_name }}</div>
              <div class="muted">{{ item.quantity }} × {{ money(item.unit_price) }}</div>
            </div>
            <strong>{{ money(item.line_total) }}</strong>
          </div>
        </div>
      }

      <div class="totals">
        <div class="total-row"><span class="muted">Subtotal</span><span>{{ money(bill.subtotal) }}</span></div>
        @if (bill.discount > 0) {
          <div class="total-row"><span class="muted">Discount</span><span>−{{ money(bill.discount) }}</span></div>
        }
        @if (bill.tax_amount > 0) {
          <div class="total-row">
            <span class="muted">Tax ({{ store.store()?.tax_rate }}%)</span>
            <span>{{ money(bill.tax_amount) }}</span>
          </div>
        }
        <div class="total-row grand"><span>Total</span><span class="amount">{{ money(bill.total) }}</span></div>
      </div>

      <button class="btn" type="button" [disabled]="actionLoading === 'share'" (click)="share()">
        @if (actionLoading === 'share') {
          <span class="spinner"></span>
        }
        Download Receipt
      </button>
      <button class="btn btn-outline" style="margin-top:8px;width:100%" type="button" [disabled]="actionLoading === 'print'" (click)="print()">
        @if (actionLoading === 'print') {
          <span class="spinner"></span>
        }
        Print Receipt
      </button>
    }
  `,
})
export class ReceiptComponent implements OnInit {
  @Input() id?: string;

  readonly store = inject(StoreService);
  private readonly billsApi = inject(BillsService);

  bill: BillWithItems | null = null;
  loading = true;
  actionLoading: 'print' | 'share' | null = null;
  formatDate = formatDate;
  formatPaymentMethod = formatPaymentMethod;

  money(value: number): string {
    return formatCurrency(value, this.store.store()?.currency ?? 'INR');
  }

  async ngOnInit(): Promise<void> {
    if (!this.id) return;
    this.bill = await this.billsApi.getWithItems(this.id);
    this.loading = false;
  }

  share(): void {
    const bill = this.bill;
    const store = this.store.store();
    if (!bill || !store) return;
    try {
      this.actionLoading = 'share';
      downloadHtml(buildReceiptHtml(bill, store), `receipt-${bill.invoice_number}.html`);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Could not download receipt');
    } finally {
      this.actionLoading = null;
    }
  }

  print(): void {
    const bill = this.bill;
    const store = this.store.store();
    if (!bill || !store) return;
    try {
      this.actionLoading = 'print';
      printHtml(buildReceiptHtml(bill, store));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Could not print receipt');
    } finally {
      this.actionLoading = null;
    }
  }
}
