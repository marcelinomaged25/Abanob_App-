using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AbanobLeague.Application.DTOs.HallOfFame;
using AbanobLeague.Application.Interfaces;
using AbanobLeague.Domain.Entities;
using AbanobLeague.Domain.Interfaces;

namespace AbanobLeague.Application.Services
{
    public class HallOfFameService : IHallOfFameService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IRankingService _rankingService;

        public HallOfFameService(IUnitOfWork unitOfWork, IRankingService rankingService)
        {
            _unitOfWork = unitOfWork;
            _rankingService = rankingService;
        }

        public async Task<HallOfFameDto> GetHallOfFameAsync(Guid seasonId)
        {
            var standings = await _rankingService.GetStandingsAsync(seasonId);
            var leadingRow = standings.Rows.FirstOrDefault();

            BestTeamDto? bestTeam = null;
            if (leadingRow != null)
            {
                bestTeam = new BestTeamDto
                {
                    TeamId = leadingRow.TeamId,
                    TeamName = leadingRow.TeamName,
                    TotalScore = leadingRow.TotalScore,
                    LogoUrl = leadingRow.LogoUrl,
                    Trophy = "🏆 الكأس الذهبي لدوري القديس أبانوب"
                };
            }

            var categories = (await _unitOfWork.Categories.FindAsync(c => c.SeasonId == seasonId))
                .OrderBy(c => c.Order)
                .ToList();

            var scoringData = await SeasonScoreHelper.LoadAsync(_unitOfWork, seasonId);
            var teamMap = scoringData.Teams.ToDictionary(t => t.Id);

            var champions = new List<CategoryChampionDto>();

            foreach (var cat in categories)
            {
                var catScores = scoringData.CombinedCategoryScoresByTeamId
                    .Select(item => new { TeamId = item.Key, ScoreValue = item.Value.TryGetValue(cat.Id, out var val) ? val : 0 })
                    .Where(x => x.ScoreValue > 0)
                    .OrderByDescending(s => s.ScoreValue)
                    .ToList();

                var topScore = catScores.FirstOrDefault();
                if (topScore != null && teamMap.TryGetValue(topScore.TeamId, out var champTeam))
                {
                    champions.Add(new CategoryChampionDto
                    {
                        CategoryId = cat.Id,
                        CategoryName = cat.Name,
                        TeamId = champTeam.Id,
                        TeamName = champTeam.Name,
                        LogoUrl = champTeam.LogoUrl,
                        ScoreValue = topScore.ScoreValue,
                        MaxScore = cat.MaxScore,
                        Medal = $"🥇 بطل فئة {cat.Name}"
                    });
                }
            }

            return new HallOfFameDto
            {
                BestTeamOverall = bestTeam,
                CategoryChampions = champions
            };
        }
    }
}
