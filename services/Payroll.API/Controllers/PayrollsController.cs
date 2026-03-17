using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Payroll.API.Data;
using Payroll.API.Models;
using Payroll.API.Models.Enums;
using Payroll.API.DTOs;
using Payroll.API.Services;

namespace Payroll.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PayrollsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IPayrollCalculator _calculator;

    // REMOVIDO o HttpClient do construtor
    public PayrollsController(
        AppDbContext context,
        IPayrollCalculator calculator)
    {
        _context = context;
        _calculator = calculator;
    }

    // GET: api/payrolls
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PayrollDto>>> GetPayrolls()
    {
        var payrolls = await _context.Payrolls
            .Include(p => p.Items)
            .OrderByDescending(p => p.Year)
            .ThenByDescending(p => p.Month)
            .ToListAsync();

        // Buscar nomes dos funcionários do BANCO DE DADOS
        var employeeIds = payrolls.Select(p => p.EmployeeId).Distinct();
        var employeeNames = await GetEmployeeNames(employeeIds);

        var result = payrolls.Select(p => MapToDto(p, employeeNames));
        return Ok(result);
    }

    // GET: api/payrolls/5
    [HttpGet("{id}")]
    public async Task<ActionResult<PayrollDto>> GetPayroll(int id)
    {
        var payroll = await _context.Payrolls
            .Include(p => p.Items)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (payroll == null)
            return NotFound();

        var employeeName = await GetEmployeeName(payroll.EmployeeId);
        return Ok(MapToDto(payroll, new Dictionary<int, string>
        {
            { payroll.EmployeeId, employeeName }
        }));
    }

    // GET: api/payrolls/employee/5
    [HttpGet("employee/{employeeId}")]
    public async Task<ActionResult<IEnumerable<PayrollDto>>> GetPayrollsByEmployee(int employeeId)
    {
        var payrolls = await _context.Payrolls
            .Include(p => p.Items)
            .Where(p => p.EmployeeId == employeeId)
            .OrderByDescending(p => p.Year)
            .ThenByDescending(p => p.Month)
            .ToListAsync();

        var employeeName = await GetEmployeeName(employeeId);
        var employeeNames = new Dictionary<int, string> { { employeeId, employeeName } };

        var result = payrolls.Select(p => MapToDto(p, employeeNames));
        return Ok(result);
    }

    // POST: api/payrolls/calculate
    [HttpPost("calculate")]
    public async Task<ActionResult<PayrollDto>> CalculatePayrollAsync(CreatePayrollDto dto)
    {
        // Verificar se já existe folha para este período
        var exists = await _context.Payrolls
            .AnyAsync(p => p.EmployeeId == dto.EmployeeId &&
                          p.Month == dto.Month &&
                          p.Year == dto.Year);

        if (exists)
            return BadRequest("Já existe uma folha de pagamento para este funcionário no período selecionado");

        // Buscar o funcionário para obter o EmploymentType e validar existência
        var employee = await _context.Employees.FindAsync(dto.EmployeeId);
        if (employee == null)
            return BadRequest("Funcionário não encontrado");

        // Calcular a folha passando o EmploymentType
        var payroll = _calculator.Calculate(
            dto.EmployeeId,
            dto.Month,
            dto.Year,
            dto.GrossSalary,
            employee.EmploymentType
        );

        // Salvar no banco
        _context.Payrolls.Add(payroll);
        await _context.SaveChangesAsync();

        // Mapear para DTO e retornar
        var employeeName = employee.FullName;
        return CreatedAtAction(nameof(GetPayroll), new { id = payroll.Id },
            MapToDto(payroll, new Dictionary<int, string> { { dto.EmployeeId, employeeName } }));
    }

    // PATCH: api/payrolls/5/status
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, UpdatePayrollStatusDto dto)
    {
        var payroll = await _context.Payrolls.FindAsync(id);
        if (payroll == null)
            return NotFound();

        payroll.Status = dto.Status;
        if (dto.Status == PayrollStatus.Paid)
            payroll.PaidAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/payrolls/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePayroll(int id)
    {
        var payroll = await _context.Payrolls.FindAsync(id);
        if (payroll == null)
            return NotFound();

        _context.Payrolls.Remove(payroll);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    #region Métodos Privados - CORRIGIDOS para usar o banco de dados

    private async Task<bool> CheckEmployeeExists(int employeeId)
    {
        return await _context.Employees.AnyAsync(e => e.Id == employeeId);
    }

    private async Task<string> GetEmployeeName(int employeeId)
    {
        var employee = await _context.Employees.FindAsync(employeeId);
        return employee?.FullName ?? "Não encontrado";
    }

    private async Task<Dictionary<int, string>> GetEmployeeNames(IEnumerable<int> employeeIds)
    {
        return await _context.Employees
            .Where(e => employeeIds.Contains(e.Id))
            .ToDictionaryAsync(e => e.Id, e => e.FullName);
    }

    private static PayrollDto MapToDto(Models.Payroll payroll, Dictionary<int, string> employeeNames)
    {
        return new PayrollDto
        {
            Id = payroll.Id,
            EmployeeId = payroll.EmployeeId,
            EmployeeName = employeeNames.GetValueOrDefault(payroll.EmployeeId, "Não encontrado"),
            Month = payroll.Month,
            Year = payroll.Year,
            GrossSalary = payroll.GrossSalary,
            Inss = payroll.Inss,
            Irrf = payroll.Irrf,
            NetSalary = payroll.NetSalary,
            Status = payroll.Status,
            CreatedAt = payroll.CreatedAt,
            Items = payroll.Items.Select(i => new PayrollItemDto
            {
                Id = i.Id,
                Description = i.Description,
                Type = i.Type,
                Amount = i.Amount
            }).ToList()
        };
    }


    #endregion
}