import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';
import { StoreService } from './store.service';
import { isSupabaseConfigured } from './supabase.client';

export const configuredGuard: CanActivateFn = async () => {
  const router = inject(Router);
  if (!isSupabaseConfigured) {
    return router.createUrlTree(['/setup']);
  }
  return true;
};

export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const store = inject(StoreService);
  const router = inject(Router);

  await auth.ensureReady();
  if (!auth.session()) {
    return true;
  }

  await store.ensureReady();
  return store.store()
    ? router.createUrlTree(['/dashboard'])
    : router.createUrlTree(['/store-setup']);
};

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.ensureReady();
  if (!auth.session()) {
    return router.createUrlTree(['/login']);
  }
  return true;
};

export const storeGuard: CanActivateFn = async () => {
  const store = inject(StoreService);
  const router = inject(Router);

  await store.ensureReady();
  if (!store.store()) {
    return router.createUrlTree(['/store-setup']);
  }
  return true;
};

export const noStoreGuard: CanActivateFn = async () => {
  const store = inject(StoreService);
  const router = inject(Router);

  await store.ensureReady();
  if (store.store()) {
    return router.createUrlTree(['/dashboard']);
  }
  return true;
};
