using Payroll.API.Models;

namespace Payroll.API.Services;

public interface IPayrollCalculator
{
    Models.Payroll Calculate(int employeeId, int month, int year, decimal grossSalary);
}
