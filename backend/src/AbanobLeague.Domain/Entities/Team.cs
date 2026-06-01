using System;
using System.Collections.Generic;

namespace AbanobLeague.Domain.Entities
{
    public class Team
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string LogoUrl { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Guid SeasonId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Season? Season { get; set; }
        public ICollection<Score> Scores { get; set; } = new List<Score>();
    }
}
