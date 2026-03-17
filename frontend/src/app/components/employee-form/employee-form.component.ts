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
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';

import { EmployeeService } from '../../services/employee.service';
import { Employee, CreateEmployee, EmploymentType } from '../../models/employee.model';

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
    MatSnackBarModule,
    MatSelectModule,
    MatDividerModule
  ],
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.scss']
})
export class EmployeeFormComponent implements OnInit {
  employeeForm: FormGroup;
  loading = false;
  EmploymentType = EmploymentType; // Para usar no template

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
      document: ['', [
        Validators.required, 
        Validators.minLength(11), 
        Validators.maxLength(11),
        Validators.pattern(/^\d+$/)
      ]],
      birthDate: [new Date(), Validators.required],
      hireDate: [new Date(), Validators.required],
      department: [''],
      position: [''],
      salary: [0, [Validators.required, Validators.min(0)]],
      isActive: [true],
      employmentType: [EmploymentType.CLT, Validators.required],
      // Campos específicos por modalidade
      contractNumber: [''],
      contractEndDate: [null],
      university: [''],
      course: [''],
      cnpj: [''],
      hourlyRate: [0]
    });

    // Monitorar mudanças no tipo de contratação para validar campos específicos
    this.setupEmploymentTypeValidation();
  }

  ngOnInit(): void {
    if (this.data) {
      this.patchFormValues();
    }
  }

  private setupEmploymentTypeValidation(): void {
    this.employeeForm.get('employmentType')?.valueChanges.subscribe(type => {
      // Limpar validações anteriores
      this.clearConditionalValidators();
      
      // Aplicar validações conforme o tipo
      switch (type) {
        case EmploymentType.Intern:
          this.employeeForm.get('university')?.setValidators([Validators.required]);
          this.employeeForm.get('course')?.setValidators([Validators.required]);
          break;
          
        case EmploymentType.Apprentice:
          this.employeeForm.get('contractNumber')?.setValidators([Validators.required]);
          this.employeeForm.get('contractEndDate')?.setValidators([Validators.required]);
          break;
          
        case EmploymentType.PJ:
          this.employeeForm.get('cnpj')?.setValidators([
            Validators.required,
            Validators.pattern(/^\d{14}$/)
          ]);
          break;
          
        case EmploymentType.Temporary:
          this.employeeForm.get('contractEndDate')?.setValidators([Validators.required]);
          break;
      }
      
      // Atualizar validade dos campos
      this.updateConditionalValidators();
    });
  }

  private clearConditionalValidators(): void {
    const fields = ['university', 'course', 'contractNumber', 'contractEndDate', 'cnpj', 'hourlyRate'];
    fields.forEach(field => {
      this.employeeForm.get(field)?.clearValidators();
      this.employeeForm.get(field)?.updateValueAndValidity();
    });
  }

  private updateConditionalValidators(): void {
    const fields = ['university', 'course', 'contractNumber', 'contractEndDate', 'cnpj', 'hourlyRate'];
    fields.forEach(field => {
      this.employeeForm.get(field)?.updateValueAndValidity();
    });
  }

  private patchFormValues(): void {
    if (!this.data) return;
    
    const formValue: any = {
      fullName: this.data.fullName,
      email: this.data.email,
      document: this.data.document,
      position: this.data.position,
      department: this.data.department,
      salary: this.data.salary,
      isActive: this.data.isActive,
      employmentType: this.data.employmentType,
      contractNumber: this.data.contractNumber,
      contractEndDate: this.data.contractEndDate ? new Date(this.data.contractEndDate) : null,
      university: this.data.university,
      course: this.data.course,
      cnpj: this.data.cnpj,
      hourlyRate: this.data.hourlyRate
    };

    // Converter datas
    if (this.data.birthDate) {
      formValue.birthDate = new Date(this.data.birthDate);
    }
    if (this.data.hireDate) {
      formValue.hireDate = new Date(this.data.hireDate);
    }

    this.employeeForm.patchValue(formValue);
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.markAllAsTouched();
      this.snackBar.open('Preencha todos os campos obrigatórios', 'OK', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.loading = true;
    
    const formValue = this.employeeForm.value;
    
    // CORREÇÃO: Formatar datas para yyyy-MM-dd (sem hora, sem UTC)
    // Isso é o que o C# espera para DateOnly
    const hireDate = formValue.hireDate 
      ? new Date(formValue.hireDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    const birthDate = formValue.birthDate 
      ? new Date(formValue.birthDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    const employeeData: any = {
      fullName: formValue.fullName,
      email: formValue.email,
      document: formValue.document,
      birthDate: birthDate,
      hireDate: hireDate,
      department: formValue.department || '',
      position: formValue.position || '',
      salary: Number(formValue.salary),
      isActive: formValue.isActive,
      employmentType: Number(formValue.employmentType)
    };

    const employmentType = Number(formValue.employmentType);
    
    switch (employmentType) {
      case EmploymentType.Intern:
        employeeData.university = formValue.university;
        employeeData.course = formValue.course;
        break;
        
      case EmploymentType.Apprentice:
        employeeData.contractNumber = formValue.contractNumber;
        employeeData.contractEndDate = formValue.contractEndDate 
          ? new Date(formValue.contractEndDate).toISOString().split('T')[0]  // yyyy-MM-dd
          : null;
        break;
        
      case EmploymentType.PJ:
        employeeData.cnpj = formValue.cnpj?.replace(/\D/g, ''); // Remove máscara
        break;
        
      case EmploymentType.Temporary:
        employeeData.contractEndDate = formValue.contractEndDate 
          ? new Date(formValue.contractEndDate).toISOString().split('T')[0]  // yyyy-MM-dd
          : null;
        break;
    }
    
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
        this.cdr.detectChanges();
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Erro ao salvar funcionário:', error);
        console.error('Resposta do servidor:', error.error);
        
        let errorMessage = `Erro ao ${this.data ? 'atualizar' : 'criar'} funcionário`;
        
        if (error.status === 409) {
          errorMessage = 'Já existe um funcionário com este documento (CPF/CNPJ)';
        } else if (error.error?.errors) {
          const validationErrors = error.error.errors;
          const errorList = Object.keys(validationErrors)
            .map(key => `${key}: ${validationErrors[key].join(', ')}`);
          errorMessage = 'Erros de validação:\n' + errorList.join('\n');
          console.log('Erros de validação detalhados:', validationErrors);
          console.log('Lista de erros:', errorList);
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        this.snackBar.open(errorMessage, 'OK', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private markAllAsTouched(): void {
    Object.keys(this.employeeForm.controls).forEach(key => {
      this.employeeForm.get(key)?.markAsTouched();
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  // Getter para saber se é um tipo que precisa de campos específicos
  get requiresContractEndDate(): boolean {
    const type = this.employeeForm.get('employmentType')?.value;
    return type === EmploymentType.Apprentice || type === EmploymentType.Temporary;
  }

  get requiresUniversity(): boolean {
    return this.employeeForm.get('employmentType')?.value === EmploymentType.Intern;
  }

  get requiresCnpj(): boolean {
    return this.employeeForm.get('employmentType')?.value === EmploymentType.PJ;
  }
}