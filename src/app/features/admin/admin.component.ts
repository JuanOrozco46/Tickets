import { Component, OnInit, inject } from '@angular/core';
import { UsersService } from '../../core/services/users.service';
import { User, UserRole } from '../../core/models/auth.model';

@Component({
  selector: 'app-admin',
  standalone: false,
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  private usersService = inject(UsersService);

  users: User[] = [];
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = null;

    this.usersService.getUsers().subscribe({
      next: (data: any) => {
        this.loading = false;
        const list = Array.isArray(data) ? data : data?.data || [];
        this.users = Array.isArray(list) ? list : [];
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Error al cargar la lista de usuarios.';
      }
    });
  }

  onRoleChange(user: User, newRole: string): void {
    this.usersService.updateUserRole(user.id, newRole as UserRole).subscribe({
      next: (updatedUser: any) => {
        const userObj = updatedUser?.data || updatedUser;
        user.role = userObj.role || (newRole as UserRole);
        this.showSuccess(`Rol de ${user.email} actualizado a ${newRole.toUpperCase()}.`);
      },
      error: (err) => {
        alert(err.error?.message || 'Error al actualizar el rol del usuario.');
        this.loadUsers();
      }
    });
  }

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => {
      this.successMessage = null;
    }, 3000);
  }
}
