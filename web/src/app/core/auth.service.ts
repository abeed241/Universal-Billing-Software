import { computed, Injectable, signal } from '@angular/core';
import { Session, User } from '@supabase/supabase-js';

import { isSupabaseConfigured, supabase } from './supabase.client';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly session = signal<Session | null>(null);
  readonly user = computed<User | null>(() => this.session()?.user ?? null);
  readonly loading = signal(true);

  private readyResolve!: () => void;
  private readonly ready = new Promise<void>((resolve) => {
    this.readyResolve = resolve;
  });

  constructor() {
    void this.init();
  }

  ensureReady(): Promise<void> {
    return this.ready;
  }

  async signIn(email: string, password: string): Promise<{ error: string | null }> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (data.session) {
      this.session.set(data.session);
    }
    if (error?.message === 'Invalid login credentials') {
      return {
        error:
          'Invalid email or password. If you just registered, confirm your email first (check inbox/spam), or disable "Confirm email" in Supabase Auth settings for development.',
      };
    }
    return { error: error?.message ?? null };
  }

  async signUp(
    email: string,
    password: string
  ): Promise<{ error: string | null; needsEmailConfirmation?: boolean }> {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (data.session) {
      this.session.set(data.session);
    }
    if (error) {
      return { error: error.message };
    }

    if (data.session) {
      return { error: null, needsEmailConfirmation: false };
    }

    if (data.user && !data.session) {
      return { error: null, needsEmailConfirmation: true };
    }

    return { error: 'Registration failed. Please try again.' };
  }

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
    this.session.set(null);
  }

  private async init(): Promise<void> {
    if (!isSupabaseConfigured) {
      this.loading.set(false);
      this.readyResolve();
      return;
    }

    const { data } = await supabase.auth.getSession();
    this.session.set(data.session);
    this.loading.set(false);
    this.readyResolve();

    supabase.auth.onAuthStateChange((_event, nextSession) => {
      this.session.set(nextSession);
      this.loading.set(false);
    });
  }
}
