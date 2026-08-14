import { Component, EventEmitter, Input, Output } from '@angular/core';

import { formatCurrency } from '../core/format';
import type { CartItem } from '../core/models';

@Component({
  selector: 'app-cart-item-row',
  template: `
    <div class="cart-item">
      <div>
        <div class="name" style="font-weight:600">{{ item.product.name }}</div>
        <div class="muted">{{ unitPrice }} × {{ item.quantity }}</div>
      </div>
      <div class="cart-item-actions">
        <div class="qty-controls">
          <button class="qty-btn" type="button" (click)="decrease.emit()">−</button>
          <strong>{{ item.quantity }}</strong>
          <button class="qty-btn" type="button" (click)="increase.emit()">+</button>
        </div>
        <strong class="amount">{{ lineTotal }}</strong>
        <button class="link-danger" type="button" (click)="remove.emit()">Remove</button>
      </div>
    </div>
  `,
})
export class CartItemRowComponent {
  @Input({ required: true }) item!: CartItem;
  @Input() currency = 'INR';
  @Output() increase = new EventEmitter<void>();
  @Output() decrease = new EventEmitter<void>();
  @Output() remove = new EventEmitter<void>();

  get unitPrice(): string {
    return formatCurrency(this.item.product.price, this.currency);
  }

  get lineTotal(): string {
    return formatCurrency(this.item.quantity * this.item.product.price, this.currency);
  }
}
