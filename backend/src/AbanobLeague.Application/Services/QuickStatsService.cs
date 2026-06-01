using System;
using System.Linq;
using System.Threading.Tasks;
using AbanobLeague.Application.DTOs.Stats;
using AbanobLeague.Application.Interfaces;
using AbanobLeague.Domain.Interfaces;

namespace AbanobLeague.Application.Services
{
    public class QuickStatsService : IQuickStatsService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IRankingService _rankingService;

        public QuickStatsService(IUnitOfWork unitOfWork, IRankingService rankingService)
        {
            _unitOfWork = unitOfWork;
            _rankingService = rankingService;
        }

        public async Task<QuickStatsDto> GetQuickStatsAsync(Guid seasonId)
        {
            var teams = await _unitOfWork.Teams.FindAsync(t => t.SeasonId == seasonId);
            var categories = await _unitOfWork.Categories.FindAsync(c => c.SeasonId == seasonId);
            var standings = await _rankingService.GetStandingsAsync(seasonId);

            var leadingRow = standings.Rows.FirstOrDefault();

            return new QuickStatsDto
            {
                TotalTeams = teams.Count(),
                TotalCategories = categories.Count(),
                LeadingTeamName = leadingRow?.TeamName ?? "لا يوجد",
                LeadingTeamLogoUrl = leadingRow?.LogoUrl ?? string.Empty,
                HighestTotalScore = leadingRow?.TotalScore ?? 0
            };
        }
    }
}
