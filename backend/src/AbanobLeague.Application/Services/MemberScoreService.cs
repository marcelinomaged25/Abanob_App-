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
                {
                    continue;
                }

                foreach (var member in teamMembers)
                {
                    var rowScores = new List<MemberScoreMatrixCellDto>();
                    scoringData.MemberScoresByMemberId.TryGetValue(member.Id, out var memberScores);
                    memberScores ??= new List<MemberScore>();

                    foreach (var cat in scoringData.Categories.OrderBy(c => c.Order))
                    {
                        var score = memberScores.FirstOrDefault(s => s.CategoryId == cat.Id);
                        rowScores.Add(new MemberScoreMatrixCellDto
                        {
                            CategoryId = cat.Id,
                            ScoreValue = score?.ScoreValue,
                            Notes = score?.Notes ?? string.Empty
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

            var scores = await _unitOfWork.MemberScores.FindAsync(s => s.TeamMemberId == dto.TeamMemberId && s.CategoryId == dto.CategoryId);
            var existingScore = scores.FirstOrDefault();

            string oldValue;
            string newValue = $"Score = {dto.ScoreValue}, Notes = {dto.Notes}";
            MemberScore scoreEntity;

            if (existingScore != null)
            {
                oldValue = $"Score = {existingScore.ScoreValue}, Notes = {existingScore.Notes}";
                existingScore.ScoreValue = dto.ScoreValue;
                existingScore.Notes = dto.Notes;
                existingScore.UpdatedAt = DateTime.UtcNow;
                _unitOfWork.MemberScores.Update(existingScore);
                scoreEntity = existingScore;
            }
            else
            {
                oldValue = "(None)";
                scoreEntity = new MemberScore
                {
                    Id = Guid.NewGuid(),
                    TeamMemberId = dto.TeamMemberId,
                    CategoryId = dto.CategoryId,
                    ScoreValue = dto.ScoreValue,
                    Notes = dto.Notes,
                    UpdatedAt = DateTime.UtcNow
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
                {
                    s.Category = cat;
                }
                return s.ToDto();
            });
        }
    }
}
