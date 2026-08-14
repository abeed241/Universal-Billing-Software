import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { formatCurrency } from '../core/format';
import type { Product } from '../core/models';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink],
  template: `
    @if (link) {
      <a class="product-card" [routerLink]="link">
        <div>
          <div class="name">{{ product.name }}</div>
          @if (product.category) {
            <div class="muted">{{ product.category }}</div>
          }
          <div class="price">{{ money }}</div>
        </div>
        @if (product.unit) {
          <div class="unit">/{{ product.unit }}</div>
        }
      </a>
    } @else {
      <button class="product-card" type="button" (click)="pressed?.()">
        <div>
          <div class="name">{{ product.name }}</div>
          @if (product.category) {
            <div class="muted">{{ product.category }}</div>
          }
          <div class="price">{{ money }}</div>
        </div>
        @if (product.unit) {
          <div class="unit">/{{ product.unit }}</div>
        }
      </button>
    }
  `,
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Input() currency = 'INR';
  @Input() link: string[] | null = null;
  @Input() pressed?: () => void;

  get money(): string {
    return formatCurrency(this.product.price, this.currency);
  }
}
