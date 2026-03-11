import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Angular Material
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee.model';
import { EmployeeFormComponent } from '../employee-form/employee-form.component';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="employees-container fade-in">
      <!-- Header -->
      <div class="page-header">
        <div class="header-title">
          <h1>Funcionários</h1>
          <p>Gerencie os funcionários da empresa</p>
        </div>
        
        <button mat-raised-button color="primary" (click)="openEmployeeForm()">
          <mat-icon>add</mat-icon>
          Novo Funcionário
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
  <mat-card class="stat-card">
    <mat-card-content>
      <div class="stat-icon">
        <mat-icon color="primary">people</mat-icon>
      </div>
      <div class="stat-info">
        <span class="stat-value">{{ employees.length }}</span>
        <span class="stat-label">Total</span>
      </div>
    </mat-card-content>
  </mat-card>

  <mat-card class="stat-card">
    <mat-card-content>
      <div class="stat-icon">
        <mat-icon color="accent">person_add</mat-icon>
      </div>
      <div class="stat-info">
        <span class="stat-value">{{ activeEmployees }}</span>
        <span class="stat-label">Ativos</span>
      </div>
    </mat-card-content>
  </mat-card>

  <mat-card class="stat-card">
    <mat-card-content>
      <div class="stat-icon">
        <mat-icon color="warn">person_off</mat-icon>
      </div>
      <div class="stat-info">
        <span class="stat-value">{{ inactiveEmployees }}</span>
        <span class="stat-label">Inativos</span>
      </div>
    </mat-card-content>
  </mat-card>
</div>

      <!-- Search and Table -->
      <mat-card class="table-card">
        <mat-card-header>
          <mat-card-title>Lista de Funcionários</mat-card-title>
          <mat-card-subtitle>Clique em um funcionário para editar</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <!-- Search -->
          <div class="search-field">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Pesquisar</mat-label>
              <input matInput (keyup)="applyFilter($event)" placeholder="Nome, email ou documento">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
          </div>

          <!-- Table -->
          <div class="table-responsive">
            <table mat-table [dataSource]="dataSource" matSort class="full-width">
              <ng-container matColumnDef="fullName">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Nome </th>
                <td mat-cell *matCellDef="let employee">
                  <div class="cell-with-icon">
                    <mat-icon>person</mat-icon>
                    {{ employee.fullName }}
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Email </th>
                <td mat-cell *matCellDef="let employee">
                  <div class="cell-with-icon">
                    <mat-icon>email</mat-icon>
                    {{ employee.email }}
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="document">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Documento </th>
                <td mat-cell *matCellDef="let employee">
                  <div class="cell-with-icon">
                    <mat-icon>badge</mat-icon>
                    {{ employee.document }}
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="position">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Cargo </th>
                <td mat-cell *matCellDef="let employee">
                  <div class="cell-with-icon">
                    <mat-icon>work</mat-icon>
                    {{ employee.position || '-' }}
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="isActive">
                <th mat-header-cell *matHeaderCellDef> Status </th>
                <td mat-cell *matCellDef="let employee">
                  <span class="status-badge" [class.active]="employee.isActive" 
                        [class.inactive]="!employee.isActive">
                    {{ employee.isActive ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef> Ações </th>
                <td mat-cell *matCellDef="let employee">
                  <button mat-icon-button color="primary" (click)="openEmployeeForm(employee)" 
                          matTooltip="Editar">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteEmployee(employee.id)" 
                          matTooltip="Excluir">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell" [attr.colspan]="displayedColumns.length">
                  <div class="no-data">
                    <mat-icon>sentiment_dissatisfied</mat-icon>
                    <p>Nenhum funcionário encontrado</p>
                  </div>
                </td>
              </tr>
            </table>
          </div>

          <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" showFirstLastButtons>
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .employees-container {
      padding: 24px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      h1 {
        margin: 0;
        color: var(--text-primary);
        font-size: 28px;
        font-weight: 500;
      }

      p {
        margin: 4px 0 0;
        color: var(--text-secondary);
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;

      .stat-card {
        border-radius: 12px !important;
        
        mat-card-content {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
        }

        .stat-icon {
          mat-icon {
            width: 48px;
            height: 48px;
            font-size: 48px;
          }
        }

        .stat-info {
          display: flex;
          flex-direction: column;

          .stat-value {
            font-size: 28px;
            font-weight: 500;
            color: var(--text-primary);
          }

          .stat-label {
            font-size: 14px;
            color: var(--text-secondary);
          }
        }
      }
    }

    .table-card {
      border-radius: 12px !important;
      overflow: hidden;

      mat-card-header {
        padding: 20px 24px 0;
        
        mat-card-title {
          font-size: 20px;
          font-weight: 500;
        }
      }

      .search-field {
        padding: 16px 0;
        
        .full-width {
          width: 100%;
        }
      }

      .table-responsive {
        overflow-x: auto;
      }

      table {
        width: 100%;

        .cell-with-icon {
          display: flex;
          align-items: center;
          gap: 8px;

          mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
            color: var(--text-secondary);
          }
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;

          &.active {
            background: #e8f5e9;
            color: #2e7d32;
          }

          &.inactive {
            background: #ffebee;
            color: #c62828;
          }
        }

        .no-data {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          color: var(--text-secondary);

          mat-icon {
            font-size: 48px;
            width: 48px;
            height: 48px;
            margin-bottom: 16px;
          }
        }
      }

      mat-paginator {
        margin-top: 16px;
      }
    }

    @media (max-width: 768px) {
      .employees-container {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class EmployeesComponent implements OnInit {
  displayedColumns: string[] = ['fullName', 'email', 'document', 'position', 'isActive', 'actions'];
  dataSource = new MatTableDataSource<Employee>();
  employees: Employee[] = [];
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private employeeService: EmployeeService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  get activeEmployees(): number {
    return this.employees.filter(e => e.isActive).length;
  }

  get inactiveEmployees(): number {
    return this.employees.filter(e => !e.isActive).length;
  }

  loadEmployees(): void {
    this.loading = true;
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.dataSource.data = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar funcionários:', error);
        this.snackBar.open('Erro ao carregar funcionários', 'OK', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openEmployeeForm(employee?: Employee): void {
    const dialogRef = this.dialog.open(EmployeeFormComponent, {
      width: '600px',
      data: employee || null,
      disableClose: true,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadEmployees();
      }
    });
  }

  deleteEmployee(id: number): void {
    if (confirm('Tem certeza que deseja excluir este funcionário?')) {
      this.employeeService.deleteEmployee(id).subscribe({
        next: () => {
          this.snackBar.open('Funcionário excluído com sucesso', 'OK', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadEmployees();
        },
        error: (error) => {
          console.error('Erro ao excluir funcionário:', error);
          this.snackBar.open('Erro ao excluir funcionário', 'OK', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}