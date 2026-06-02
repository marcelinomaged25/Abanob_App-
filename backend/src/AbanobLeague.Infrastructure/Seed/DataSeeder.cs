using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using AbanobLeague.Domain.Entities;
using AbanobLeague.Domain.Enums;
using AbanobLeague.Application.Interfaces;
using AbanobLeague.Infrastructure.Data;

namespace AbanobLeague.Infrastructure.Seed
{
    public static class DataSeeder
    {
        public static async Task SeedAsync(AppDbContext context, IPasswordHasher passwordHasher)
        {
            // Seed Admin User
            if (!await context.AdminUsers.AnyAsync())
            {
                var admin = new AdminUser
                {
                    Id = Guid.NewGuid(),
                    FullName = "أدمن الدوري",
                    Email = "admin@abanob.com",
                    PasswordHash = passwordHasher.HashPassword("Admin@123456"),
                    Role = AdminRole.SuperAdmin,
                    CreatedAt = DateTime.UtcNow
                };
                await context.AdminUsers.AddAsync(admin);
                await context.SaveChangesAsync();
            }
        }
    }
}
