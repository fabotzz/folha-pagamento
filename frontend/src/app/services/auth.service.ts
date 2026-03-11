import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface DevTokenRequest {
  email?: string;
  fullName?: string;
  role?: string;
}

export interface AuthResponse {
  id: number;
  fullName: string;
  email: string;
  role: string;
  token: string;
  employeeId?: number | null;
}  

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';
  private roleKey = 'auth_role';
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Login normal com backend real
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/auth/login`, credentials)
      .pipe(
        tap(response => this.handleAuthResponse(response))
      );
  }

  /**
   * Login de desenvolvimento - obtém token como Admin
   * Use este método durante o desenvolvimento
   */
  devLoginAsAdmin(): Observable<AuthResponse> {
    const devRequest: DevTokenRequest = {
      email: 'admin@dev.com',
      fullName: 'Administrador Dev',
      role: 'Admin'
    };

    return this.http.post<AuthResponse>(`${this.apiUrl}/api/dev/auth/token`, devRequest)
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        catchError(error => {
          console.error('Erro no dev login, usando fallback local', error);
          // Fallback: gerar token fake localmente para não travar o desenvolvimento
          return of(this.generateFakeAdminToken());
        })
      );
  }

  /**
   * Login de desenvolvimento com role específica
   */
  devLoginAs(role: 'Admin' | 'RH' | 'Employee', email?: string, name?: string): Observable<AuthResponse> {
    const devRequest: DevTokenRequest = {
      email: email || `${role.toLowerCase()}@dev.com`,
      fullName: name || `Usuário ${role}`,
      role: role
    };

    return this.http.post<AuthResponse>(`${this.apiUrl}/api/dev/auth/token`, devRequest)
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        catchError(error => {
          console.error('Erro no dev login, usando fallback local', error);
          return of(this.generateFakeAdminToken());
        })
      );
  }

  /**
   * Processa a resposta de autenticação
   */
  private handleAuthResponse(response: AuthResponse): void {
    this.setToken(response.token);
    this.setUser(response.fullName, response.role);
  }

  /**
   * Gera um token fake local (fallback caso o backend não esteja disponível)
   */
  private generateFakeAdminToken(): AuthResponse {
    return {
      id: 0,
      fullName: 'Admin Fake',
      email: 'admin@fake.com',
      role: 'Admin',
      token: 'fake-jwt-token-para-desenvolvimento',
      employeeId: null
    };
  }

  setToken(token: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.tokenKey, token);
      }
    } catch {
      // ignore on server
    }
  }

  getToken(): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(this.tokenKey);
      }
    } catch {
      // ignore on server
    }
    return null;
  }

  clear(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        localStorage.removeItem(this.roleKey);
      }
    } catch {
      // ignore on server
    }
  }

  setUser(name: string, role: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.userKey, name);
        localStorage.setItem(this.roleKey, role);
      }
    } catch {
      // ignore on server
    }
  }

  getUser(): { name: string | null; role: string | null } {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return {
          name: localStorage.getItem(this.userKey),
          role: localStorage.getItem(this.roleKey)
        };
      }
    } catch {
      // ignore on server
    }
    return { name: null, role: null };
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    this.clear();
  }
}
