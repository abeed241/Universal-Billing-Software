import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { isSupabaseConfigured } from '../../core/supabase.client';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-shell">
      <div class="auth-card">
        @if (!configured) {
          <h1>Setup Required</h1>
          <p class="subtitle">Add your Supabase credentials to web/src/environments/environment.ts before signing in.</p>
          <a class="btn" routerLink="/setup">View Setup Instructions</a>
        } @else {
          <h1>Sign In</h1>
          <p class="subtitle">Sign in to manage your store</p>

          <label class="field">
            <span class="field-label">Email</span>
            <input class="field-input" type="email" [(ngModel)]="email" autocomplete="email" placeholder="you@store.com" />
          </label>
          <label class="field">
            <span class="field-label">Password</span>
            <input class="field-input" type="password" [(ngModel)]="password" autocomplete="current-password" placeholder="Your password" />
          </label>

          @if (error) {
            <p class="form-error">{{ error }}</p>
          }

          <button class="btn" type="button" [disabled]="loading" (click)="submit()">
            @if (loading) {
              <span class="spinner"></span>
            }
            Sign In
          </button>
          <a class="btn btn-outline" style="margin-top:16px;width:100%" routerLink="/register">Create Account</a>
        }
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly configured = isSupabaseConfigured;
  email = '';
  password = '';
  loading = false;
  error: string | null = null;

  async submit(): Promise<void> {
    this.error = null;
    if (!this.email.trim() || !this.password) {
      this.error = 'Please enter email and password.';
      return;
    }

    this.loading = true;
    try {
      const { error } = await this.auth.signIn(this.email.trim(), this.password);
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
