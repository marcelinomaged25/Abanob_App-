using System;

namespace AbanobLeague.Domain.Entities
{
    public class MemberScore
    {
        public Guid Id { get; set; }
        public Guid TeamMemberId { get; set; }
        public Guid CategoryId { get; set; }
        public int ScoreValue { get; set; }
        public string Notes { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public TeamMember? TeamMember { get; set; }
        public Category? Category { get; set; }
    }
}
