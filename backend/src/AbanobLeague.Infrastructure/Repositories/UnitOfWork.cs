using System;
using System.Threading.Tasks;
using AbanobLeague.Domain.Entities;
using AbanobLeague.Domain.Interfaces;
using AbanobLeague.Infrastructure.Data;

namespace AbanobLeague.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;
        private IRepository<Season>? _seasons;
        private IRepository<Team>? _teams;
        private IRepository<TeamMember>? _teamMembers;
        private IRepository<Category>? _categories;
        private IRepository<Score>? _scores;
        private IRepository<MemberScore>? _memberScores;
        private IRepository<AdminUser>? _adminUsers;
        private IRepository<AuditLog>? _auditLogs;
        private IRepository<RankingSnapshot>? _rankingSnapshots;

        public UnitOfWork(AppDbContext context)
        {
            _context = context;
        }

        public IRepository<Season> Seasons => _seasons ??= new Repository<Season>(_context);
        public IRepository<Team> Teams => _teams ??= new Repository<Team>(_context);
        public IRepository<TeamMember> TeamMembers => _teamMembers ??= new Repository<TeamMember>(_context);
        public IRepository<Category> Categories => _categories ??= new Repository<Category>(_context);
        public IRepository<Score> Scores => _scores ??= new Repository<Score>(_context);
        public IRepository<MemberScore> MemberScores => _memberScores ??= new Repository<MemberScore>(_context);
        public IRepository<AdminUser> AdminUsers => _adminUsers ??= new Repository<AdminUser>(_context);
        public IRepository<AuditLog> AuditLogs => _auditLogs ??= new Repository<AuditLog>(_context);
        public IRepository<RankingSnapshot> RankingSnapshots => _rankingSnapshots ??= new Repository<RankingSnapshot>(_context);

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
            GC.SuppressFinalize(this);
        }
    }
}
