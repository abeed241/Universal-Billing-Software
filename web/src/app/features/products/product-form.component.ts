import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import type { Product } from '../../core/models';
import { ProductsService } from '../../core/products.service';
import { StoreService } from '../../core/store.service';

const UNITS = ['pcs', 'kg', 'ltr', 'box', 'pack'];

@Component({
  selector: 'app-product-form',
  imports: [FormsModule],
  template: `
    @if (!initialLoading) {
      <div class="form-narrow card">
        <label class="field">
          <span class="field-label">Product Name *</span>
          <input class="field-input" [(ngModel)]="name" placeholder="Item name" />
        </label>
        <label class="field">
          <span class="field-label">Price *</span>
          <input class="field-input" type="number" [(ngModel)]="price" placeholder="0.00" />
        </label>
        <label class="field">
          <span class="field-label">Category</span>
          <input class="field-input" [(ngModel)]="category" placeholder="Groceries, Electronics..." />
        </label>
        <label class="field">
          <span class="field-label">SKU</span>
          <input class="field-input" [(ngModel)]="sku" placeholder="SKU-001" />
        </label>
        <label class="field">
          <span class="field-label">Barcode</span>
          <input class="field-input" [(ngModel)]="barcode" placeholder="Optional" />
        </label>

        <div class="field-label">Unit</div>
        <div class="unit-row">
          @for (u of units; track u) {
            <button
              class="btn btn-chip"
              [class.btn-outline]="unit !== u"
              type="button"
              (click)="unit = u"
            >
              {{ u }}
            </button>
          }
        </div>

        <label class="field">
          <span class="field-label">Stock (optional)</span>
          <input class="field-input" type="number" [(ngModel)]="stock" placeholder="Leave empty if not tracked" />
        </label>

        <button class="btn" type="button" [disabled]="loading" (click)="save()">
          @if (loading) {
            <span class="spinner"></span>
          }
          {{ isEdit ? 'Save Changes' : 'Add Product' }}
        </button>

        @if (isEdit) {
          <button class="btn btn-danger" style="margin-top:16px;width:100%" type="button" (click)="remove()">
            Delete Product
          </button>
        }
      </div>
    }
  `,
})
export class ProductFormComponent implements OnInit {
  @Input() id?: string;

  private readonly productsApi = inject(ProductsService);
  private readonly stores = inject(StoreService);
  private readonly router = inject(Router);

  readonly units = UNITS;
  name = '';
  price = '';
  category = '';
  sku = '';
  barcode = '';
  unit = 'pcs';
  stock = '';
  loading = false;
  initialLoading = false;

  get isEdit(): boolean {
    return Boolean(this.id);
  }

  async ngOnInit(): Promise<void> {
    if (!this.id) return;
    this.initialLoading = true;
    const { data, error } = await this.productsApi.getById(this.id);
    if (error || !data) {
      alert(error ?? 'Product not found');
      this.router.navigateByUrl('/products');
      return;
    }
    this.applyProduct(data);
    this.initialLoading = false;
  }

  async save(): Promise<void> {
    const store = this.stores.store();
    if (!store) return;
    if (!this.name.trim()) {
      alert('Product name is required');
      return;
    }
    const priceNum = parseFloat(this.price);
    if (isNaN(priceNum) || priceNum < 0) {
      alert('Enter a valid price');
      return;
    }

    const payload = {
      store_id: store.id,
      name: this.name.trim(),
      price: priceNum,
      category: this.category.trim() || null,
      sku: this.sku.trim() || null,
      barcode: this.barcode.trim() || null,
      unit: this.unit,
      stock: this.stock ? parseFloat(this.stock) : null,
      updated_at: new Date().toISOString(),
    };

    this.loading = true;
    const result = this.isEdit && this.id
      ? await this.productsApi.update(this.id, payload)
      : await this.productsApi.create(payload);
    this.loading = false;

    if (result.error) {
      alert(result.error);
      return;
    }
    await this.router.navigateByUrl('/products');
  }

  async remove(): Promise<void> {
    if (!this.id) return;
    if (!confirm('Are you sure you want to delete this product?')) return;
    const { error } = await this.productsApi.delete(this.id);
    if (error) {
      alert(error);
      return;
    }
    await this.router.navigateByUrl('/products');
  }

  private applyProduct(product: Product): void {
    this.name = product.name;
    this.price = String(product.price);
    this.category = product.category ?? '';
    this.sku = product.sku ?? '';
    this.barcode = product.barcode ?? '';
    this.unit = product.unit;
    this.stock = product.stock != null ? String(product.stock) : '';
  }
}
