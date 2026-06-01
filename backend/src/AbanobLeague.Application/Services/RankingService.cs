using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AbanobLeague.Application.DTOs.Standings;
using AbanobLeague.Application.Interfaces;
using AbanobLeague.Application.Mappings;
using AbanobLeague.Domain.Entities;
using AbanobLeague.Domain.Interfaces;

namespace AbanobLeague.Application.Services
{
    public class RankingService : IRankingService
    {
        private readonly IUnitOfWork _unitOfWork;

        public RankingService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<StandingsDto> GetStandingsAsync(Guid seasonId)
        {
            var categories = (await _unitOfWork.Categories.FindAsync(c => c.SeasonId == seasonId))
                .OrderBy(c => c.Order)
                .Select(c => c.ToDto())
                .ToList();

            var teams = await _unitOfWork.Teams.FindAsync(t => t.SeasonId == seasonId);
            var teamsList = teams.ToList();

            var allScores = await _unitOfWork.Scores.GetAllAsync();
            var scoresList = allScores.Where(s => categories.Select(c => c.Id).Contains(s.CategoryId)).ToList();
            var teamScoresMap = scoresList.GroupBy(s => s.TeamId).ToDictionary(g => g.Key, g => g.ToList());

            var rows = new List<StandingsRowDto>();

            foreach (var team in teamsList)
            {
                teamScoresMap.TryGetValue(team.Id, out var teamScores);
                teamScores ??= new List<Score>();

                var catScores = new List<StandingsCategoryScoreDto>();
                int totalScore = 0;

                foreach (var cat in categories)
                {
                    var score = teamScores.FirstOrDefault(s => s.CategoryId == cat.Id);
                    int val = score?.ScoreValue ?? 0;
                    totalScore += val;

                    catScores.Add(new StandingsCategoryScoreDto
                    {
                        CategoryId = cat.Id,
                        ScoreValue = val,
                        MaxScore = cat.MaxScore
                    });
                }

                rows.Add(new StandingsRowDto
                {
                    Rank = 0, // Assigned later after sorting
                    TeamId = team.Id,
                    TeamName = team.Name,
                    LogoUrl = team.LogoUrl,
                    CategoryScores = catScores,
                    TotalScore = totalScore
                });
            }

            // Sort descending by TotalScore
            var sortedRows = rows.OrderByDescending(r => r.TotalScore).ThenBy(r => r.TeamName).ToList();

            // Assign competition rank (1, 2, 2, 4 style)
            int rank = 1;
            for (int i = 0; i < sortedRows.Count; i++)
            {
                if (i > 0 && sortedRows[i].TotalScore < sortedRows[i - 1].TotalScore)
                {
                    rank = i + 1;
                }
                sortedRows[i].Rank = rank;
            }

            return new StandingsDto
            {
                SeasonId = seasonId,
                Categories = categories,
                Rows = sortedRows
            };
        }

        public async Task<IEnumerable<LeaderboardEntryDto>> GetLiveLeaderboardAsync(Guid seasonId)
        {
            var standings = await GetStandingsAsync(seasonId);

            // Fetch ranking snapshots to compute movement indicators
            var snapshots = await _unitOfWork.RankingSnapshots.FindAsync(s => s.SeasonId == seasonId);
            var distinctDates = snapshots
                .Select(s => s.SnapshotDate)
                .Distinct()
                .OrderByDescending(d => d)
                .ToList();

            // We need the PREVIOUS snapshot set.
            // Distinct dates are ordered newest first:
            // index 0: latest snapshot (current state, or matching the one we just saved)
            // index 1: the one before that
            var previousSnapshots = new List<RankingSnapshot>();
            if (distinctDates.Count > 1)
            {
                var prevDate = distinctDates[1];
                previousSnapshots = snapshots.Where(s => s.SnapshotDate == prevDate).ToList();
            }
            else if (distinctDates.Count == 1)
            {
                // If there is only one snapshot, let's see if we can check if it represents the current standings
                // or if it was saved prior. If we have only 1 snapshot, there is no previous state to compare.
            }

            var prevRankMap = previousSnapshots.ToDictionary(s => s.TeamId, s => s.Rank);

            return standings.Rows.Select(row =>
            {
                string movement = "None";
                if (prevRankMap.TryGetValue(row.TeamId, out int prevRank))
                {
                    if (row.Rank < prevRank) // rank 1 is better than rank 2
                    {
                        movement = "Up";
                    }
                    else if (row.Rank > prevRank)
                    {
                        movement = "Down";
                    }
                }

                return new LeaderboardEntryDto
                {
                    Rank = row.Rank,
                    TeamId = row.TeamId,
                    TeamName = row.TeamName,
                    LogoUrl = row.LogoUrl,
                    TotalScore = row.TotalScore,
                    Movement = movement
                };
            }).ToList();
        }

        public async Task SaveRankingSnapshotAsync(Guid seasonId)
        {
            var standings = await GetStandingsAsync(seasonId);
            var snapshotDate = DateTime.UtcNow;

            foreach (var row in standings.Rows)
            {
                var snapshot = new RankingSnapshot
                {
                    Id = Guid.NewGuid(),
                    TeamId = row.TeamId,
                    SeasonId = seasonId,
                    Rank = row.Rank,
                    TotalScore = row.TotalScore,
                    SnapshotDate = snapshotDate
                };

                await _unitOfWork.RankingSnapshots.AddAsync(snapshot);
            }

            await _unitOfWork.SaveChangesAsync();
        }
    }
}
