using Microsoft.EntityFrameworkCore;
using AbanobLeague.Domain.Entities;
using AbanobLeague.Domain.Enums;
using System;

namespace AbanobLeague.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Season> Seasons => Set<Season>();
        public DbSet<Team> Teams => Set<Team>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Score> Scores => Set<Score>();
        public DbSet<AdminUser> AdminUsers => Set<AdminUser>();
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
        public DbSet<RankingSnapshot> RankingSnapshots => Set<RankingSnapshot>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Season Configuration
            modelBuilder.Entity<Season>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(150);
                entity.Property(e => e.Description).HasMaxLength(500);
            });

            // Team Configuration
            modelBuilder.Entity<Team>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(150);
                entity.Property(e => e.LogoUrl).HasMaxLength(500);
                entity.Property(e => e.Description).HasMaxLength(500);

                entity.HasOne(t => t.Season)
                    .WithMany(s => s.Teams)
                    .HasForeignKey(t => t.SeasonId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Category Configuration
            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);

                entity.HasOne(c => c.Season)
                    .WithMany(s => s.Categories)
                    .HasForeignKey(c => c.SeasonId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Score Configuration
            modelBuilder.Entity<Score>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Notes).HasMaxLength(500);

                entity.HasOne(s => s.Team)
                    .WithMany(t => t.Scores)
                    .HasForeignKey(s => s.TeamId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(s => s.Category)
                    .WithMany(c => c.Scores)
                    .HasForeignKey(s => s.CategoryId)
                    .OnDelete(DeleteBehavior.Cascade); 
                    
                // Unique index to prevent duplicate scores for team + category
                entity.HasIndex(s => new { s.TeamId, s.CategoryId }).IsUnique();
            });

            // AdminUser Configuration
            modelBuilder.Entity<AdminUser>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.FullName).IsRequired().HasMaxLength(150);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(150);
                entity.Property(e => e.PasswordHash).IsRequired().HasMaxLength(500);
                entity.Property(e => e.RefreshToken).HasMaxLength(500);

                entity.HasIndex(e => e.Email).IsUnique();

                // Convert role enum to string in Db
                entity.Property(e => e.Role)
                    .HasConversion(
                        v => v.ToString(),
                        v => (AdminRole)Enum.Parse(typeof(AdminRole), v)
                    );
            });

            // AuditLog Configuration
            modelBuilder.Entity<AuditLog>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Action).IsRequired().HasMaxLength(100);
                entity.Property(e => e.EntityName).IsRequired().HasMaxLength(100);
            });

            // RankingSnapshot Configuration
            modelBuilder.Entity<RankingSnapshot>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasOne(rs => rs.Team)
                    .WithMany()
                    .HasForeignKey(rs => rs.TeamId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(rs => rs.Season)
                    .WithMany()
                    .HasForeignKey(rs => rs.SeasonId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
