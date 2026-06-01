using System;
using System.Collections.Generic;

namespace AbanobLeague.Application.DTOs.Teams
{
    public class TeamDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string LogoUrl { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Guid SeasonId { get; set; }
        public string SeasonName { get; set; } = string.Empty;
        public int MemberCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateTeamDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Guid SeasonId { get; set; }
        public List<string> MemberNames { get; set; } = new List<string>();
    }

    public class UpdateTeamDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<string>? MemberNames { get; set; }
    }

    public class TeamProfileDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string LogoUrl { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Guid SeasonId { get; set; }
        public string SeasonName { get; set; } = string.Empty;
        public int Rank { get; set; }
        public int TotalScore { get; set; }
        public int TeamScoreTotal { get; set; }
        public int MemberScoreTotal { get; set; }
        public List<CategoryScoreDto> CategoryScores { get; set; } = new List<CategoryScoreDto>();
        public List<TeamMemberDto> Members { get; set; } = new List<TeamMemberDto>();
    }

    public class CategoryScoreDto
    {
        public Guid CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public int Score { get; set; }
        public int MaxScore { get; set; }
        public double Percentage { get; set; }
        public string Notes { get; set; } = string.Empty;
    }

    public class TeamMemberDto
    {
        public Guid Id { get; set; }
        public Guid TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public int TotalScore { get; set; }
    }
}
