import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/auth.model';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const expectedRoles = route.data?.['roles'] as UserRole[] | undefined;
  const currentRole = authService.getUserRole();

  if (currentRole && expectedRoles && expectedRoles.includes(currentRole)) {
    return true;
  }

  // Redirigir al dashboard si no tiene el rol permitido
  router.navigate(['/dashboard']);
  return false;
};
