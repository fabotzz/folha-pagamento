using Payroll.API.Models.Enums;

namespace Payroll.API.Models;

public class PayrollItem
{
    public int Id { get; set; }
    public int PayrollId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public ItemType Type { get; set; }

    // Propriedade de navegação
    public virtual Payroll? Payroll { get; set; }
}