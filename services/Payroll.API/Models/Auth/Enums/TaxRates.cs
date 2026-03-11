using System.Collections.Generic;

namespace Payroll.API.Models.Enums;

public static class TaxRates
{
    // Tabela INSS 2024
    public static readonly List<InssRange> InssRanges = new()
    {
        new InssRange(0, 1412.00m, 0.075m),
        new InssRange(1412.01m, 2666.68m, 0.09m),
        new InssRange(2666.69m, 4000.03m, 0.12m),
        new InssRange(4000.04m, 7786.02m, 0.14m)
    };

    public const decimal InssCeiling = 908.85m;

    // Tabela IRRF 2024
    public static readonly List<IrrfRange> IrrfRanges = new()
    {
        new IrrfRange(0, 2259.20m, 0, 0),
        new IrrfRange(2259.21m, 2826.65m, 0.075m, 169.44m),
        new IrrfRange(2826.66m, 3751.05m, 0.15m, 381.44m),
        new IrrfRange(3751.06m, 4664.68m, 0.225m, 662.77m),
        new IrrfRange(4664.69m, decimal.MaxValue, 0.275m, 896.00m)
    };
}

public class InssRange
{
    public decimal Min { get; }
    public decimal Max { get; }
    public decimal Rate { get; }

    public InssRange(decimal min, decimal max, decimal rate)
    {
        Min = min;
        Max = max;
        Rate = rate;
    }
}

public class IrrfRange
{
    public decimal Min { get; }
    public decimal Max { get; }
    public decimal Rate { get; }
    public decimal Deduction { get; }

    public IrrfRange(decimal min, decimal max, decimal rate, decimal deduction)
    {
        Min = min;
        Max = max;
        Rate = rate;
        Deduction = deduction;
    }
}
