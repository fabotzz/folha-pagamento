import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule, MatDivider } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDivider
],
  template: `
    <mat-toolbar color="primary" class="header-toolbar">
      <div class="header-container">
        <div class="logo-section">
          <button mat-icon-button routerLink="/dashboard">
            <mat-icon>payments</mat-icon>
          </button>
          <span class="app-title" routerLink="/dashboard">FolhaPag</span>
        </div>

        <div class="nav-section" *ngIf="authService.isLoggedIn()">
          <button mat-button routerLink="/employees" routerLinkActive="active">
            <mat-icon>people</mat-icon>
            <span>Funcionários</span>
          </button>
          <button mat-button routerLink="/payrolls" routerLinkActive="active">
            <mat-icon>receipt</mat-icon>
            <span>Folhas</span>
          </button>
        </div>

        <div class="user-section" *ngIf="authService.isLoggedIn()">
          <button mat-icon-button [matMenuTriggerFor]="menu">
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #menu="matMenu">
            <div class="user-info">
              <div class="user-name">{{ (authService.getUser()).name }}</div>
              <div class="user-role">{{ (authService.getUser()).role }}</div>
            </div>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <mat-icon>exit_to_app</mat-icon>
              <span>Sair</span>
            </button>
          </mat-menu>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .header-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;

      .app-title {
        font-size: 1.25rem;
        font-weight: 500;
        letter-spacing: 0.5px;
      }
    }

    .nav-section {
      display: flex;
      gap: 8px;
      flex: 1;
      margin-left: 32px;

      button {
        mat-icon {
          margin-right: 4px;
        }

        &.active {
          background-color: rgba(255,255,255,0.15);
        }
      }
    }

    .user-section {
      .user-info {
        padding: 12px 16px;
        
        .user-name {
          font-weight: 500;
          color: var(--text-primary);
        }
        
        .user-role {
          font-size: 12px;
          color: var(--text-secondary);
          text-transform: uppercase;
        }
      }
    }

    @media (max-width: 768px) {
      .nav-section span {
        display: none;
      }
      
      .nav-section button {
        min-width: 48px;
        padding: 0 8px;
      }
    }
  `]
})
export class HeaderComponent {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.clear();
    this.router.navigate(['/login']);
  }
}