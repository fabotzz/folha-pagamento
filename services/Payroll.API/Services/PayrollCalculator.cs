using Payroll.API.Models;
using Payroll.API.Models.Enums;

namespace Payroll.API.Services;

public class PayrollCalculator : IPayrollCalculator
{
    public Models.Payroll Calculate(int employeeId, int month, int year, decimal grossSalary)
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

        // Calcular INSS
        payroll.Inss = CalculateInss(grossSalary);
        payroll.Items.Add(new PayrollItem
        {
            Description = "INSS",
            Type = ItemType.Deduction,
            Amount = payroll.Inss
        });

        // Calcular IRRF
        var baseIrrf = grossSalary - payroll.Inss;
        payroll.Irrf = CalculateIrrf(baseIrrf);
        payroll.Items.Add(new PayrollItem
        {
            Description = "IRRF",
            Type = ItemType.Deduction,
            Amount = payroll.Irrf
        });

        // Salário Líquido
        payroll.NetSalary = grossSalary - payroll.Inss - payroll.Irrf;

        return payroll;
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