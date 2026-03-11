import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { PayrollService } from '../../services/payroll.service';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee.model';
import { monthNames } from '../../models/payroll.model';
import { MatDivider } from "@angular/material/divider";

@Component({
  selector: 'app-payroll-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDivider
],
  template: `
    <div class="dialog-container">
      <div class="dialog-header" [class.calculated-header]="data?.status === 'Calculated'">
        <h2>Calcular Folha de Pagamento</h2>
        <button mat-icon-button (click)="onCancel()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <form [formGroup]="payrollForm" class="payroll-form">
          <!-- Funcionário -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Funcionário</mat-label>
            <mat-select formControlName="employeeId" (selectionChange)="onEmployeeSelect($event.value)">
              <mat-option *ngFor="let employee of employees" [value]="employee.id">
                {{ employee.fullName }} - {{ employee.position }}
              </mat-option>
            </mat-select>
            <mat-icon matSuffix>person</mat-icon>
            <mat-error *ngIf="payrollForm.get('employeeId')?.hasError('required')">
              Selecione um funcionário
            </mat-error>
          </mat-form-field>

          <!-- Período -->
          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mês</mat-label>
              <mat-select formControlName="month">
                <mat-option *ngFor="let month of months; let i = index" [value]="i + 1">
                  {{ month }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Ano</mat-label>
              <input matInput formControlName="year" type="number" 
                     [min]="currentYear - 2" [max]="currentYear + 1">
            </mat-form-field>
          </div>

          <!-- Salário Bruto -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Salário Bruto</mat-label>
            <input matInput formControlName="grossSalary" type="number" step="0.01">
            <span matPrefix>R$&nbsp;</span>
            <mat-icon matSuffix>attach_money</mat-icon>
            <mat-error *ngIf="payrollForm.get('grossSalary')?.hasError('required')">
              Salário obrigatório
            </mat-error>
            <mat-error *ngIf="payrollForm.get('grossSalary')?.hasError('min')">
              Salário deve ser maior que zero
            </mat-error>
          </mat-form-field>

          <!-- Informações adicionais -->
          <div class="info-section" *ngIf="selectedEmployee">
            <mat-divider></mat-divider>
            <h3>Informações do Funcionário</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Cargo:</span>
                <span class="info-value">{{ selectedEmployee.position || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Data Admissão:</span>
                <span class="info-value">{{ selectedEmployee.hireDate | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Status:</span>
                <span class="info-value status-badge" 
                      [class.active]="selectedEmployee.isActive"
                      [class.inactive]="!selectedEmployee.isActive">
                  {{ selectedEmployee.isActive ? 'Ativo' : 'Inativo' }}
                </span>
              </div>
            </div>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancelar</button>
        <button mat-raised-button color="primary" (click)="onSubmit()" 
                [disabled]="payrollForm.invalid || loading">
          <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
          <span *ngIf="!loading">Calcular Folha</span>
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 0;
      overflow: hidden;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background: var(--primary);
      color: white;

      &.calculated-header {
        background: #4caf50;
      }

      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }

      button {
        color: white;
      }
    }

    .payroll-form {
      padding: 20px 0;

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 16px;
      }

      .full-width {
        width: 100%;
      }

      .info-section {
        margin-top: 24px;

        h3 {
          font-size: 16px;
          font-weight: 500;
          color: var(--text-primary);
          margin: 16px 0;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          background: #f8f9fa;
          padding: 16px;
          border-radius: 8px;

          .info-item {
            display: flex;
            flex-direction: column;
            gap: 4px;

            .info-label {
              font-size: 12px;
              color: var(--text-secondary);
              text-transform: uppercase;
            }

            .info-value {
              font-size: 14px;
              font-weight: 500;
              color: var(--text-primary);
            }
          }
        }
      }
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      display: inline-block;

      &.active {
        background: #e8f5e9;
        color: #2e7d32;
      }

      &.inactive {
        background: #ffebee;
        color: #c62828;
      }
    }

    mat-dialog-actions {
      padding: 16px 24px;
      margin: 0;
      border-top: 1px solid rgba(0,0,0,0.08);

      button {
        min-width: 120px;
        
        mat-spinner {
          display: inline-block;
          margin-right: 8px;
        }
      }
    }

    @media (max-width: 600px) {
      .form-row {
        grid-template-columns: 1fr !important;
        gap: 0 !important;
      }
    }
  `]
})
export class PayrollFormComponent implements OnInit {
  payrollForm: FormGroup;
  loading = false;
  employees: Employee[] = [];
  selectedEmployee: Employee | null = null;
  months = monthNames;
  currentYear = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private payrollService: PayrollService,
    private employeeService: EmployeeService,
    private dialogRef: MatDialogRef<PayrollFormComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.payrollForm = this.fb.group({
      employeeId: ['', Validators.required],
      month: [new Date().getMonth() + 1, Validators.required],
      year: [this.currentYear, [Validators.required, Validators.min(2000)]],
      grossSalary: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data.filter(e => e.isActive);
      },
      error: (error) => {
        console.error('Erro ao carregar funcionários:', error);
        this.snackBar.open('Erro ao carregar funcionários', 'OK', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onEmployeeSelect(employeeId: number): void {
    this.selectedEmployee = this.employees.find(e => e.id === employeeId) || null;
    
    // Preencher automaticamente o salário do funcionário
    if (this.selectedEmployee) {
      this.payrollForm.patchValue({
        grossSalary: this.selectedEmployee.salary
      });
    }
  }

  onSubmit(): void {
    if (this.payrollForm.valid) {
      this.loading = true;
      
      this.payrollService.calculatePayroll(this.payrollForm.value).subscribe({
        next: (result) => {
          this.snackBar.open('Folha calculada com sucesso!', 'OK', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(result);
        },
        error: (error) => {
          console.error('Erro ao calcular folha:', error);
          this.snackBar.open(
            error.error?.message || 'Erro ao calcular folha',
            'OK',
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
          this.loading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}