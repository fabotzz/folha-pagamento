export interface Payroll {
  id: number;
  employeeId: number;
  employeeName: string;
  month: number;
  year: number;
  grossSalary: number;
  inss: number;
  irrf: number;
  netSalary: number;
  status: PayrollStatus;
  createdAt: Date;
  paidAt?: Date;
  items: PayrollItem[];
}

export interface PayrollItem {
  id: number;
  description: string;
  type: 'Earning' | 'Deduction';
  amount: number;
}

export interface CreatePayroll {
  employeeId: number;
  month: number;
  year: number;
  grossSalary: number;
}

export interface UpdatePayrollStatus {
  status: PayrollStatus;
}

export enum PayrollStatus {
  Draft = 'Draft',
  Calculated = 'Calculated',
  Paid = 'Paid',
  Cancelled = 'Cancelled'
}

// Utilitário para nome do mês
export const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];