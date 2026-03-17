using Payroll.API.Models.Enums;

namespace Payroll.API.Services;

public interface IPayrollCalculator
{
    Models.Payroll Calculate(int employeeId, int month, int year, decimal grossSalary, EmploymentType employmentType);
}