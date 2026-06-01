using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AbanobLeague.Application.DTOs.Analytics;
using AbanobLeague.Application.Interfaces;
using AbanobLeague.Domain.Entities;
using AbanobLeague.Domain.Interfaces;

namespace AbanobLeague.Application.Services
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly IUnitOfWork _unitOfWork;

        public AnalyticsService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<AnalyticsDto> GetAnalyticsAsync(Guid seasonId)
        {
            var teams = (await _unitOfWork.Teams.FindAsync(t => t.SeasonId == seasonId)).ToList();
            var categories = (await _unitOfWork.Categories.FindAsync(c => c.SeasonId == seasonId)).ToList();
            var allScores = await _unitOfWork.Scores.GetAllAsync();
            var catIds = categories.Select(c => c.Id).ToHashSet();
            var scores = allScores.Where(s => catIds.Contains(s.CategoryId)).ToList();

            var teamScoresMap = scores.GroupBy(s => s.TeamId).ToDictionary(g => g.Key, g => g.ToList());
            var categoryScoresMap = scores.GroupBy(s => s.CategoryId).ToDictionary(g => g.Key, g => g.ToList());

            if (!teams.Any() || !categories.Any())
            {
                return new AnalyticsDto();
            }

            // Calculate total scores per team
            var teamTotals = teams.Select(t =>
            {
                teamScoresMap.TryGetValue(t.Id, out var ts);
                ts ??= new List<Score>();
                int total = ts.Sum(s => s.ScoreValue);
                return new { Team = t, Total = total, Scores = ts };
            }).ToList();

            // Highest & Lowest Scoring Teams
            var sortedTotals = teamTotals.OrderByDescending(t => t.Total).ToList();
            var bestTeam = sortedTotals.FirstOrDefault();
            var worstTeam = sortedTotals.LastOrDefault();

            TeamMetricDto? highestScoring = null;
            if (bestTeam != null)
            {
                highestScoring = new TeamMetricDto
                {
                    TeamId = bestTeam.Team.Id,
                    TeamName = bestTeam.Team.Name,
                    LogoUrl = bestTeam.Team.LogoUrl,
                    Value = bestTeam.Total,
                    Detail = $"مجموع نقاط: {bestTeam.Total}"
                };
            }

            TeamMetricDto? lowestScoring = null;
            if (worstTeam != null && worstTeam.Team.Id != bestTeam?.Team.Id)
            {
                lowestScoring = new TeamMetricDto
                {
                    TeamId = worstTeam.Team.Id,
                    TeamName = worstTeam.Team.Name,
                    LogoUrl = worstTeam.Team.LogoUrl,
                    Value = worstTeam.Total,
                    Detail = $"مجموع نقاط: {worstTeam.Total}"
                };
            }

            // Most Consistent Team: lowest standard deviation across categories
            // Note: Only calculate for teams that have scored in at least 2 categories
            TeamMetricDto? mostConsistent = null;
            double minStdDev = double.MaxValue;
            Team? consistentTeam = null;

            foreach (var tt in teamTotals)
            {
                if (tt.Scores.Count < 2) continue;

                // Standard deviation of scores as percentages of max scores
                var percentages = tt.Scores.Select(s =>
                {
                    var cat = categories.FirstOrDefault(c => c.Id == s.CategoryId);
                    if (cat == null || cat.MaxScore == 0) return 0.0;
                    return ((double)s.ScoreValue / cat.MaxScore) * 100;
                }).ToList();

                double mean = percentages.Average();
                double variance = percentages.Select(p => Math.Pow(p - mean, 2)).Sum() / percentages.Count;
                double stdDev = Math.Sqrt(variance);

                if (stdDev < minStdDev)
                {
                    minStdDev = stdDev;
                    consistentTeam = tt.Team;
                }
            }

            if (consistentTeam != null)
            {
                mostConsistent = new TeamMetricDto
                {
                    TeamId = consistentTeam.Id,
                    TeamName = consistentTeam.Name,
                    LogoUrl = consistentTeam.LogoUrl,
                    Value = Math.Round(minStdDev, 2),
                    Detail = $"انحراف معياري: {Math.Round(minStdDev, 1)}%"
                };
            }

            // Strongest Category (Highest Average Percentage Score)
            CategoryMetricDto? strongestCat = null;
            double maxAvgPercentage = -1;

            // Most Competitive Category (Lowest Standard Deviation of scores in the category across teams)
            CategoryMetricDto? mostCompetitiveCat = null;
            double minCatStdDev = double.MaxValue;

            var catAverages = new List<CategoryAverageDto>();

            foreach (var cat in categories)
            {
                categoryScoresMap.TryGetValue(cat.Id, out var catScores);
                catScores ??= new List<Score>();

                if (!catScores.Any()) continue;

                // Average score
                double avg = catScores.Average(s => s.ScoreValue);
                double avgPercentage = cat.MaxScore > 0 ? (avg / cat.MaxScore) * 100 : 0;

                catAverages.Add(new CategoryAverageDto
                {
                    CategoryId = cat.Id,
                    CategoryName = cat.Name,
                    AverageScore = Math.Round(avg, 1),
                    MaxScore = cat.MaxScore
                });

                if (avgPercentage > maxAvgPercentage)
                {
                    maxAvgPercentage = avgPercentage;
                    strongestCat = new CategoryMetricDto
                    {
                        CategoryId = cat.Id,
                        CategoryName = cat.Name,
                        Value = Math.Round(avg, 1),
                        Detail = $"متوسط الأداء: {Math.Round(avgPercentage, 1)}%"
                    };
                }

                // Competitive score standard deviation across teams
                // We want to verify how close the teams are in this category.
                // Gather scores of all teams in this category (fill with 0 for teams with no score)
                var teamScoresInCat = teams.Select(t =>
                {
                    var match = catScores.FirstOrDefault(s => s.TeamId == t.Id);
                    return match?.ScoreValue ?? 0;
                }).ToList();

                if (teamScoresInCat.Count > 1)
                {
                    double catMean = teamScoresInCat.Average();
                    double catVar = teamScoresInCat.Select(v => Math.Pow(v - catMean, 2)).Sum() / teamScoresInCat.Count;
                    double catStdDev = Math.Sqrt(catVar);

                    if (catStdDev < minCatStdDev)
                    {
                        minCatStdDev = catStdDev;
                        mostCompetitiveCat = new CategoryMetricDto
                        {
                            CategoryId = cat.Id,
                            CategoryName = cat.Name,
                            Value = Math.Round(catStdDev, 2),
                            Detail = $"تقارب النقاط (انحراف معياري): {Math.Round(catStdDev, 1)}"
                        };
                    }
                }
            }

            // Team Score Distributions (for mapping)
            var distributions = teamTotals.Select(tt =>
            {
                var list = new List<CategoryScoreValueDto>();
                foreach (var cat in categories)
                {
                    var match = tt.Scores.FirstOrDefault(s => s.CategoryId == cat.Id);
                    list.Add(new CategoryScoreValueDto
                    {
                        CategoryId = cat.Id,
                        CategoryName = cat.Name,
                        ScoreValue = match?.ScoreValue ?? 0
                    });
                }

                return new TeamScoreDistributionDto
                {
                    TeamId = tt.Team.Id,
                    TeamName = tt.Team.Name,
                    Scores = list
                };
            }).ToList();

            return new AnalyticsDto
            {
                HighestScoringTeam = highestScoring,
                LowestScoringTeam = lowestScoring,
                MostConsistentTeam = mostConsistent,
                StrongestCategory = strongestCat,
                MostCompetitiveCategory = mostCompetitiveCat,
                CategoryAverages = catAverages,
                TeamScoreDistributions = distributions
            };
        }
    }
}
