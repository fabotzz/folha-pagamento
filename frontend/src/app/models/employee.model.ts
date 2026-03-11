export interface Employee {
  id: number;
  fullName: string;
  email: string;
  document: string;
  birthDate: string; // Formato yyyy-MM-dd
  hireDate: string;  // Formato yyyy-MM-dd
  department?: string;
  position?: string;
  salary: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEmployee {
  fullName: string;
  email: string;
  document: string;
  birthDate: string; // Formato yyyy-MM-dd
  hireDate: string;  // Formato yyyy-MM-dd
  department?: string;
  position?: string;
  salary: number;
  isActive: boolean;
}