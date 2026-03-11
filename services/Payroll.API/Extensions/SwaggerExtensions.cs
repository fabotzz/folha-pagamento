using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
// Deliberately avoid direct usage of Microsoft.OpenApi.Models to maintain
// compatibility with multiple SDK/package versions. We inject a custom
// Swagger UI script instead to provide an Authorize button for development.
using System.Collections.Generic;

namespace Payroll.API.Extensions;

public static class SwaggerExtensions
{
    public static IServiceCollection AddSwaggerConfiguration(this IServiceCollection services)
    {
        // Basic registration without referencing OpenApi model types.
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();

        return services;
    }

    public static IApplicationBuilder UseSwaggerConfiguration(this IApplicationBuilder app, IHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "Payroll API V1");
                c.RoutePrefix = "swagger";
                // Inject a small custom script that adds an Authorize button
                // to the Swagger UI. The script is served from wwwroot/swagger-ui/custom.js
                c.InjectJavascript("/swagger-ui/custom.js");
            });
        }

        return app;
    }
}