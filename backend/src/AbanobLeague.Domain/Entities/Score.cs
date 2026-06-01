using System;

namespace AbanobLeague.Domain.Entities
{
    public class Score
    {
        public Guid Id { get; set; }
        public Guid TeamId { get; set; }
        public Guid CategoryId { get; set; }
        public int ScoreValue { get; set; }
        public string Notes { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Team? Team { get; set; }
        public Category? Category { get; set; }
    }
}
