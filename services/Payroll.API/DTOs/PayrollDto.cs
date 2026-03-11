using System;
using System.Collections.Generic;
using Payroll.API.Models;
using Payroll.API.Models.Enums;

namespace Payroll.API.DTOs;

public class PayrollDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string? EmployeeName { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal GrossSalary { get; set; }
    public decimal Inss { get; set; }
    public decimal Irrf { get; set; }
    public decimal NetSalary { get; set; }
    public PayrollStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<PayrollItemDto> Items { get; set; } = new();
}

public class CreatePayrollDto
{
    public int EmployeeId { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal GrossSalary { get; set; }
}

public class PayrollItemDto
{
    public int Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public ItemType Type { get; set; }
    public decimal Amount { get; set; }
}

public class UpdatePayrollStatusDto
{
    public PayrollStatus Status { get; set; }
}