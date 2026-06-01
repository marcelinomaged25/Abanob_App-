using System;

namespace AbanobLeague.Domain.Entities
{
    public class RankingSnapshot
    {
        public Guid Id { get; set; }
        public Guid TeamId { get; set; }
        public Guid SeasonId { get; set; }
        public int Rank { get; set; }
        public int TotalScore { get; set; }
        public DateTime SnapshotDate { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Team? Team { get; set; }
        public Season? Season { get; set; }
    }
}
