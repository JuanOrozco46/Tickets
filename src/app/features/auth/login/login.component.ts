import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: false,
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);

    errorMessage: string | null = null;
    loading = false;

    loginForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]]
    });

    onSubmit(): void {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        this.loading = true;
        this.errorMessage = null;

        const credentials = {
            email: this.loginForm.value.email!,
            password: this.loginForm.value.password!
        };

        this.authService.login(credentials).subscribe({
            next: (response) => {
                this.loading = false;
                if (response.user.role === 'admin') {
                    this.router.navigate(['/admin']);
                } else {
                    this.router.navigate(['/dashboard']);
                }
            },
            error: (err) => {
                this.loading = false;
                this.errorMessage = err.error?.error?.message || 'Credenciales inválidas o error de conexión.';
            }
        });
    }
}