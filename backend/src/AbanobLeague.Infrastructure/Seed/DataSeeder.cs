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

            // Seed Seasons
            if (!await context.Seasons.AnyAsync())
            {
                var pastSeason = new Season
                {
                    Id = Guid.NewGuid(),
                    Name = "دوري القديس أبانوب 2025",
                    Description = "الموسم السابق من دوري القديس أبانوب للشباب",
                    StartDate = DateTime.UtcNow.AddYears(-1).AddMonths(-2),
                    EndDate = DateTime.UtcNow.AddYears(-1).AddMonths(2),
                    IsActive = false,
                    CreatedAt = DateTime.UtcNow.AddYears(-1).AddMonths(-3)
                };

                var activeSeason = new Season
                {
                    Id = Guid.NewGuid(),
                    Name = "دوري القديس أبانوب 2026",
                    Description = "الموسم الحالي لدوري كنيسة القديس أبانوب",
                    StartDate = DateTime.UtcNow.AddDays(-10),
                    EndDate = DateTime.UtcNow.AddDays(80),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-15)
                };

                await context.Seasons.AddAsync(pastSeason);
                await context.Seasons.AddAsync(activeSeason);
                await context.SaveChangesAsync();

                // Seed Categories for Active Season
                var categories = new List<Category>
                {
                    new Category { Id = Guid.NewGuid(), Name = "ألحان", MaxScore = 50, Order = 1, SeasonId = activeSeason.Id },
                    new Category { Id = Guid.NewGuid(), Name = "طقس", MaxScore = 40, Order = 2, SeasonId = activeSeason.Id },
                    new Category { Id = Guid.NewGuid(), Name = "كتاب مقدس", MaxScore = 60, Order = 3, SeasonId = activeSeason.Id },
                    new Category { Id = Guid.NewGuid(), Name = "قبطي", MaxScore = 30, Order = 4, SeasonId = activeSeason.Id },
                    new Category { Id = Guid.NewGuid(), Name = "روحيات", MaxScore = 50, Order = 5, SeasonId = activeSeason.Id },
                    new Category { Id = Guid.NewGuid(), Name = "التزام", MaxScore = 20, Order = 6, SeasonId = activeSeason.Id },
                    new Category { Id = Guid.NewGuid(), Name = "كرة قدم", MaxScore = 50, Order = 7, SeasonId = activeSeason.Id }
                };

                // Seed Categories for Past Season
                var pastCategories = new List<Category>
                {
                    new Category { Id = Guid.NewGuid(), Name = "ألحان", MaxScore = 50, Order = 1, SeasonId = pastSeason.Id },
                    new Category { Id = Guid.NewGuid(), Name = "طقس", MaxScore = 40, Order = 2, SeasonId = pastSeason.Id },
                    new Category { Id = Guid.NewGuid(), Name = "كتاب مقدس", MaxScore = 60, Order = 3, SeasonId = pastSeason.Id },
                    new Category { Id = Guid.NewGuid(), Name = "كرة قدم", MaxScore = 50, Order = 7, SeasonId = pastSeason.Id }
                };

                await context.Categories.AddRangeAsync(categories);
                await context.Categories.AddRangeAsync(pastCategories);
                await context.SaveChangesAsync();

                // Seed Teams for Active Season (10 Teams)
                var teamNames = new[]
                {
                    "فريق مارمرقس", "فريق مارجرجس", "فريق الأنبا أنطونيوس",
                    "فريق الأنبا بيشوي", "فريق الأنبا كاراس", "فريق الشهيد أبانوب",
                    "فريق رئيس الملائكة ميخائيل", "فريق تادرس الشطبي", "فريق أبي سيفين",
                    "فريق القديسة دميانة"
                };

                var teams = teamNames.Select((name, index) => new Team
                {
                    Id = Guid.NewGuid(),
                    Name = name,
                    LogoUrl = $"/uploads/logos/default-team-{index + 1}.png",
                    Description = $"فريق {name} المشارك في دوري القديس أبانوب 2026",
                    SeasonId = activeSeason.Id,
                    CreatedAt = DateTime.UtcNow.AddDays(-14)
                }).ToList();

                await context.Teams.AddRangeAsync(teams);
                await context.SaveChangesAsync();

                // Seed Teams for Past Season (5 Teams)
                var pastTeams = new[] { "فريق البابا كيرلس", "فريق البابا شنودة", "فريق القديس أغسطينوس", "فريق القديس أثناسيوس" }
                    .Select((name, index) => new Team
                    {
                        Id = Guid.NewGuid(),
                        Name = name,
                        LogoUrl = $"/uploads/logos/default-team-past-{index + 1}.png",
                        Description = $"فريق {name} المشارك في دوري القديس أبانوب 2025",
                        SeasonId = pastSeason.Id,
                        CreatedAt = DateTime.UtcNow.AddYears(-1).AddMonths(-2)
                    }).ToList();

                await context.Teams.AddRangeAsync(pastTeams);
                await context.SaveChangesAsync();

                // Seed Scores for Active Season
                // Generate realistic scores: random values within bounds
                var rand = new Random();
                var scores = new List<Score>();

                foreach (var team in teams)
                {
                    foreach (var cat in categories)
                    {
                        // Some categories might not have scores yet for all teams, but let's seed most of them
                        // 90% chance to have a score
                        if (rand.NextDouble() > 0.1)
                        {
                            // Scores are usually in the upper 60% to 100% range of MaxScore to make it realistic
                            int minPossible = (int)(cat.MaxScore * 0.6);
                            int scoreVal = rand.Next(minPossible, cat.MaxScore + 1);

                            scores.Add(new Score
                            {
                                Id = Guid.NewGuid(),
                                TeamId = team.Id,
                                CategoryId = cat.Id,
                                ScoreValue = scoreVal,
                                Notes = scoreVal == cat.MaxScore ? "أداء ممتاز وعلامة كاملة!" : "أداء جيد جداً",
                                UpdatedAt = DateTime.UtcNow.AddDays(-rand.Next(0, 10))
                            });
                        }
                    }
                }

                await context.Scores.AddRangeAsync(scores);
                await context.SaveChangesAsync();

                // Seed Scores for Past Season (100% scored)
                var pastScores = new List<Score>();
                foreach (var team in pastTeams)
                {
                    foreach (var cat in pastCategories)
                    {
                        int minPossible = (int)(cat.MaxScore * 0.6);
                        int scoreVal = rand.Next(minPossible, cat.MaxScore + 1);
                        pastScores.Add(new Score
                        {
                            Id = Guid.NewGuid(),
                            TeamId = team.Id,
                            CategoryId = cat.Id,
                            ScoreValue = scoreVal,
                            Notes = "تم التقييم بنجاح",
                            UpdatedAt = pastSeason.EndDate.AddDays(-5)
                        });
                    }
                }
                await context.Scores.AddRangeAsync(pastScores);
                await context.SaveChangesAsync();

                // Generate snapshots for both seasons
                await GenerateSnapshotsForSeasonAsync(context, activeSeason.Id, categories, teams, scores);
                await GenerateSnapshotsForSeasonAsync(context, pastSeason.Id, pastCategories, pastTeams, pastScores);
            }
        }

        private static async Task GenerateSnapshotsForSeasonAsync(
            AppDbContext context, Guid seasonId, List<Category> categories, List<Team> teams, List<Score> scores)
        {
            var catIds = categories.Select(c => c.Id).ToHashSet();
            var seasonScores = scores.Where(s => catIds.Contains(s.CategoryId)).ToList();

            var teamTotals = teams.Select(t => new TeamTotal
            {
                TeamId = t.Id,
                Total = seasonScores.Where(s => s.TeamId == t.Id).Sum(s => s.ScoreValue)
            })
            .OrderByDescending(x => x.Total)
            .ToList();

            // Store current snapshot
            int rank = 1;
            var snapshots = new List<RankingSnapshot>();
            var snapshotDate = DateTime.UtcNow.AddHours(-1); // One hour ago

            for (int i = 0; i < teamTotals.Count; i++)
            {
                if (i > 0 && teamTotals[i].Total < teamTotals[i - 1].Total)
                {
                    rank = i + 1;
                }

                snapshots.Add(new RankingSnapshot
                {
                    Id = Guid.NewGuid(),
                    TeamId = teamTotals[i].TeamId,
                    SeasonId = seasonId,
                    Rank = rank,
                    TotalScore = teamTotals[i].Total,
                    SnapshotDate = snapshotDate
                });
            }

            // Let's also store an older snapshot (e.g., 2 days ago) with slightly different ranks to demonstrate movement!
            var olderSnapshotDate = DateTime.UtcNow.AddDays(-2);
            int oldRank = 1;

            // Scramble team totals slightly for old snapshots
            var shuffledTotals = teamTotals.Select((t, index) => new TeamTotal
            {
                TeamId = t.TeamId,
                Total = t.Total - (index % 3 == 0 ? 5 : 0) + (index % 4 == 0 ? 3 : 0)
            })
            .OrderByDescending(x => x.Total)
            .ToList();

            for (int i = 0; i < shuffledTotals.Count; i++)
            {
                if (i > 0 && shuffledTotals[i].Total < shuffledTotals[i - 1].Total)
                {
                    oldRank = i + 1;
                }

                snapshots.Add(new RankingSnapshot
                {
                    Id = Guid.NewGuid(),
                    TeamId = shuffledTotals[i].TeamId,
                    SeasonId = seasonId,
                    Rank = oldRank,
                    TotalScore = shuffledTotals[i].Total,
                    SnapshotDate = olderSnapshotDate
                });
            }

            await context.RankingSnapshots.AddRangeAsync(snapshots);
            await context.SaveChangesAsync();
        }

        private class TeamTotal
        {
            public Guid TeamId { get; set; }
            public int Total { get; set; }
        }
    }
}
