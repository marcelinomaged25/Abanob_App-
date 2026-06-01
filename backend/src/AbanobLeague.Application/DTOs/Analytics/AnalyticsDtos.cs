using System;
using System.Collections.Generic;

namespace AbanobLeague.Application.DTOs.Analytics
{
    public class AnalyticsDto
    {
        public TeamMetricDto? HighestScoringTeam { get; set; }
        public TeamMetricDto? LowestScoringTeam { get; set; }
        public TeamMetricDto? MostConsistentTeam { get; set; }
        public CategoryMetricDto? StrongestCategory { get; set; }
        public CategoryMetricDto? MostCompetitiveCategory { get; set; }
        public List<CategoryAverageDto> CategoryAverages { get; set; } = new List<CategoryAverageDto>();
        public List<TeamScoreDistributionDto> TeamScoreDistributions { get; set; } = new List<TeamScoreDistributionDto>();
    }

    public class TeamMetricDto
    {
        public Guid TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public string LogoUrl { get; set; } = string.Empty;
        public double Value { get; set; }
        public string Detail { get; set; } = string.Empty;
    }

    public class CategoryMetricDto
    {
        public Guid CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public double Value { get; set; }
        public string Detail { get; set; } = string.Empty;
    }

    public class CategoryAverageDto
    {
        public Guid CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public double AverageScore { get; set; }
        public int MaxScore { get; set; }
    }

    public class TeamScoreDistributionDto
    {
        public Guid TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public List<CategoryScoreValueDto> Scores { get; set; } = new List<CategoryScoreValueDto>();
    }

    public class CategoryScoreValueDto
    {
        public Guid CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public int ScoreValue { get; set; }
    }
}
