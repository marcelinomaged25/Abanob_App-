using System;
using System.Threading.Tasks;
using AbanobLeague.Domain.Entities;

namespace AbanobLeague.Domain.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IRepository<Season> Seasons { get; }
        IRepository<Team> Teams { get; }
        IRepository<Category> Categories { get; }
        IRepository<Score> Scores { get; }
        IRepository<AdminUser> AdminUsers { get; }
        IRepository<AuditLog> AuditLogs { get; }
        IRepository<RankingSnapshot> RankingSnapshots { get; }
        Task<int> SaveChangesAsync();
    }
}
