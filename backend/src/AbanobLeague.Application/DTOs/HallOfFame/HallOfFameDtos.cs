using System;
using System.Collections.Generic;

namespace AbanobLeague.Application.DTOs.HallOfFame
{
    public class HallOfFameDto
    {
        public BestTeamDto? BestTeamOverall { get; set; }
        public List<CategoryChampionDto> CategoryChampions { get; set; } = new List<CategoryChampionDto>();
    }

    public class BestTeamDto
    {
        public Guid TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public int TotalScore { get; set; }
        public string LogoUrl { get; set; } = string.Empty;
        public string Trophy { get; set; } = "🏆 الكأس الذهبي";
    }

    public class CategoryChampionDto
    {
        public Guid CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public Guid TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public string LogoUrl { get; set; } = string.Empty;
        public int ScoreValue { get; set; }
        public int MaxScore { get; set; }
        public string Medal { get; set; } = "🥇 الميدالية الذهبية";
    }
}
