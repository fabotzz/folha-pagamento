export enum EmploymentType {
  CLT = 1,
  Intern = 2,
  Apprentice = 3,
  PJ = 4,
  Temporary = 5
}

export interface Employee {
  id: number;
  fullName: string;
  email: string;
  document: string;
  birthDate: string;
  hireDate: string;
  department?: string;
  position?: string;
  salary: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  employmentType: EmploymentType;
  
  // Campos específicos por modalidade
  contractNumber?: string;
  contractEndDate?: string;
  university?: string;
  course?: string;
  cnpj?: string;
  hourlyRate?: number;
}

export interface CreateEmployee {
  fullName: string;
  email: string;
  document: string;
  birthDate: string;
  hireDate: string;
  department?: string;
  position?: string;
  salary: number;
  isActive: boolean;
  employmentType: EmploymentType;
  
  // Campos específicos por modalidade
  contractNumber?: string;
  contractEndDate?: string;
  university?: string;
  course?: string;
  cnpj?: string;
  hourlyRate?: number;
}