using System;

namespace AbanobLeague.Application.DTOs.Stats
{
    public class QuickStatsDto
    {
        public int TotalTeams { get; set; }
        public int TotalCategories { get; set; }
        public string LeadingTeamName { get; set; } = string.Empty;
        public string LeadingTeamLogoUrl { get; set; } = string.Empty;
        public int HighestTotalScore { get; set; }
    }
}
