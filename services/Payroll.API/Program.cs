using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Payroll.API.Data;
using Payroll.API.Models.Auth;
using Payroll.API.Services;
using Payroll.API.Services.Auth;
using Payroll.API.Models;
using System.Text;
using Payroll.API.Extensions;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Configurar PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configurar Identity (política de senha simplificada)
builder.Services.AddIdentity<User, IdentityRole<int>>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 1;
    options.Password.RequiredUniqueChars = 0;
})
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

// NOTE: Authentication is disabled in development — we simulate an Admin user for every request.
// Keep authorization services so [Authorize] attributes still evaluate roles/policies.
builder.Services.AddAuthorization();

// Registrar serviços
builder.Services.AddScoped<IPayrollCalculator, PayrollCalculator>();
builder.Services.AddScoped<IAuthService, AuthService>();

// Configurar CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        builder =>
        {
            builder.WithOrigins("http://localhost:4200")
                   .AllowAnyHeader()
                   .AllowAnyMethod()
                   .AllowCredentials();
        });
});

// Configurar Swagger usando a classe de extensão
builder.Services.AddSwaggerConfiguration();

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseHttpsRedirection();
// Serve static files so our custom Swagger UI script can be loaded from wwwroot
app.UseStaticFiles();
app.UseCors("AllowAngularApp");

// In Development simulate an Admin user for every request so frontend can act as Admin
if (app.Environment.IsDevelopment())
{
    app.Use(async (context, next) =>
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, "0"),
            new Claim(ClaimTypes.Email, "admin@local"),
            new Claim("fullName", "Admin Dev"),
            new Claim(ClaimTypes.Role, "Admin")
        };

        context.User = new ClaimsPrincipal(new ClaimsIdentity(claims, "Dev"));
        await next();
    });
}

app.UseAuthorization();
app.MapControllers();

if (app.Environment.IsDevelopment())
{
    app.UseSwaggerConfiguration(app.Environment);
}

// Criar roles iniciais
using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<int>>>();
    var roles = new[] { "Admin", "RH", "Employee" };

    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new IdentityRole<int> { Name = role });
        }
    }
}

app.Run();