import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  authService = inject(AuthService);
  currentUser$ = this.authService.currentUser$;

  logout(): void {
    this.authService.logout();
  }
}
