using System;
using System.IO;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using AbanobLeague.Domain.Interfaces;
using AbanobLeague.Application.Interfaces;
using AbanobLeague.Infrastructure.Data;
using AbanobLeague.Infrastructure.Repositories;
using AbanobLeague.Infrastructure.Auth;

namespace AbanobLeague.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(
            this IServiceCollection services,
            IConfiguration configuration,
            string contentRootPath)
        {
            var configured = configuration.GetConnectionString("DefaultConnection") ?? "Data Source=AbanobLeague.db";
            var dbFile = configured.StartsWith("Data Source=", StringComparison.OrdinalIgnoreCase)
                ? configured["Data Source=".Length..].Trim()
                : configured.Trim();

            var dbPath = Path.IsPathRooted(dbFile)
                ? dbFile
                : Path.Combine(contentRootPath, dbFile);

            var connectionString = $"Data Source={dbPath}";

            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlite(
                    connectionString,
                    b => b.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName)
                )
            );

            services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IPasswordHasher, PasswordHasher>();
            services.AddScoped<ITokenService, TokenService>();

            return services;
        }
    }
}
