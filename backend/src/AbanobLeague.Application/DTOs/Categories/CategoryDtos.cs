using System;

namespace AbanobLeague.Application.DTOs.Categories
{
    public class CategoryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int MaxScore { get; set; }
        public int Order { get; set; }
        public Guid SeasonId { get; set; }
        public string Type { get; set; } = "Both";
    }

    public class CreateCategoryDto
    {
        public string Name { get; set; } = string.Empty;
        public int MaxScore { get; set; }
        public int Order { get; set; }
        public Guid SeasonId { get; set; }
        public string Type { get; set; } = "Both";
    }

    public class UpdateCategoryDto
    {
        public string Name { get; set; } = string.Empty;
        public int MaxScore { get; set; }
        public int Order { get; set; }
        public string Type { get; set; } = "Both";
    }

    public class CategoryReorderDto
    {
        public Guid CategoryId { get; set; }
        public int Order { get; set; }
    }
}
