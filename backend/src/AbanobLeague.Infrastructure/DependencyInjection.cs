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
            var connectionString = configuration.GetConnectionString("DefaultConnection") ?? "Host=localhost;Database=AbanobLeague;Username=postgres;Password=postgres";

            services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(
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
