using Payroll.API.Models.Enums;

namespace Payroll.API.Models;

public class Payroll
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal GrossSalary { get; set; }
    public decimal Inss { get; set; }
    public decimal Irrf { get; set; }
    public decimal NetSalary { get; set; }
    public PayrollStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? PaidAt { get; set; }

    // Relacionamentos
    public virtual ICollection<PayrollItem> Items { get; set; } = new List<PayrollItem>();
}