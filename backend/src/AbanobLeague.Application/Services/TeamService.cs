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
            var teams = (await _unitOfWork.Teams.FindAsync(t => t.SeasonId == seasonId)).ToList();
            var season = await _unitOfWork.Seasons.GetByIdAsync(seasonId);
            var teamIds = teams.Select(t => t.Id).ToList();
            var members = teamIds.Count == 0
                ? new List<TeamMember>()
                : (await _unitOfWork.TeamMembers.FindAsync(m => teamIds.Contains(m.TeamId))).ToList();
            var memberCounts = members.GroupBy(m => m.TeamId).ToDictionary(g => g.Key, g => g.Count());

            return teams.Select(t => {
                t.Season = season;
                var dto = t.ToDto();
                dto.MemberCount = memberCounts.TryGetValue(t.Id, out var count) ? count : 0;
                return dto;
            }).OrderBy(t => t.Name);
        }

        public async Task<TeamDto?> GetTeamByIdAsync(Guid id)
        {
            var team = await _unitOfWork.Teams.GetByIdAsync(id);
            if (team != null)
            {
                team.Season = await _unitOfWork.Seasons.GetByIdAsync(team.SeasonId);
                team.Members = (await _unitOfWork.TeamMembers.FindAsync(m => m.TeamId == team.Id)).ToList();
            }
            var dto = team?.ToDto();
            if (dto != null)
            {
                dto.MemberCount = team?.Members.Count ?? 0;
            }
            return dto;
        }

        public async Task<TeamDto> CreateTeamAsync(CreateTeamDto dto, string? logoUrl = null)
        {
            var season = await _unitOfWork.Seasons.GetByIdAsync(dto.SeasonId);
            if (season == null)
            {
                throw new ArgumentException("الموسم المحدد غير موجود. حدّث الصفحة واختر موسمًا من القائمة.");
            }

            var memberNames = NormalizeMemberNames(dto.MemberNames);
            if (memberNames.Count > 10)
            {
                throw new ArgumentException("لا يمكن أن يتجاوز الفريق 10 أفراد.");
            }

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
            await AddMembersAsync(team.Id, memberNames);
            await _unitOfWork.SaveChangesAsync();

            team.Season = season;
            team.Members = (await _unitOfWork.TeamMembers.FindAsync(m => m.TeamId == team.Id)).ToList();
            var result = team.ToDto();
            result.MemberCount = team.Members.Count;
            return result;
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

            if (dto.MemberNames != null)
            {
                var memberNames = NormalizeMemberNames(dto.MemberNames);
                if (memberNames.Count > 10)
                {
                    throw new ArgumentException("لا يمكن أن يتجاوز الفريق 10 أفراد.");
                }

                await ReplaceMembersAsync(team.Id, memberNames);
            }

            await _unitOfWork.SaveChangesAsync();

            team.Season = await _unitOfWork.Seasons.GetByIdAsync(team.SeasonId);
            team.Members = (await _unitOfWork.TeamMembers.FindAsync(m => m.TeamId == team.Id)).ToList();
            var result = team.ToDto();
            result.MemberCount = team.Members.Count;
            return result;
        }

        public async Task<bool> DeleteTeamAsync(Guid id)
        {
            var team = await _unitOfWork.Teams.GetByIdAsync(id);
            if (team == null) return false;

            var members = (await _unitOfWork.TeamMembers.FindAsync(m => m.TeamId == id)).ToList();
            var memberIds = members.Select(m => m.Id).ToHashSet();
            var scores = (await _unitOfWork.MemberScores.GetAllAsync())
                .Where(score => memberIds.Contains(score.TeamMemberId))
                .ToList();
            foreach (var score in scores)
            {
                _unitOfWork.MemberScores.Delete(score);
            }
            await _unitOfWork.SaveChangesAsync();

            foreach (var member in members)
            {
                _unitOfWork.TeamMembers.Delete(member);
            }
            await _unitOfWork.SaveChangesAsync();

            var teamScores = (await _unitOfWork.Scores.FindAsync(s => s.TeamId == id)).ToList();
            foreach (var score in teamScores)
            {
                _unitOfWork.Scores.Delete(score);
            }
            await _unitOfWork.SaveChangesAsync();

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
            var scoringData = await SeasonScoreHelper.LoadAsync(_unitOfWork, team.SeasonId);
            var allTeams = scoringData.Teams;

            var rankings = allTeams.Select(t => {
                var total = scoringData.CombinedTotalsByTeamId.TryGetValue(t.Id, out var combined) ? combined : 0;
                return new { TeamId = t.Id, TotalScore = total };
            })
            .OrderByDescending(r => r.TotalScore)
            .ToList();

            int rank = rankings.FindIndex(r => r.TeamId == id) + 1;
            int totalScore = rankings.FirstOrDefault(r => r.TeamId == id)?.TotalScore ?? 0;
            int teamScoreTotal = (await _unitOfWork.Scores.FindAsync(s => s.TeamId == id && categoriesList.Select(c => c.Id).Contains(s.CategoryId))).Sum(s => s.ScoreValue);

            var teamMembers = (await _unitOfWork.TeamMembers.FindAsync(m => m.TeamId == id))
                .OrderBy(m => m.DisplayOrder)
                .ThenBy(m => m.FullName)
                .ToList();
            var memberScores = (await _unitOfWork.MemberScores.GetAllAsync())
                .Where(s => teamMembers.Select(m => m.Id).Contains(s.TeamMemberId) && categoriesList.Select(c => c.Id).Contains(s.CategoryId))
                .ToList();
            var memberScoreMap = memberScores.GroupBy(s => s.TeamMemberId).ToDictionary(g => g.Key, g => g.ToList());
            var memberScoreTotal = memberScores.Sum(s => s.ScoreValue);

            // Prepare Category Breakdown
            var teamScores = (await _unitOfWork.Scores.FindAsync(s => s.TeamId == id && categoriesList.Select(c => c.Id).Contains(s.CategoryId))).ToList();
            var categoryBreakdown = new List<CategoryScoreDto>();

            foreach (var cat in categoriesList)
            {
                var categoryScores = teamScores.Where(s => s.CategoryId == cat.Id).ToList();
                int scoreVal = categoryScores.Sum(s => s.ScoreValue);
                double percentage = cat.MaxScore > 0 ? ((double)scoreVal / cat.MaxScore) * 100 : 0;

                categoryBreakdown.Add(new CategoryScoreDto
                {
                    CategoryId = cat.Id,
                    CategoryName = cat.Name,
                    Score = scoreVal,
                    MaxScore = cat.MaxScore,
                    Percentage = Math.Round(percentage, 1),
                    Notes = categoryScores.OrderByDescending(s => s.UpdatedAt).FirstOrDefault()?.Notes ?? string.Empty
                });
            }

            var memberDtos = teamMembers.Select(member => new TeamMemberDto
            {
                Id = member.Id,
                TeamId = member.TeamId,
                TeamName = team.Name,
                FullName = member.FullName,
                DisplayOrder = member.DisplayOrder,
                TotalScore = memberScoreMap.TryGetValue(member.Id, out var list) ? list.Sum(s => s.ScoreValue) : 0
            }).ToList();

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
                TeamScoreTotal = teamScoreTotal,
                MemberScoreTotal = memberScoreTotal,
                CategoryScores = categoryBreakdown
                ,
                Members = memberDtos
            };
        }

        private async Task AddMembersAsync(Guid teamId, List<string> memberNames)
        {
            if (memberNames.Count == 0) return;

            for (var i = 0; i < memberNames.Count; i++)
            {
                await _unitOfWork.TeamMembers.AddAsync(new TeamMember
                {
                    Id = Guid.NewGuid(),
                    TeamId = teamId,
                    FullName = memberNames[i],
                    DisplayOrder = i + 1,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        private async Task ReplaceMembersAsync(Guid teamId, List<string> memberNames)
        {
            var existingMembers = (await _unitOfWork.TeamMembers.FindAsync(m => m.TeamId == teamId)).ToList();
            var existingMemberIds = existingMembers.Select(m => m.Id).ToHashSet();

            var existingScores = (await _unitOfWork.MemberScores.GetAllAsync())
                .Where(s => existingMemberIds.Contains(s.TeamMemberId))
                .ToList();

            foreach (var score in existingScores)
            {
                _unitOfWork.MemberScores.Delete(score);
            }

            foreach (var member in existingMembers)
            {
                _unitOfWork.TeamMembers.Delete(member);
            }

            await AddMembersAsync(teamId, memberNames);
        }

        private static List<string> NormalizeMemberNames(List<string>? memberNames)
        {
            if (memberNames == null) return new List<string>();

            return memberNames
                .Select(name => name?.Trim())
                .Where(name => !string.IsNullOrWhiteSpace(name))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList()!;
        }
    }
}
