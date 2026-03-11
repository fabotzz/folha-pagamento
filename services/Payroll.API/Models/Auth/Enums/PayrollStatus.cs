namespace Payroll.API.Models.Enums;

public enum PayrollStatus
{
    Calculated = 0,
    Paid = 1,
    Cancelled = 2
}

public enum ItemType
{
    Earning = 1,      // Provento
    Deduction = 2      // Desconto
}