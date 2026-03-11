using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Payroll.API.Data;
using Payroll.API.Models;

namespace Payroll.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class EmployeesController : ControllerBase
{
    private readonly AppDbContext _context;

    public EmployeesController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/employees
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Employee>>> GetEmployees()
    {
        return await _context.Employees.ToListAsync();
    }

    // GET: api/employees/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Employee>> GetEmployee(int id)
    {
        var employee = await _context.Employees.FindAsync(id);

        if (employee == null)
        {
            return NotFound();
        }

        return employee;
    }

    // GET: api/employees/document/{document}
    [HttpGet("document/{document}")]
    public async Task<ActionResult<Employee>> GetEmployeeByDocument(string document)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Document == document);

        if (employee == null)
        {
            return NotFound();
        }

        return employee;
    }

    // POST: api/employees
    [HttpPost]
    public async Task<ActionResult<Employee>> PostEmployee(Employee employee)
    {
        // Verificar se já existe funcionário com mesmo documento
        if (await _context.Employees.AnyAsync(e => e.Document == employee.Document))
        {
            return Conflict("Já existe um funcionário com este documento");
        }

        // Verificar se já existe funcionário com mesmo email
        if (await _context.Employees.AnyAsync(e => e.Email == employee.Email))
        {
            return Conflict("Já existe um funcionário com este email");
        }

        employee.CreatedAt = DateTime.UtcNow;
        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetEmployee), new { id = employee.Id }, employee);
    }

    // PUT: api/employees/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutEmployee(int id, Employee employee)
    {
        if (id != employee.Id)
        {
            return BadRequest();
        }

        // Verificar se documento já existe para outro funcionário
        if (await _context.Employees.AnyAsync(e => e.Document == employee.Document && e.Id != id))
        {
            return Conflict("Já existe um funcionário com este documento");
        }

        // Verificar se email já existe para outro funcionário
        if (await _context.Employees.AnyAsync(e => e.Email == employee.Email && e.Id != id))
        {
            return Conflict("Já existe um funcionário com este email");
        }

        employee.UpdatedAt = DateTime.UtcNow;
        _context.Entry(employee).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!EmployeeExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    // DELETE: api/employees/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEmployee(int id)
    {
        var employee = await _context.Employees.FindAsync(id);
        if (employee == null)
        {
            return NotFound();
        }

        // Soft delete - apenas marcar como inativo
        employee.IsActive = false;
        employee.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool EmployeeExists(int id)
    {
        return _context.Employees.Any(e => e.Id == id);
    }
}