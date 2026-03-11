using Microsoft.AspNetCore.Identity;
using Payroll.API.Models;

namespace Payroll.API.Models.Auth;

public class User : IdentityUser<int>
{
    public string FullName { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public int? EmployeeId { get; set; }

    // Relacionamento opcional com Employee
    public Employee? Employee { get; set; }
}

public enum UserRole
{
    Admin = 1,
    RH = 2,
    Employee = 3
}