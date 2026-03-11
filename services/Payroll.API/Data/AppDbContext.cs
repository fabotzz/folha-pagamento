using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Payroll.API.Models;
using Payroll.API.Models.Auth;
using Payroll.API.Models.Enums;

namespace Payroll.API.Data;

public class AppDbContext : IdentityDbContext<User, IdentityRole<int>, int>  // Mudei aqui!
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    { }

    // DbSets existentes (mantém igual)
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Models.Payroll> Payrolls { get; set; }
    public DbSet<PayrollItem> PayrollItems { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);  // Chama o base primeiro!

        // Configuração do Employee
        modelBuilder.Entity<Employee>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Document)
                .IsRequired()
                .HasMaxLength(14);

            entity.Property(e => e.FullName)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(e => e.Email)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.Department)
                .HasMaxLength(100);

            entity.Property(e => e.Position)
                .HasMaxLength(100);

            entity.Property(e => e.Salary)
                .HasPrecision(18, 2);

            entity.HasIndex(e => e.Document)
                .IsUnique();

            entity.HasIndex(e => e.Email)
                .IsUnique();
        });

        // Configuração do Payroll
        modelBuilder.Entity<Models.Payroll>(entity =>
        {
            entity.HasKey(p => p.Id);

            entity.Property(p => p.GrossSalary)
                .HasPrecision(18, 2)
                .IsRequired();

            entity.Property(p => p.Inss)
                .HasPrecision(18, 2)
                .IsRequired();

            entity.Property(p => p.Irrf)
                .HasPrecision(18, 2)
                .IsRequired();

            entity.Property(p => p.NetSalary)
                .HasPrecision(18, 2)
                .IsRequired();

            entity.Property(p => p.CreatedAt)
                .IsRequired();

            entity.HasIndex(p => new { p.EmployeeId, p.Month, p.Year })
                  .IsUnique();

            entity.HasMany(p => p.Items)
                  .WithOne(i => i.Payroll)
                  .HasForeignKey(i => i.PayrollId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne<Employee>()
                  .WithMany()
                  .HasForeignKey(p => p.EmployeeId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Configuração do PayrollItem
        modelBuilder.Entity<PayrollItem>(entity =>
        {
            entity.HasKey(i => i.Id);

            entity.Property(i => i.Description)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(i => i.Amount)
                .HasPrecision(18, 2)
                .IsRequired();
        });

        // Configuração do relacionamento User-Employee
        modelBuilder.Entity<User>()
            .HasOne(u => u.Employee)
            .WithOne()
            .HasForeignKey<User>(u => u.EmployeeId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}