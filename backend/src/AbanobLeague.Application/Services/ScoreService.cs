using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AbanobLeague.Application.DTOs.Scores;
using AbanobLeague.Application.Interfaces;
using AbanobLeague.Application.Mappings;
using AbanobLeague.Domain.Entities;
using AbanobLeague.Domain.Interfaces;

namespace AbanobLeague.Application.Services
{
    public class ScoreService : IScoreService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IAuditService _auditService;
        private readonly IRankingService _rankingService;

        public ScoreService(IUnitOfWork unitOfWork, IAuditService auditService, IRankingService rankingService)
        {
            _unitOfWork = unitOfWork;
            _auditService = auditService;
            _rankingService = rankingService;
        }

        public async Task<ScoreDto> UpdateScoreAsync(UpdateScoreDto dto, Guid userId)
        {
            var team = await _unitOfWork.Teams.GetByIdAsync(dto.TeamId);
            if (team == null) throw new ArgumentException("Team not found.");

            var category = await _unitOfWork.Categories.GetByIdAsync(dto.CategoryId);
            if (category == null) throw new ArgumentException("Category not found.");

            if (team.SeasonId != category.SeasonId)
                throw new ArgumentException("Team and Category do not belong to the same season.");

            if (dto.ScoreValue < 0 || dto.ScoreValue > category.MaxScore)
                throw new ArgumentException($"Score must be between 0 and {category.MaxScore}.");

            Score? existingScore = null;
            if (dto.ScoreId.HasValue)
            {
                existingScore = await _unitOfWork.Scores.GetByIdAsync(dto.ScoreId.Value);
                if (existingScore != null && (existingScore.TeamId != dto.TeamId || existingScore.CategoryId != dto.CategoryId))
                {
                    throw new ArgumentException("Score entry mismatch.");
                }
            }

            string oldValue;
            string newValue = $"Score = {dto.ScoreValue}, Notes = {dto.Notes}";
            Score scoreEntity;

            if (existingScore != null)
            {
                oldValue = $"Score = {existingScore.ScoreValue}, Notes = {existingScore.Notes}";
                existingScore.ScoreValue = dto.ScoreValue;
                existingScore.Notes = dto.Notes;
                existingScore.UpdatedAt = dto.UpdatedAt ?? DateTime.UtcNow;
                _unitOfWork.Scores.Update(existingScore);
                scoreEntity = existingScore;
            }
            else
            {
                oldValue = "(None)";
                scoreEntity = new Score
                {
                    Id = Guid.NewGuid(),
                    TeamId = dto.TeamId,
                    CategoryId = dto.CategoryId,
                    ScoreValue = dto.ScoreValue,
                    Notes = dto.Notes,
                    UpdatedAt = dto.UpdatedAt ?? DateTime.UtcNow
                };
                await _unitOfWork.Scores.AddAsync(scoreEntity);
            }

            await _unitOfWork.SaveChangesAsync();

            // Log the update
            await _auditService.LogActionAsync(
                userId,
                "UPDATE_SCORE",
                "Score",
                oldValue,
                newValue
            );

            // Re-trigger ranking calculation and snapshots immediately
            await _rankingService.SaveRankingSnapshotAsync(team.SeasonId);

            // Load navigation properties for return DTO
            scoreEntity.Team = team;
            scoreEntity.Category = category;

            return scoreEntity.ToDto();
        }

        public async Task<ScoreMatrixDto> GetScoreMatrixAsync(Guid seasonId)
        {
            var categoriesList = (await _unitOfWork.Categories.FindAsync(c => c.SeasonId == seasonId))
                .OrderBy(c => c.Order)
                .Select(c => c.ToDto())
                .ToList();

            var teams = await _unitOfWork.Teams.FindAsync(t => t.SeasonId == seasonId);
            var teamsList = teams.OrderBy(t => t.Name).ToList();

            var allScores = await _unitOfWork.Scores.GetAllAsync();
            var scoresList = allScores.Where(s => categoriesList.Select(c => c.Id).Contains(s.CategoryId)).ToList();
            var scoreMap = scoresList.GroupBy(s => (s.TeamId, s.CategoryId)).ToDictionary(g => g.Key, g => g.ToList());

            var rows = new List<ScoreMatrixRowDto>();

            foreach (var team in teamsList)
            {
                var rowScores = new List<ScoreMatrixCellDto>();
                foreach (var cat in categoriesList)
                {
                    scoreMap.TryGetValue((team.Id, cat.Id), out var cellScores);
                    int? totalValue = null;
                    var history = new List<ScoreHistoryEntryDto>();

                    if (cellScores != null && cellScores.Any())
                    {
                        totalValue = cellScores.Sum(s => s.ScoreValue);
                        history = cellScores.OrderByDescending(s => s.UpdatedAt).Select(s => new ScoreHistoryEntryDto
                        {
                            Id = s.Id,
                            ScoreValue = s.ScoreValue,
                            Notes = s.Notes,
                            UpdatedAt = s.UpdatedAt
                        }).ToList();
                    }

                    rowScores.Add(new ScoreMatrixCellDto
                    {
                        CategoryId = cat.Id,
                        ScoreValue = totalValue,
                        Notes = history.FirstOrDefault()?.Notes ?? string.Empty,
                        UpdatedAt = history.FirstOrDefault()?.UpdatedAt,
                        History = history
                    });
                }

                rows.Add(new ScoreMatrixRowDto
                {
                    TeamId = team.Id,
                    TeamName = team.Name,
                    LogoUrl = team.LogoUrl,
                    Scores = rowScores
                });
            }

            return new ScoreMatrixDto
            {
                Categories = categoriesList,
                Rows = rows
            };
        }

        public async Task<IEnumerable<ScoreDto>> GetScoresByTeamAsync(Guid teamId)
        {
            var team = await _unitOfWork.Teams.GetByIdAsync(teamId);
            if (team == null) return Enumerable.Empty<ScoreDto>();

            var scores = await _unitOfWork.Scores.FindAsync(s => s.TeamId == teamId);
            var categories = await _unitOfWork.Categories.FindAsync(c => c.SeasonId == team.SeasonId);
            var categoryMap = categories.ToDictionary(c => c.Id);

            return scores.Select(s =>
            {
                s.Team = team;
                if (categoryMap.TryGetValue(s.CategoryId, out var cat))
                {
                    s.Category = cat;
                }
                return s.ToDto();
            });
        }
    }
}
