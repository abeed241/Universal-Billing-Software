import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-setup',
  imports: [RouterLink],
  template: `
    <div class="auth-shell">
      <div class="auth-card">
        <h1>Setup Required</h1>
        <p class="subtitle">Configure Supabase before using the app.</p>
        <div class="card" style="margin-bottom:24px">
          <p>1. Create a Supabase project at supabase.com</p>
          <p>2. Run the SQL migration from supabase/migrations/001_initial_schema.sql</p>
          <p>3. Copy web/src/environments/environment.example.ts values into environment.ts with your URL and anon key</p>
          <p>4. Restart the Angular dev server</p>
        </div>
        <a class="btn" routerLink="/login">Go to Login</a>
      </div>
    </div>
  `,
})
export class SetupComponent {}
