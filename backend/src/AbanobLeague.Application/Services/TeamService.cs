using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AbanobLeague.Application.DTOs.Teams;
using AbanobLeague.Application.Interfaces;
using AbanobLeague.Application.Mappings;
using AbanobLeague.Domain.Entities;
using AbanobLeague.Domain.Interfaces;

namespace AbanobLeague.Application.Services
{
    public class TeamService : ITeamService
    {
        private readonly IUnitOfWork _unitOfWork;

        public TeamService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<TeamDto>> GetTeamsBySeasonAsync(Guid seasonId)
        {
            var teams = await _unitOfWork.Teams.FindAsync(t => t.SeasonId == seasonId);
            var season = await _unitOfWork.Seasons.GetByIdAsync(seasonId);

            return teams.Select(t => {
                t.Season = season;
                return t.ToDto();
            }).OrderBy(t => t.Name);
        }

        public async Task<TeamDto?> GetTeamByIdAsync(Guid id)
        {
            var team = await _unitOfWork.Teams.GetByIdAsync(id);
            if (team != null)
            {
                team.Season = await _unitOfWork.Seasons.GetByIdAsync(team.SeasonId);
            }
            return team?.ToDto();
        }

        public async Task<TeamDto> CreateTeamAsync(CreateTeamDto dto, string? logoUrl = null)
        {
            var team = new Team
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Description = dto.Description,
                SeasonId = dto.SeasonId,
                LogoUrl = logoUrl ?? string.Empty,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Teams.AddAsync(team);
            await _unitOfWork.SaveChangesAsync();

            team.Season = await _unitOfWork.Seasons.GetByIdAsync(team.SeasonId);
            return team.ToDto();
        }

        public async Task<TeamDto?> UpdateTeamAsync(Guid id, UpdateTeamDto dto, string? logoUrl = null)
        {
            var team = await _unitOfWork.Teams.GetByIdAsync(id);
            if (team == null) return null;

            team.Name = dto.Name;
            team.Description = dto.Description;
            if (logoUrl != null)
            {
                team.LogoUrl = logoUrl;
            }

            _unitOfWork.Teams.Update(team);
            await _unitOfWork.SaveChangesAsync();

            team.Season = await _unitOfWork.Seasons.GetByIdAsync(team.SeasonId);
            return team.ToDto();
        }

        public async Task<bool> DeleteTeamAsync(Guid id)
        {
            var team = await _unitOfWork.Teams.GetByIdAsync(id);
            if (team == null) return false;

            _unitOfWork.Teams.Delete(team);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<TeamProfileDto?> GetTeamProfileAsync(Guid id)
        {
            var team = await _unitOfWork.Teams.GetByIdAsync(id);
            if (team == null) return null;

            var season = await _unitOfWork.Seasons.GetByIdAsync(team.SeasonId);
            var categoriesList = (await _unitOfWork.Categories.FindAsync(c => c.SeasonId == team.SeasonId))
                .OrderBy(c => c.Order).ToList();
            
            // Get all teams in this season to compute ranking
            var allTeams = await _unitOfWork.Teams.FindAsync(t => t.SeasonId == team.SeasonId);
            var allScores = await _unitOfWork.Scores.GetAllAsync();
            var teamScoresMap = allScores
                .GroupBy(s => s.TeamId)
                .ToDictionary(g => g.Key, g => g.ToList());

            var rankings = allTeams.Select(t => {
                var list = teamScoresMap.TryGetValue(t.Id, out var s) ? s : new List<Score>();
                var total = list.Sum(x => x.ScoreValue);
                return new { TeamId = t.Id, TotalScore = total };
            })
            .OrderByDescending(r => r.TotalScore)
            .ToList();

            int rank = rankings.FindIndex(r => r.TeamId == id) + 1;
            int totalScore = rankings.FirstOrDefault(r => r.TeamId == id)?.TotalScore ?? 0;

            // Prepare Category Breakdown
            var teamScores = teamScoresMap.TryGetValue(id, out var ts) ? ts : new List<Score>();
            var categoryBreakdown = new List<CategoryScoreDto>();

            foreach (var cat in categoriesList)
            {
                var matchingScore = teamScores.FirstOrDefault(s => s.CategoryId == cat.Id);
                int scoreVal = matchingScore?.ScoreValue ?? 0;
                double percentage = cat.MaxScore > 0 ? ((double)scoreVal / cat.MaxScore) * 100 : 0;

                categoryBreakdown.Add(new CategoryScoreDto
                {
                    CategoryId = cat.Id,
                    CategoryName = cat.Name,
                    Score = scoreVal,
                    MaxScore = cat.MaxScore,
                    Percentage = Math.Round(percentage, 1),
                    Notes = matchingScore?.Notes ?? string.Empty
                });
            }

            return new TeamProfileDto
            {
                Id = team.Id,
                Name = team.Name,
                LogoUrl = team.LogoUrl,
                Description = team.Description,
                SeasonId = team.SeasonId,
                SeasonName = season?.Name ?? string.Empty,
                Rank = rank,
                TotalScore = totalScore,
                CategoryScores = categoryBreakdown
            };
        }
    }
}
