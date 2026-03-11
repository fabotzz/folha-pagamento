using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Payroll.API.DTOs.Auth;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Payroll.API.Controllers;

[ApiController]
[Route("api/dev/auth")]
public class DevAuthController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly IHostEnvironment _env;

    public DevAuthController(IConfiguration configuration, IHostEnvironment env)
    {
        _configuration = configuration;
        _env = env;
    }

    // Development-only token generator to simulate login as any role (Admin/RH/Employee)
    [HttpPost("token")]
    public ActionResult<AuthResponseDto> GetToken(DevTokenRequest request)
    {
        if (!_env.IsDevelopment())
            return NotFound();

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, "0"),
            new Claim(JwtRegisteredClaimNames.Email, request.Email ?? "dev@local"),
            new Claim("fullName", request.FullName ?? "Developer"),
            new Claim("role", request.Role ?? "Admin")
        };

        // add role claim for authorization
        claims.Add(new Claim(ClaimTypes.Role, request.Role ?? "Admin"));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "dev_key_please_change"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddDays(7);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: expires,
            signingCredentials: creds
        );

        var jwt = new JwtSecurityTokenHandler().WriteToken(token);

        return Ok(new AuthResponseDto
        {
            Id = 0,
            FullName = request.FullName ?? "Developer",
            Email = request.Email ?? "dev@local",
            Role = request.Role ?? "Admin",
            Token = jwt,
            EmployeeId = null
        });
    }

    public class DevTokenRequest
    {
        public string? Email { get; set; }
        public string? FullName { get; set; }
        public string? Role { get; set; }
    }
}
