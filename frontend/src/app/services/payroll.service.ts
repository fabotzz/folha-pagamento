import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payroll, CreatePayroll, UpdatePayrollStatus } from '../models/payroll.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PayrollService {
  private apiUrl = `${environment.apiUrl}/api/payrolls`;

  constructor(private http: HttpClient) { }

  getPayrolls(): Observable<Payroll[]> {
    return this.http.get<Payroll[]>(this.apiUrl);
  }

  getPayroll(id: number): Observable<Payroll> {
    return this.http.get<Payroll>(`${this.apiUrl}/${id}`);
  }

  getPayrollsByEmployee(employeeId: number): Observable<Payroll[]> {
    return this.http.get<Payroll[]>(`${this.apiUrl}/employee/${employeeId}`);
  }

  calculatePayroll(data: CreatePayroll): Observable<Payroll> {
    return this.http.post<Payroll>(`${this.apiUrl}/calculate`, data);
  }

  updateStatus(id: number, status: UpdatePayrollStatus): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/status`, status);
  }

  deletePayroll(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}