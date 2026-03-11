namespace Payroll.API.Models;

public class Employee
{
    public int Id { get; set; }
    public string Document { get; set; } = default!;
    public string FullName { get; set; } = default!;
    public string Email { get; set; } = default!;
    public DateOnly BirthDate { get; set; }
    public DateOnly HireDate { get; set; }
    public string? Department { get; set; }
    public string? Position { get; set; }
    public decimal? Salary { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}