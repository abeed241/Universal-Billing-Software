import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ProductsService } from '../../core/products.service';
import { StoreService } from '../../core/store.service';
import type { Product } from '../../core/models';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { ProductCardComponent } from '../../shared/product-card.component';

@Component({
  selector: 'app-products',
  imports: [FormsModule, RouterLink, EmptyStateComponent, ProductCardComponent],
  template: `
    <div class="toolbar">
      <label class="field">
        <input class="field-input" [(ngModel)]="search" placeholder="Search products..." />
      </label>
      <a class="btn" routerLink="/products/new">+ Add Product</a>
    </div>

    @if (filtered.length === 0) {
      <app-empty-state
        [title]="loading ? 'Loading products...' : 'No products yet'"
        [message]="loading ? undefined : 'Add your first product to start billing'"
        [loading]="loading"
      />
    } @else {
      <div class="product-grid">
        @for (product of filtered; track product.id) {
          <app-product-card
            [product]="product"
            [currency]="store.store()?.currency ?? 'INR'"
            [link]="['/products', product.id]"
          />
        }
      </div>
    }
  `,
})
export class ProductsComponent implements OnInit {
  readonly store = inject(StoreService);
  private readonly productsApi = inject(ProductsService);

  products: Product[] = [];
  search = '';
  loading = true;

  get filtered(): Product[] {
    const q = this.search.toLowerCase();
    return this.products.filter((p) => p.name.toLowerCase().includes(q));
  }

  async ngOnInit(): Promise<void> {
    const store = this.store.store();
    if (!store) return;
    this.loading = true;
    const { data, error } = await this.productsApi.listActive(store.id);
    if (error) {
      alert(error);
    } else {
      this.products = data;
    }
    this.loading = false;
  }
}
