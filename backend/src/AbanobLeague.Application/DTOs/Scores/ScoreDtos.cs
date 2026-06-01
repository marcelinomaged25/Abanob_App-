using System;
using System.Collections.Generic;
using AbanobLeague.Application.DTOs.Categories;

namespace AbanobLeague.Application.DTOs.Scores
{
    public class ScoreDto
    {
        public Guid Id { get; set; }
        public Guid TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public Guid CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public int ScoreValue { get; set; }
        public int MaxScore { get; set; }
        public string Notes { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
    }

    public class UpdateScoreDto
    {
        public Guid TeamId { get; set; }
        public Guid CategoryId { get; set; }
        public int ScoreValue { get; set; }
        public string Notes { get; set; } = string.Empty;
    }

    public class ScoreMatrixDto
    {
        public List<CategoryDto> Categories { get; set; } = new List<CategoryDto>();
        public List<ScoreMatrixRowDto> Rows { get; set; } = new List<ScoreMatrixRowDto>();
    }

    public class ScoreMatrixRowDto
    {
        public Guid TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public string LogoUrl { get; set; } = string.Empty;
        public List<ScoreMatrixCellDto> Scores { get; set; } = new List<ScoreMatrixCellDto>();
    }

    public class ScoreMatrixCellDto
    {
        public Guid CategoryId { get; set; }
        public int? ScoreValue { get; set; }
        public string Notes { get; set; } = string.Empty;
    }
}
