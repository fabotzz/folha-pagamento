import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatDividerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  isDevelopment = true;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/employees']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    if (this.isDevelopment) {
      this.authService.devLoginAsAdmin().subscribe({
        next: (response) => {
          this.loading = false;
          this.snackBar.open(`Bem-vindo, ${response.fullName}!`, 'OK', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/employees']);
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open('Erro no login de desenvolvimento', 'OK', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      const credentials = this.loginForm.value;
      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.loading = false;
          this.snackBar.open(`Bem-vindo, ${response.fullName}!`, 'OK', {
            duration: 3000
          });
          this.router.navigate(['/employees']);
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open('Email ou senha inválidos', 'OK', {
            duration: 3000
          });
        }
      });
    }
  }

  quickLogin(role: 'Admin' | 'RH' | 'Employee'): void {
    this.loading = true;
    this.authService.devLoginAs(role).subscribe({
      next: (response) => {
        this.loading = false;
        this.snackBar.open(`Login rápido como ${response.role}!`, 'OK', {
          duration: 3000
        });
        this.router.navigate(['/employees']);
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Erro no login rápido', 'OK', {
          duration: 3000
        });
      }
    });
  }
}