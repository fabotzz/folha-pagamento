import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { EmployeeService } from '../../services/employee.service';
import { Employee, CreateEmployee } from '../../models/employee.model';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2>{{ data ? 'Editar Funcionário' : 'Novo Funcionário' }}</h2>
        <button mat-icon-button (click)="onCancel()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
      <form [formGroup]="employeeForm" class="employee-form">
        <!-- Nome Completo -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nome Completo</mat-label>
          <input matInput formControlName="fullName" placeholder="Digite o nome completo">
          <mat-icon matSuffix>person</mat-icon>
          <mat-error *ngIf="employeeForm.get('fullName')?.hasError('required')">
            Nome obrigatório
          </mat-error>
        </mat-form-field>

        <!-- Email e Documento -->
        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" placeholder="email@exemplo.com">
            <mat-icon matSuffix>email</mat-icon>
            <mat-error *ngIf="employeeForm.get('email')?.hasError('required')">
              Email obrigatório
            </mat-error>
            <mat-error *ngIf="employeeForm.get('email')?.hasError('email')">
              Email inválido
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Documento (CPF)</mat-label>
            <input matInput formControlName="document" placeholder="Apenas números">
            <mat-icon matSuffix>badge</mat-icon>
            <mat-error *ngIf="employeeForm.get('document')?.hasError('required')">
              Documento obrigatório
            </mat-error>
          </mat-form-field>
        </div>

        <!-- DATAS: Nascimento e Admissão -->
        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Data de Nascimento</mat-label>
            <input matInput [matDatepicker]="birthPicker" formControlName="birthDate">
            <mat-datepicker-toggle matSuffix [for]="birthPicker"></mat-datepicker-toggle>
            <mat-datepicker #birthPicker></mat-datepicker>
            <mat-error *ngIf="employeeForm.get('birthDate')?.hasError('required')">
              Data de nascimento obrigatória
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Data de Admissão</mat-label>
            <input matInput [matDatepicker]="hirePicker" formControlName="hireDate">
            <mat-datepicker-toggle matSuffix [for]="hirePicker"></mat-datepicker-toggle>
            <mat-datepicker #hirePicker></mat-datepicker>
            <mat-error *ngIf="employeeForm.get('hireDate')?.hasError('required')">
              Data de admissão obrigatória
            </mat-error>
          </mat-form-field>
        </div>

        <!-- Cargo, Departamento e Salário -->
        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Cargo</mat-label>
            <input matInput formControlName="position" placeholder="Digite o cargo">
            <mat-icon matSuffix>work</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Departamento</mat-label>
            <input matInput formControlName="department" placeholder="Digite o departamento">
            <mat-icon matSuffix>business</mat-icon>
          </mat-form-field>
        </div>

        <!-- Salário e Status Ativo -->
        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Salário</mat-label>
            <input matInput formControlName="salary" type="number" placeholder="0.00">
            <span matPrefix>R$&nbsp;</span>
            <mat-error *ngIf="employeeForm.get('salary')?.hasError('required')">
              Salário obrigatório
            </mat-error>
            <mat-error *ngIf="employeeForm.get('salary')?.hasError('min')">
              Salário deve ser maior que zero
            </mat-error>
          </mat-form-field>

          <mat-checkbox formControlName="isActive" color="primary" class="checkbox-field">
            Funcionário Ativo
          </mat-checkbox>
        </div>
      </form>
    </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancelar</button>
        <button mat-raised-button color="primary" (click)="onSubmit()" 
                [disabled]="employeeForm.invalid || loading">
          <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
          <span *ngIf="!loading">{{ data ? 'Atualizar' : 'Salvar' }}</span>
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

      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }

      button {
        color: white;
      }
    }

    .employee-form {
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

      mat-checkbox {
        display: flex;
        align-items: center;
        margin-top: 8px;
      }
    }

    mat-dialog-actions {
      padding: 16px 24px;
      margin: 0;
      border-top: 1px solid rgba(0,0,0,0.08);

      button {
        min-width: 100px;
        
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
export class EmployeeFormComponent implements OnInit {
  employeeForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private dialogRef: MatDialogRef<EmployeeFormComponent>,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: Employee | null
  ) {
    this.employeeForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      document: ['', Validators.required],
      birthDate: [new Date(), Validators.required],
      hireDate: [new Date(), Validators.required],
      department: [''],
      position: [''],
      salary: [0, [Validators.required, Validators.min(0)]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.employeeForm.patchValue({
        fullName: this.data.fullName,
        email: this.data.email,
        document: this.data.document,
        position: this.data.position,
        salary: this.data.salary,
        hireDate: this.data.hireDate ? new Date(this.data.hireDate) : new Date(),
        isActive: this.data.isActive
      });
    }
  }

  onSubmit(): void {
  if (this.employeeForm.valid) {
    this.loading = true;
    
    const formValue = this.employeeForm.value;
    
    const hireDate = formValue.hireDate 
      ? new Date(formValue.hireDate).toISOString().split('T')[0] // Pega só yyyy-MM-dd
      : new Date().toISOString().split('T')[0];
    
    // Também precisamos de uma data de nascimento (BirthDate)
    // Se não tiver no formulário, vamos usar uma data padrão ou a mesma de admissão
    const birthDate = formValue.birthDate 
      ? new Date(formValue.birthDate).toISOString().split('T')[0]
      : new Date('1990-01-01').toISOString().split('T')[0]; // Data padrão
    
    // Enviar diretamente o objeto, sem wrapper
    const employeeData = {
      fullName: formValue.fullName,
      email: formValue.email,
      document: formValue.document,
      birthDate: birthDate, // Campo obrigatório no modelo
      hireDate: hireDate,
      department: formValue.department || formValue.position, // Ajuste conforme seu formulário
      position: formValue.position || '',
      salary: Number(formValue.salary),
      isActive: formValue.isActive
    };
    
    console.log('Dados enviados:', employeeData);

    const request = this.data
      ? this.employeeService.updateEmployee(this.data.id, employeeData)
      : this.employeeService.createEmployee(employeeData);

    request.subscribe({
      next: (response) => {
        this.snackBar.open(
          `Funcionário ${this.data ? 'atualizado' : 'criado'} com sucesso!`,
          'OK',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Erro ao salvar funcionário:', error);
        console.error('Resposta do servidor:', error.error);
        
        let errorMessage = `Erro ao ${this.data ? 'atualizar' : 'criar'} funcionário`;
        
        if (error.error?.errors) {
          const validationErrors = error.error.errors;
          console.log('Erros de validação detalhados:', validationErrors);
          
          const errorList = Object.keys(validationErrors)
            .map(key => `${key}: ${validationErrors[key].join(', ')}`);
          
          errorMessage = 'Erros de validação:\n' + errorList.join('\n');
          console.log('Lista de erros:', errorList);
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        this.snackBar.open(errorMessage, 'OK', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
      }
    });
  } else {
    Object.keys(this.employeeForm.controls).forEach(key => {
      this.employeeForm.get(key)?.markAsTouched();
    });
    
    this.snackBar.open('Preencha todos os campos obrigatórios', 'OK', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }
}

  onCancel(): void {
    this.dialogRef.close(false);
  }
}