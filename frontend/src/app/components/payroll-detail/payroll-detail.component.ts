import { Component, Inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';

import { Payroll, monthNames } from '../../models/payroll.model';

@Component({
  selector: 'app-payroll-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatTableModule,
    MatTabsModule
  ],
  providers: [CurrencyPipe, DatePipe],
  template: `
    <div class="detail-container">
      <!-- Header -->
      <div class="detail-header" [class.paid-header]="data.status === 'Paid'">
        <div class="header-left">
          <button mat-icon-button (click)="onClose()" class="close-btn">
            <mat-icon>close</mat-icon>
          </button>
          <h2>Detalhes da Folha</h2>
        </div>
        <div class="header-right">
          <mat-chip-listbox>
            <mat-chip-option [color]="getStatusColor(data.status)" selected>
              {{ data.status }}
            </mat-chip-option>
          </mat-chip-listbox>
        </div>
      </div>

      <mat-dialog-content class="detail-content">
        <!-- Informações do Funcionário -->
        <mat-card class="info-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>person</mat-icon>
            <mat-card-title>{{ data.employeeName }}</mat-card-title>
            <mat-card-subtitle>Funcionário</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">ID do Funcionário</span>
                <span class="info-value">#{{ data.employeeId }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Período</span>
                <span class="info-value">{{ monthNames[data.month - 1] }}/{{ data.year }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Data de Cálculo</span>
                <span class="info-value">{{ data.createdAt | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="info-item" *ngIf="data.paidAt">
                <span class="info-label">Data de Pagamento</span>
                <span class="info-value">{{ data.paidAt | date:'dd/MM/yyyy' }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Resumo Financeiro -->
        <mat-card class="summary-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>payments</mat-icon>
            <mat-card-title>Resumo Financeiro</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="summary-grid">
              <div class="summary-item gross">
                <span class="summary-label">Salário Bruto</span>
                <span class="summary-value">{{ data.grossSalary | currency:'BRL' }}</span>
              </div>
              
              <div class="summary-item deduction">
                <span class="summary-label">INSS</span>
                <span class="summary-value">- {{ data.inss | currency:'BRL' }}</span>
              </div>
              
              <div class="summary-item deduction">
                <span class="summary-label">IRRF</span>
                <span class="summary-value">- {{ data.irrf | currency:'BRL' }}</span>
              </div>
              
              <mat-divider></mat-divider>
              
              <div class="summary-item net">
                <span class="summary-label">Salário Líquido</span>
                <span class="summary-value">{{ data.netSalary | currency:'BRL' }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Itens da Folha -->
        <mat-card class="items-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>receipt</mat-icon>
            <mat-card-title>Itens da Folha</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-tab-group>
              <mat-tab label="Proventos">
                <table mat-table [dataSource]="earningsItems" class="items-table">
                  <ng-container matColumnDef="description">
                    <th mat-header-cell *matHeaderCellDef> Descrição </th>
                    <td mat-cell *matCellDef="let item"> {{ item.description }} </td>
                  </ng-container>

                  <ng-container matColumnDef="amount">
                    <th mat-header-cell *matHeaderCellDef> Valor </th>
                    <td mat-cell *matCellDef="let item" class="amount-positive">
                      {{ item.amount | currency:'BRL' }}
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="['description', 'amount']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['description', 'amount'];"></tr>

                  <tr class="mat-row" *matNoDataRow>
                    <td class="mat-cell" colspan="2">Nenhum provento encontrado</td>
                  </tr>
                </table>
              </mat-tab>

              <mat-tab label="Deduções">
                <table mat-table [dataSource]="deductionsItems" class="items-table">
                  <ng-container matColumnDef="description">
                    <th mat-header-cell *matHeaderCellDef> Descrição </th>
                    <td mat-cell *matCellDef="let item"> {{ item.description }} </td>
                  </ng-container>

                  <ng-container matColumnDef="amount">
                    <th mat-header-cell *matHeaderCellDef> Valor </th>
                    <td mat-cell *matCellDef="let item" class="amount-negative">
                      - {{ item.amount | currency:'BRL' }}
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="['description', 'amount']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['description', 'amount'];"></tr>

                  <tr class="mat-row" *matNoDataRow>
                    <td class="mat-cell" colspan="2">Nenhuma dedução encontrada</td>
                  </tr>
                </table>
              </mat-tab>
            </mat-tab-group>
          </mat-card-content>
        </mat-card>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onClose()">Fechar</button>
        <button mat-raised-button color="primary" (click)="printPayroll()">
          <mat-icon>print</mat-icon>
          Imprimir
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .detail-container {
      min-width: 600px;
      max-width: 800px;
      padding: 0;
      overflow: hidden;
    }

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background: var(--primary);
      color: white;

      &.paid-header {
        background: #4caf50;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 8px;

        .close-btn {
          color: white;
        }

        h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 500;
        }
      }
    }

    .detail-content {
      padding: 24px !important;
      max-height: 70vh;
      overflow-y: auto;
    }

    .info-card, .summary-card, .items-card {
      margin-bottom: 24px;
      border-radius: 12px !important;

      mat-card-header {
        padding-bottom: 16px;

        mat-icon {
          background: rgba(103, 58, 183, 0.1);
          border-radius: 50%;
          padding: 8px;
        }
      }
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      padding: 8px 0;

      .info-item {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .info-label {
          font-size: 12px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-value {
          font-size: 16px;
          font-weight: 500;
          color: var(--text-primary);
        }
      }
    }

    .summary-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 8px 0;

      .summary-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;

        &.gross .summary-value {
          color: var(--text-primary);
          font-weight: 500;
        }

        &.deduction .summary-value {
          color: #f44336;
        }

        &.net {
          margin-top: 8px;
          
          .summary-label {
            font-size: 16px;
            font-weight: 500;
          }
          
          .summary-value {
            font-size: 20px;
            font-weight: 600;
            color: #4caf50;
          }
        }

        .summary-label {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .summary-value {
          font-size: 16px;
          font-weight: 500;
        }
      }
    }

    .items-table {
      width: 100%;
      margin-top: 16px;

      .amount-positive {
        color: #4caf50;
        font-weight: 500;
      }

      .amount-negative {
        color: #f44336;
        font-weight: 500;
      }
    }

    mat-dialog-actions {
      padding: 16px 24px;
      margin: 0;
      border-top: 1px solid rgba(0,0,0,0.08);

      button {
        min-width: 100px;
        
        mat-icon {
          margin-right: 4px;
        }
      }
    }

    @media (max-width: 768px) {
      .detail-container {
        min-width: unset;
        width: 100%;
      }

      .info-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }
    }
  `]
})
export class PayrollDetailComponent {
  monthNames = monthNames;

  constructor(
    public dialogRef: MatDialogRef<PayrollDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Payroll
  ) {}

  get earningsItems() {
    return this.data.items?.filter(item => item.type === 'Earning') || [];
  }

  get deductionsItems() {
    return this.data.items?.filter(item => item.type === 'Deduction') || [];
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Paid': return 'accent';
      case 'Calculated': return 'primary';
      case 'Cancelled': return 'warn';
      default: return '';
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

  printPayroll(): void {
    // Implementar impressão
    window.print();
  }
}