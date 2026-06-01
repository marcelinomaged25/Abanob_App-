using System;
using System.Collections.Generic;

namespace AbanobLeague.Domain.Entities
{
    public class Category
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int MaxScore { get; set; }
        public int Order { get; set; }
        public Guid SeasonId { get; set; }

        // Navigation properties
        public Season? Season { get; set; }
        public ICollection<Score> Scores { get; set; } = new List<Score>();
    }
}
