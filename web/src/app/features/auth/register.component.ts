import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { isSupabaseConfigured } from '../../core/supabase.client';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-shell">
      <div class="auth-card">
        <h1>Create Account</h1>
        <p class="subtitle">Start billing for your store</p>

        <label class="field">
          <span class="field-label">Email</span>
          <input class="field-input" type="email" [(ngModel)]="email" autocomplete="email" placeholder="you@store.com" />
        </label>
        <label class="field">
          <span class="field-label">Password</span>
          <input class="field-input" type="password" [(ngModel)]="password" placeholder="At least 6 characters" />
        </label>
        <label class="field">
          <span class="field-label">Confirm Password</span>
          <input class="field-input" type="password" [(ngModel)]="confirmPassword" placeholder="Repeat password" />
        </label>

        @if (error) {
          <p class="form-error">{{ error }}</p>
        }

        <button class="btn" type="button" [disabled]="loading" (click)="submit()">
          @if (loading) {
            <span class="spinner"></span>
          }
          Create Account
        </button>
        <a class="btn btn-outline" style="margin-top:16px;width:100%" routerLink="/login">Back to Sign In</a>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  confirmPassword = '';
  loading = false;
  error: string | null = null;

  async submit(): Promise<void> {
    this.error = null;

    if (!isSupabaseConfigured) {
      this.error = 'Supabase is not configured. Check web/src/environments/environment.ts and restart the app.';
      return;
    }
    if (!this.email.trim() || !this.password || !this.confirmPassword) {
      this.error = 'Please fill in all fields.';
      return;
    }
    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.loading = true;
    try {
      const result = await this.auth.signUp(this.email.trim(), this.password);
      if (result.error) {
        this.error = result.error;
        return;
      }
      if (result.needsEmailConfirmation) {
        alert('We sent a confirmation link to your email. Click it, then come back and sign in.');
        await this.router.navigateByUrl('/login');
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
