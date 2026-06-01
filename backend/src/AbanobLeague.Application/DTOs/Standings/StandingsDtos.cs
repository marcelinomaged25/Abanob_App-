using System;
using System.Collections.Generic;
using AbanobLeague.Application.DTOs.Categories;

namespace AbanobLeague.Application.DTOs.Standings
{
    public class StandingsDto
    {
        public Guid SeasonId { get; set; }
        public List<CategoryDto> Categories { get; set; } = new List<CategoryDto>();
        public List<StandingsRowDto> Rows { get; set; } = new List<StandingsRowDto>();
    }

    public class StandingsRowDto
    {
        public int Rank { get; set; }
        public Guid TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public string LogoUrl { get; set; } = string.Empty;
        public List<StandingsCategoryScoreDto> CategoryScores { get; set; } = new List<StandingsCategoryScoreDto>();
        public int TotalScore { get; set; }
    }

    public class StandingsCategoryScoreDto
    {
        public Guid CategoryId { get; set; }
        public int ScoreValue { get; set; }
        public int MaxScore { get; set; }
    }

    public class LeaderboardEntryDto
    {
        public int Rank { get; set; }
        public Guid TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public string LogoUrl { get; set; } = string.Empty;
        public int TotalScore { get; set; }
        public string Movement { get; set; } = "None"; // "Up", "Down", "None"
    }
}
