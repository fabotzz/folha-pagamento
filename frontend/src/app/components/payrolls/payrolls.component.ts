import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl } from '@angular/forms';

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
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { ReactiveFormsModule } from '@angular/forms';

import { PayrollService } from '../../services/payroll.service';
import { EmployeeService } from '../../services/employee.service';
import { Payroll, PayrollStatus, monthNames } from '../../models/payroll.model';
import { Employee } from '../../models/employee.model';
import { PayrollFormComponent } from '../payroll-form/payroll-form.component';
import { PayrollDetailComponent } from '../payroll-detail/payroll-detail.component';

@Component({
  selector: 'app-payrolls',
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
    MatProgressSpinnerModule,
    MatChipsModule,
    MatMenuModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule
  ],
  providers: [CurrencyPipe, DatePipe],
  templateUrl: './payrolls.component.html',
  styleUrls: ['./payrolls.component.scss']
})
export class PayrollsComponent implements OnInit {
  displayedColumns: string[] = ['employeeName', 'period', 'grossSalary', 'netSalary', 'status', 'actions'];
  dataSource = new MatTableDataSource<Payroll>();
  payrolls: Payroll[] = [];
  employees: Employee[] = [];
  statuses = Object.values(PayrollStatus);
  monthNames = monthNames;
  loading = false;

  // Filters
  employeeFilter = new FormControl('');
  statusFilter = new FormControl('');
  periodFilter = new FormControl('');

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private payrollService: PayrollService,
    private employeeService: EmployeeService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.loadPayrolls();
    this.setupFilters();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    setTimeout(() => {
      this.cdr.detectChanges();
    });
  }

  get totalAmount(): number {
    return this.payrolls.reduce((sum, p) => sum + p.grossSalary, 0);
  }

  get totalDeductions(): number {
    return this.payrolls.reduce((sum, p) => sum + (p.inss + p.irrf), 0);
  }

  get totalNet(): number {
    return this.payrolls.reduce((sum, p) => sum + p.netSalary, 0);
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
      },
      error: (error) => {
        console.error('Erro ao carregar funcionários:', error);
      }
    });
  }

  loadPayrolls(): void {
    this.loading = true;
    this.payrollService.getPayrolls().subscribe({
      next: (data) => {
        this.payrolls = data;
        this.dataSource.data = data;
        this.loading = false;
        
        setTimeout(() => {
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        console.error('Erro ao carregar folhas:', error);
        this.snackBar.open('Erro ao carregar folhas de pagamento', 'OK', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
        
        setTimeout(() => {
          this.cdr.detectChanges();
        });
      }
    });
  }

  setupFilters(): void {
    if (this.employeeFilter) {
      this.employeeFilter.valueChanges.subscribe((value: string | null) => {
        if (value) {
          this.dataSource.filterPredicate = (data: Payroll, filter: string) => {
            return data.employeeId === parseInt(filter);
          };
          this.dataSource.filter = value;
        } else {
          this.dataSource.filter = '';
        }
      });
    }

    if (this.statusFilter) {
      this.statusFilter.valueChanges.subscribe((value: string | null) => {
        if (value) {
          this.dataSource.filterPredicate = (data: Payroll, filter: string) => {
            return data.status === filter;
          };
          this.dataSource.filter = value;
        } else {
          this.dataSource.filter = '';
        }
      });
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearFilters(): void {
    this.employeeFilter.setValue('');
    this.statusFilter.setValue('');
    this.periodFilter.setValue('');
    this.dataSource.filter = '';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Paid': return 'accent';
      case 'Calculated': return 'primary';
      case 'Cancelled': return 'warn';
      default: return '';
    }
  }

  openPayrollForm(): void {
    const dialogRef = this.dialog.open(PayrollFormComponent, {
      width: '600px',
      disableClose: true,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.loadPayrolls();
      }
    });
  }

  viewPayroll(payroll: Payroll): void {
    this.dialog.open(PayrollDetailComponent, {
      width: '800px',
      data: payroll,
      panelClass: 'payroll-detail-dialog'
    });
  }

  // Método que aceita string e converte para o enum
  updateStatusWithString(payroll: Payroll, statusString: string): void {
    // Converter a string para o tipo PayrollStatus
    const status = statusString as PayrollStatus;
    
    if (confirm(`Deseja alterar o status para "${status}"?`)) {
      this.payrollService.updateStatus(payroll.id, { status }).subscribe({
        next: () => {
          this.snackBar.open('Status atualizado com sucesso!', 'OK', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadPayrolls();
        },
        error: (error) => {
          console.error('Erro ao atualizar status:', error);
          this.snackBar.open('Erro ao atualizar status', 'OK', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  deletePayroll(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta folha de pagamento?')) {
      this.payrollService.deletePayroll(id).subscribe({
        next: () => {
          this.snackBar.open('Folha excluída com sucesso!', 'OK', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadPayrolls();
        },
        error: (error) => {
          console.error('Erro ao excluir folha:', error);
          this.snackBar.open('Erro ao excluir folha', 'OK', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}