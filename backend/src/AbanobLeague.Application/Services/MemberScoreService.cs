using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AbanobLeague.Application.DTOs.MemberScores;
using AbanobLeague.Application.Interfaces;
using AbanobLeague.Application.Mappings;
using AbanobLeague.Domain.Entities;
using AbanobLeague.Domain.Interfaces;

namespace AbanobLeague.Application.Services
{
    public class MemberScoreService : IMemberScoreService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IAuditService _auditService;
        private readonly IRankingService _rankingService;

        public MemberScoreService(IUnitOfWork unitOfWork, IAuditService auditService, IRankingService rankingService)
        {
            _unitOfWork = unitOfWork;
            _auditService = auditService;
            _rankingService = rankingService;
        }

        public async Task<MemberScoreMatrixDto> GetMemberScoreMatrixAsync(Guid seasonId)
        {
            var scoringData = await SeasonScoreHelper.LoadAsync(_unitOfWork, seasonId);
            var rows = new List<MemberScoreMatrixRowDto>();

            foreach (var team in scoringData.Teams.OrderBy(t => t.Name))
            {
                if (!scoringData.MembersByTeamId.TryGetValue(team.Id, out var teamMembers))
                    continue;

                foreach (var member in teamMembers)
                {
                    var rowScores = new List<MemberScoreMatrixCellDto>();
                    scoringData.MemberScoresByMemberId.TryGetValue(member.Id, out var memberScores);
                    memberScores ??= new List<MemberScore>();

                    int memberTotal = 0;

                    foreach (var cat in scoringData.Categories.OrderBy(c => c.Order))
                    {
                        var cellScores = memberScores.Where(s => s.CategoryId == cat.Id).ToList();
                        int? totalValue = null;
                        var history = new List<MemberScoreHistoryEntryDto>();

                        if (cellScores.Any())
                        {
                            totalValue = cellScores.Sum(s => s.ScoreValue);
                            memberTotal += totalValue.Value;
                            history = cellScores
                                .OrderByDescending(s => s.UpdatedAt)
                                .Select(s => new MemberScoreHistoryEntryDto
                                {
                                    Id = s.Id,
                                    ScoreValue = s.ScoreValue,
                                    Notes = s.Notes,
                                    UpdatedAt = s.UpdatedAt
                                }).ToList();
                        }

                        rowScores.Add(new MemberScoreMatrixCellDto
                        {
                            CategoryId = cat.Id,
                            ScoreValue = totalValue,
                            Notes = history.FirstOrDefault()?.Notes ?? string.Empty,
                            UpdatedAt = history.FirstOrDefault()?.UpdatedAt,
                            History = history
                        });
                    }

                    rows.Add(new MemberScoreMatrixRowDto
                    {
                        TeamId = team.Id,
                        TeamName = team.Name,
                        LogoUrl = team.LogoUrl,
                        TeamMemberId = member.Id,
                        TeamMemberName = member.FullName,
                        DisplayOrder = member.DisplayOrder,
                        TotalScore = memberTotal,
                        Scores = rowScores
                    });
                }
            }

            return new MemberScoreMatrixDto
            {
                Categories = scoringData.Categories.OrderBy(c => c.Order).Select(c => c.ToDto()).ToList(),
                Rows = rows
            };
        }

        public async Task<MemberScoreDto> UpdateMemberScoreAsync(UpdateMemberScoreDto dto, Guid userId)
        {
            var member = await _unitOfWork.TeamMembers.GetByIdAsync(dto.TeamMemberId);
            if (member == null) throw new ArgumentException("Team member not found.");

            var team = await _unitOfWork.Teams.GetByIdAsync(member.TeamId);
            if (team == null) throw new ArgumentException("Team not found.");

            var category = await _unitOfWork.Categories.GetByIdAsync(dto.CategoryId);
            if (category == null) throw new ArgumentException("Category not found.");

            if (team.SeasonId != category.SeasonId)
                throw new ArgumentException("Team member and Category do not belong to the same season.");

            if (dto.ScoreValue < 0 || dto.ScoreValue > category.MaxScore)
                throw new ArgumentException($"Score must be between 0 and {category.MaxScore}.");

            MemberScore? existingScore = null;
            if (dto.ScoreId.HasValue)
            {
                existingScore = await _unitOfWork.MemberScores.GetByIdAsync(dto.ScoreId.Value);
                if (existingScore != null &&
                    (existingScore.TeamMemberId != dto.TeamMemberId || existingScore.CategoryId != dto.CategoryId))
                {
                    throw new ArgumentException("Score entry mismatch.");
                }
            }

            string oldValue;
            string newValue = $"Score = {dto.ScoreValue}, Notes = {dto.Notes}";
            MemberScore scoreEntity;

            if (existingScore != null)
            {
                oldValue = $"Score = {existingScore.ScoreValue}, Notes = {existingScore.Notes}";
                existingScore.ScoreValue = dto.ScoreValue;
                existingScore.Notes = dto.Notes;
                existingScore.UpdatedAt = dto.UpdatedAt?.ToUniversalTime() ?? DateTime.UtcNow;
                _unitOfWork.MemberScores.Update(existingScore);
                scoreEntity = existingScore;
            }
            else
            {
                // Always append a NEW history entry
                oldValue = "(New Entry)";
                scoreEntity = new MemberScore
                {
                    Id = Guid.NewGuid(),
                    TeamMemberId = dto.TeamMemberId,
                    CategoryId = dto.CategoryId,
                    ScoreValue = dto.ScoreValue,
                    Notes = dto.Notes,
                    UpdatedAt = dto.UpdatedAt?.ToUniversalTime() ?? DateTime.UtcNow
                };
                await _unitOfWork.MemberScores.AddAsync(scoreEntity);
            }

            await _unitOfWork.SaveChangesAsync();

            await _auditService.LogActionAsync(
                userId,
                "UPDATE_MEMBER_SCORE",
                "MemberScore",
                oldValue,
                newValue
            );

            await _rankingService.SaveRankingSnapshotAsync(team.SeasonId);

            scoreEntity.TeamMember = member;
            scoreEntity.TeamMember.Team = team;
            scoreEntity.Category = category;

            return scoreEntity.ToDto();
        }

        public async Task<IEnumerable<MemberScoreDto>> GetScoresByMemberAsync(Guid teamMemberId)
        {
            var member = await _unitOfWork.TeamMembers.GetByIdAsync(teamMemberId);
            if (member == null) return Enumerable.Empty<MemberScoreDto>();

            var team = await _unitOfWork.Teams.GetByIdAsync(member.TeamId);
            if (team == null) return Enumerable.Empty<MemberScoreDto>();

            var scores = await _unitOfWork.MemberScores.FindAsync(s => s.TeamMemberId == teamMemberId);
            var categories = await _unitOfWork.Categories.FindAsync(c => c.SeasonId == team.SeasonId);
            var categoryMap = categories.ToDictionary(c => c.Id);

            return scores.Select(s =>
            {
                s.TeamMember = member;
                s.TeamMember.Team = team;
                if (categoryMap.TryGetValue(s.CategoryId, out var cat))
                    s.Category = cat;
                return s.ToDto();
            });
        }

        public async Task<IEnumerable<MemberLeaderboardEntryDto>> GetIndividualLeaderboardAsync(Guid seasonId)
        {
            var scoringData = await SeasonScoreHelper.LoadAsync(_unitOfWork, seasonId);

            var entries = new List<MemberLeaderboardEntryDto>();

            foreach (var team in scoringData.Teams)
            {
                if (!scoringData.MembersByTeamId.TryGetValue(team.Id, out var members))
                    continue;

                foreach (var member in members)
                {
                    int total = 0;
                    if (scoringData.MemberScoresByMemberId.TryGetValue(member.Id, out var scores))
                        total = scores.Sum(s => s.ScoreValue);

                    entries.Add(new MemberLeaderboardEntryDto
                    {
                        TeamMemberId = member.Id,
                        TeamMemberName = member.FullName,
                        TeamId = team.Id,
                        TeamName = team.Name,
                        LogoUrl = team.LogoUrl,
                        TotalScore = total
                    });
                }
            }

            // Sort and assign ranks
            var sorted = entries.OrderByDescending(e => e.TotalScore).ThenBy(e => e.TeamMemberName).ToList();
            int rank = 1;
            for (int i = 0; i < sorted.Count; i++)
            {
                if (i > 0 && sorted[i].TotalScore < sorted[i - 1].TotalScore)
                    rank = i + 1;
                sorted[i].Rank = rank;
            }

            return sorted;
        }
    }
}
