using Payroll.API.Models;
using Payroll.API.Models.Enums;

namespace Payroll.API.Services;

public class PayrollCalculator : IPayrollCalculator
{
    public Models.Payroll Calculate(int employeeId, int month, int year, decimal grossSalary, EmploymentType employmentType)
    {
        var payroll = new Models.Payroll
        {
            EmployeeId = employeeId,
            Month = month,
            Year = year,
            GrossSalary = grossSalary,
            CreatedAt = DateTime.UtcNow,
            Status = PayrollStatus.Calculated,
            Items = new List<PayrollItem>()
        };

        switch (employmentType)
        {
            case EmploymentType.CLT:
                CalculateCLT(payroll);
                break;
                
            case EmploymentType.Intern:
                CalculateIntern(payroll);
                break;
                
            case EmploymentType.Apprentice:
                CalculateApprentice(payroll);
                break;
                
            case EmploymentType.PJ:
                CalculatePJ(payroll);
                break;
                
            case EmploymentType.Temporary:
                CalculateTemporary(payroll);
                break;
        }

        return payroll;
    }

    private void CalculateCLT(Models.Payroll payroll)
    {
        // CLT: INSS + IRRF
        payroll.Inss = CalculateInss(payroll.GrossSalary);
        payroll.Items.Add(new PayrollItem
        {
            Description = "INSS",
            Type = ItemType.Deduction,
            Amount = payroll.Inss
        });

        var baseIrrf = payroll.GrossSalary - payroll.Inss;
        payroll.Irrf = CalculateIrrf(baseIrrf);
        payroll.Items.Add(new PayrollItem
        {
            Description = "IRRF",
            Type = ItemType.Deduction,
            Amount = payroll.Irrf
        });

        payroll.NetSalary = payroll.GrossSalary - payroll.Inss - payroll.Irrf;
    }

    private void CalculateIntern(Models.Payroll payroll)
    {
        // Estagiário: SEM INSS, SEM IRRF
        payroll.Inss = 0;
        payroll.Irrf = 0;
        payroll.NetSalary = payroll.GrossSalary;
        
        payroll.Items.Add(new PayrollItem
        {
            Description = "Bolsa de Estágio",
            Type = ItemType.Earning,
            Amount = payroll.GrossSalary
        });
    }

    private void CalculateApprentice(Models.Payroll payroll)
    {
        // Jovem Aprendiz: INSS reduzido, isento de IRRF
        payroll.Inss = CalculateInss(payroll.GrossSalary) * 0.5m; // 50% do INSS normal
        payroll.Irrf = 0;
        payroll.NetSalary = payroll.GrossSalary - payroll.Inss;
        
        payroll.Items.Add(new PayrollItem
        {
            Description = "INSS Aprendiz",
            Type = ItemType.Deduction,
            Amount = payroll.Inss
        });
        
        payroll.Items.Add(new PayrollItem
        {
            Description = "Salário Aprendiz",
            Type = ItemType.Earning,
            Amount = payroll.GrossSalary
        });
    }

    private void CalculatePJ(Models.Payroll payroll)
    {
        // PJ: SEM INSS, SEM IRRF
        payroll.Inss = 0;
        payroll.Irrf = 0;
        payroll.NetSalary = payroll.GrossSalary;
        
        payroll.Items.Add(new PayrollItem
        {
            Description = "Serviços PJ",
            Type = ItemType.Earning,
            Amount = payroll.GrossSalary
        });
    }

    private void CalculateTemporary(Models.Payroll payroll)
    {
        // Temporário: CLT normal
        CalculateCLT(payroll);
        
        // Adicionar observação
        payroll.Items.Add(new PayrollItem
        {
            Description = "Contrato Temporário",
            Type = ItemType.Earning,
            Amount = 0
        });
    }

    private decimal CalculateInss(decimal salary)
    {
        decimal inss = 0;
        decimal remainingSalary = salary;

        foreach (var range in TaxRates.InssRanges)
        {
            if (remainingSalary <= 0) break;

            var rangeValue = Math.Min(remainingSalary, range.Max - range.Min);
            if (range.Min > 0) rangeValue = Math.Min(remainingSalary, range.Max - range.Min);

            inss += rangeValue * range.Rate;
            remainingSalary -= rangeValue;
        }

        return Math.Min(inss, TaxRates.InssCeiling);
    }

    private decimal CalculateIrrf(decimal baseCalculo)
    {
        foreach (var range in TaxRates.IrrfRanges)
        {
            if (baseCalculo >= range.Min && baseCalculo <= range.Max)
            {
                return (baseCalculo * range.Rate) - range.Deduction;
            }
        }
        return 0;
    }
}