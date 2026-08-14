import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BillsService } from '../../core/bills.service';
import { formatCurrency } from '../../core/format';
import { StoreService } from '../../core/store.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  template: `
    <div class="page-header">
      <div>
        <div class="muted">Welcome back</div>
        <h1 style="margin:0;font-size:32px">{{ store.store()?.name ?? 'Your Store' }}</h1>
      </div>
      <a class="btn" routerLink="/billing" style="display:none" id="desktop-new-bill">+ New Bill</a>
    </div>

    <div class="stats-row" style="margin-top:24px">
      <div class="stat-card">
        <div class="stat-label">Today's Sales</div>
        <div class="stat-value">{{ salesLabel }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Bills Today</div>
        <div class="stat-value">{{ todayBills }}</div>
      </div>
    </div>

    <h2>Quick Actions</h2>
    <div class="actions-row">
      <a class="btn" routerLink="/billing">New Bill</a>
      <a class="btn btn-outline" routerLink="/products/new">Add Product</a>
      <a class="btn btn-outline" routerLink="/history">View Sales History</a>
    </div>
  `,
  styles: [
    `
      @media (min-width: 900px) {
        #desktop-new-bill {
          display: inline-flex !important;
        }
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  readonly store = inject(StoreService);
  private readonly bills = inject(BillsService);

  todaySales = 0;
  todayBills = 0;

  get salesLabel(): string {
    return formatCurrency(this.todaySales, this.store.store()?.currency ?? 'INR');
  }

  async ngOnInit(): Promise<void> {
    const store = this.store.store();
    if (!store) return;
    const stats = await this.bills.todayStats(store.id);
    if (stats.error) {
      console.error(stats.error);
      return;
    }
    this.todaySales = stats.sales;
    this.todayBills = stats.count;
  }
}
