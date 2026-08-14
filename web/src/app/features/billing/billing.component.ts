import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  calculateDiscountAmount,
  calculateLineTotal,
  calculateSubtotal,
  calculateTaxAmount,
  calculateTotal,
} from '../../core/billing';
import { BillsService } from '../../core/bills.service';
import { formatCurrency } from '../../core/format';
import type { CartItem, PaymentMethod, Product } from '../../core/models';
import { ProductsService } from '../../core/products.service';
import { StoreService } from '../../core/store.service';
import { CartItemRowComponent } from '../../shared/cart-item-row.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { ProductCardComponent } from '../../shared/product-card.component';

@Component({
  selector: 'app-billing',
  imports: [NgTemplateOutlet, FormsModule, CartItemRowComponent, EmptyStateComponent, ProductCardComponent],
  template: `
    @if (mobileCartOpen) {
      <button class="back-link" type="button" (click)="mobileCartOpen = false">← Add more products</button>
      <ng-container *ngTemplateOutlet="cartPanel" />
    } @else {
      <div class="billing-layout">
        <div class="billing-products">
          <h1 style="margin-top:0">New Bill</h1>
          <label class="field">
            <input class="field-input" [(ngModel)]="search" placeholder="Search products..." />
          </label>

          @if (filtered.length === 0) {
            <app-empty-state
              [title]="loadingProducts ? 'Loading products...' : 'No products found'"
              [message]="loadingProducts ? undefined : 'Add products from the Products tab before billing'"
              [loading]="loadingProducts"
            />
          } @else {
            <div class="bill-product-grid">
              @for (product of filtered; track product.id) {
                <app-product-card
                  [product]="product"
                  [currency]="currency"
                  [pressed]="addToCartFn(product)"
                />
              }
            </div>
          }
        </div>

        <div class="desktop-cart">
          <ng-container *ngTemplateOutlet="cartPanel" />
        </div>
      </div>

      @if (cart.length > 0) {
        <div class="cart-bar">
          <div>
            <div class="muted">{{ cart.length }} item(s)</div>
            <div style="font-size:18px;font-weight:800">{{ totalLabel }}</div>
          </div>
          <button class="btn" type="button" (click)="mobileCartOpen = true">View Cart</button>
        </div>
      }
    }

    <ng-template #cartPanel>
      <div class="cart-panel">
        <h2 style="margin-top:0">Cart ({{ cart.length }})</h2>
        @if (cart.length === 0) {
          <p class="muted" style="text-align:center">Tap products to add them here</p>
        } @else {
          @for (item of cart; track item.product.id) {
            <app-cart-item-row
              [item]="item"
              [currency]="currency"
              (increase)="updateQty(item.product.id, 1)"
              (decrease)="updateQty(item.product.id, -1)"
              (remove)="removeFromCart(item.product.id)"
            />
          }
        }

        <h3>Discount</h3>
        <div class="chip-row">
          <button class="btn btn-chip" [class.btn-outline]="discountType !== 'flat'" type="button" (click)="discountType = 'flat'">Flat</button>
          <button class="btn btn-chip" [class.btn-outline]="discountType !== 'percent'" type="button" (click)="discountType = 'percent'">%</button>
        </div>
        <label class="field">
          <span class="field-label">{{ discountType === 'percent' ? 'Discount (%)' : 'Discount amount' }}</span>
          <input class="field-input" type="number" [(ngModel)]="discount" placeholder="0" />
        </label>

        <h3>Payment</h3>
        <div class="chip-row">
          @for (method of methods; track method) {
            <button
              class="btn btn-chip"
              [class.btn-outline]="paymentMethod !== method"
              type="button"
              (click)="paymentMethod = method"
            >
              {{ method.toUpperCase() }}
            </button>
          }
        </div>

        <div class="totals">
          <div class="total-row"><span class="muted">Subtotal</span><span>{{ money(subtotal) }}</span></div>
          @if (discountAmount > 0) {
            <div class="total-row"><span class="muted">Discount</span><span>−{{ money(discountAmount) }}</span></div>
          }
          @if ((store.store()?.tax_rate ?? 0) > 0) {
            <div class="total-row"><span class="muted">Tax ({{ store.store()?.tax_rate }}%)</span><span>{{ money(taxAmount) }}</span></div>
          }
          <div class="total-row grand"><span>Total</span><span class="amount">{{ money(total) }}</span></div>
        </div>

        <button class="btn" type="button" [disabled]="submitting || cart.length === 0" (click)="checkout()">
          @if (submitting) {
            <span class="spinner"></span>
          }
          Generate Bill
        </button>
      </div>
    </ng-template>
  `,
  styles: [
    `
      .desktop-cart {
        display: none;
      }
      @media (min-width: 900px) {
        .desktop-cart {
          display: block;
          flex: 1;
          max-width: 400px;
          min-width: 320px;
        }
        .cart-bar {
          display: none;
        }
      }
    `,
  ],
})
export class BillingComponent implements OnInit {
  readonly store = inject(StoreService);
  private readonly productsApi = inject(ProductsService);
  private readonly billsApi = inject(BillsService);
  private readonly router = inject(Router);

  readonly methods: PaymentMethod[] = ['cash', 'upi', 'card'];
  products: Product[] = [];
  cart: CartItem[] = [];
  search = '';
  discount = '';
  discountType: 'flat' | 'percent' = 'flat';
  paymentMethod: PaymentMethod = 'cash';
  loadingProducts = true;
  submitting = false;
  mobileCartOpen = false;

  get currency(): string {
    return this.store.store()?.currency ?? 'INR';
  }

  get filtered(): Product[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.products;
    return this.products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.sku?.toLowerCase().includes(q) ?? false) ||
        (p.barcode?.toLowerCase().includes(q) ?? false)
    );
  }

  get subtotal(): number {
    return calculateSubtotal(this.cart);
  }

  get discountAmount(): number {
    return calculateDiscountAmount(this.subtotal, parseFloat(this.discount) || 0, this.discountType);
  }

  get taxAmount(): number {
    return calculateTaxAmount(this.subtotal, this.discountAmount, this.store.store()?.tax_rate ?? 0);
  }

  get total(): number {
    return calculateTotal(this.subtotal, this.discountAmount, this.taxAmount);
  }

  get totalLabel(): string {
    return formatCurrency(this.total, this.currency);
  }

  money(value: number): string {
    return formatCurrency(value, this.currency);
  }

  addToCartFn(product: Product): () => void {
    return () => this.addToCart(product);
  }

  async ngOnInit(): Promise<void> {
    const store = this.store.store();
    if (!store) return;
    this.loadingProducts = true;
    const { data, error } = await this.productsApi.listActive(store.id);
    if (error) alert(error);
    else this.products = data;
    this.loadingProducts = false;
  }

  addToCart(product: Product): void {
    const existing = this.cart.find((item) => item.product.id === product.id);
    if (existing) {
      this.cart = this.cart.map((item) =>
        item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      this.cart = [...this.cart, { product, quantity: 1 }];
    }
  }

  updateQty(productId: string, delta: number): void {
    this.cart = this.cart
      .map((item) => (item.product.id === productId ? { ...item, quantity: item.quantity + delta } : item))
      .filter((item) => item.quantity > 0);
  }

  removeFromCart(productId: string): void {
    this.cart = this.cart.filter((item) => item.product.id !== productId);
  }

  async checkout(): Promise<void> {
    const store = this.store.store();
    if (!store) return;
    if (this.cart.length === 0) {
      alert('Add at least one product to create a bill');
      return;
    }

    this.submitting = true;
    const items = this.cart.map((item) => ({
      product_id: item.product.id,
      product_name: item.product.name,
      quantity: item.quantity,
      unit_price: item.product.price,
      line_total: calculateLineTotal(item.quantity, item.product.price),
    }));

    const { id, error } = await this.billsApi.create({
      storeId: store.id,
      subtotal: this.subtotal,
      taxAmount: this.taxAmount,
      discount: this.discountAmount,
      total: this.total,
      paymentMethod: this.paymentMethod,
      items,
    });
    this.submitting = false;

    if (error || !id) {
      alert(error ?? 'Billing failed');
      return;
    }

    this.cart = [];
    this.discount = '';
    this.mobileCartOpen = false;
    await this.router.navigate(['/bills', id]);
  }
}
