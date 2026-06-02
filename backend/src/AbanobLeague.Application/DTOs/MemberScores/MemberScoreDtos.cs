using System;
using System.Collections.Generic;
using AbanobLeague.Application.DTOs.Categories;

namespace AbanobLeague.Application.DTOs.MemberScores
{
    public class MemberScoreDto
    {
        public Guid Id { get; set; }
        public Guid TeamMemberId { get; set; }
        public string TeamMemberName { get; set; } = string.Empty;
        public Guid TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public Guid CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public int ScoreValue { get; set; }
        public int MaxScore { get; set; }
        public string Notes { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
    }

    public class UpdateMemberScoreDto
    {
        public Guid? ScoreId { get; set; }
        public Guid TeamMemberId { get; set; }
        public Guid CategoryId { get; set; }
        public int ScoreValue { get; set; }
        public string Notes { get; set; } = string.Empty;
        public DateTime? UpdatedAt { get; set; }
    }

    public class MemberScoreHistoryEntryDto
    {
        public Guid Id { get; set; }
        public int ScoreValue { get; set; }
        public string Notes { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
    }

    public class MemberLeaderboardEntryDto
    {
        public int Rank { get; set; }
        public Guid TeamMemberId { get; set; }
        public string TeamMemberName { get; set; } = string.Empty;
        public Guid TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public string LogoUrl { get; set; } = string.Empty;
        public int TotalScore { get; set; }
    }

    public class MemberScoreMatrixDto
    {
        public List<CategoryDto> Categories { get; set; } = new List<CategoryDto>();
        public List<MemberScoreMatrixRowDto> Rows { get; set; } = new List<MemberScoreMatrixRowDto>();
    }

    public class MemberScoreMatrixRowDto
    {
        public Guid TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public string LogoUrl { get; set; } = string.Empty;
        public Guid TeamMemberId { get; set; }
        public string TeamMemberName { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public int TotalScore { get; set; }
        public List<MemberScoreMatrixCellDto> Scores { get; set; } = new List<MemberScoreMatrixCellDto>();
    }

    public class MemberScoreMatrixCellDto
    {
        public Guid CategoryId { get; set; }
        public int? ScoreValue { get; set; }
        public string Notes { get; set; } = string.Empty;
        public DateTime? UpdatedAt { get; set; }
        public List<MemberScoreHistoryEntryDto> History { get; set; } = new List<MemberScoreHistoryEntryDto>();
    }
}
