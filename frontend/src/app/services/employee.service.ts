import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee, CreateEmployee } from '../models/employee.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = `${environment.apiUrl}/api/employees`;

  constructor(private http: HttpClient) { }

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  getEmployee(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  createEmployee(data: any): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, data);
  }

  updateEmployee(id: number, data: any): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}`, data);
  }

  // Soft delete (existente)
  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // HARD DELETE - NOVO MÉTODO
  hardDeleteEmployee(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/hard/${id}`);
  }

  // HARD DELETE ALL - NOVO MÉTODO (opcional, para admin)
  hardDeleteAllEmployees(): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/hard/all`);
  }

}