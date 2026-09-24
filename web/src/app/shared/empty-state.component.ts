import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <div class="empty-state">
      @if (loading) {
        <div class="spinner lg"></div>
      }
      <h2>{{ title }}</h2>
      @if (message) {
        <p>{{ message }}</p>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  @Input({ required: true }) title = '';
  @Input() message?: string;
  @Input() loading = false;
}
