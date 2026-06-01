using System;
using System.Collections.Generic;

namespace AbanobLeague.Domain.Entities
{
    public class TeamMember
    {
        public Guid Id { get; set; }
        public Guid TeamId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Team? Team { get; set; }
        public ICollection<MemberScore> Scores { get; set; } = new List<MemberScore>();
    }
}
