import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'employees',
    loadComponent: () => import('./components/employees/employees.component').then(m => m.EmployeesComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'payrolls',
    loadComponent: () => import('./components/payrolls/payrolls.component').then(m => m.PayrollsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard',
    redirectTo: '/employees',
    pathMatch: 'full'
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  }
];