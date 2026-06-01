using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AbanobLeague.Domain.Entities;
using AbanobLeague.Domain.Interfaces;

namespace AbanobLeague.Application.Services
{
    internal sealed class SeasonScoringData
    {
        public List<Team> Teams { get; init; } = new();
        public List<Category> Categories { get; init; } = new();
        public List<TeamMember> Members { get; init; } = new();
        public List<Score> TeamScores { get; init; } = new();
        public List<MemberScore> MemberScores { get; init; } = new();
        public Dictionary<Guid, List<Score>> TeamScoresByTeamId { get; init; } = new();
        public Dictionary<Guid, List<TeamMember>> MembersByTeamId { get; init; } = new();
        public Dictionary<Guid, List<MemberScore>> MemberScoresByMemberId { get; init; } = new();
        public Dictionary<Guid, Dictionary<Guid, int>> CombinedCategoryScoresByTeamId { get; init; } = new();
        public Dictionary<Guid, int> CombinedTotalsByTeamId { get; init; } = new();
        public Dictionary<Guid, int> MemberTotalsByMemberId { get; init; } = new();
    }

    internal static class SeasonScoreHelper
    {
        internal static async Task<SeasonScoringData> LoadAsync(IUnitOfWork unitOfWork, Guid seasonId)
        {
            var teams = (await unitOfWork.Teams.FindAsync(t => t.SeasonId == seasonId)).ToList();
            var categories = (await unitOfWork.Categories.FindAsync(c => c.SeasonId == seasonId)).ToList();
            var teamIds = teams.Select(t => t.Id).ToHashSet();
            var categoryIds = categories.Select(c => c.Id).ToHashSet();

            var teamScores = (await unitOfWork.Scores.GetAllAsync())
                .Where(score => teamIds.Contains(score.TeamId) && categoryIds.Contains(score.CategoryId))
                .ToList();

            var members = (await unitOfWork.TeamMembers.FindAsync(m => teamIds.Contains(m.TeamId))).ToList();
            var memberIds = members.Select(m => m.Id).ToHashSet();

            var memberScores = (await unitOfWork.MemberScores.GetAllAsync())
                .Where(score => memberIds.Contains(score.TeamMemberId) && categoryIds.Contains(score.CategoryId))
                .ToList();

            var teamScoresByTeamId = teamScores
                .GroupBy(s => s.TeamId)
                .ToDictionary(g => g.Key, g => g.ToList());

            var membersByTeamId = members
                .GroupBy(m => m.TeamId)
                .ToDictionary(g => g.Key, g => g.OrderBy(m => m.DisplayOrder).ThenBy(m => m.FullName).ToList());

            var memberScoresByMemberId = memberScores
                .GroupBy(s => s.TeamMemberId)
                .ToDictionary(g => g.Key, g => g.ToList());

            var combinedScoresByTeamId = new Dictionary<Guid, Dictionary<Guid, int>>();
            var combinedTotalsByTeamId = new Dictionary<Guid, int>();
            var memberTotalsByMemberId = new Dictionary<Guid, int>();

            foreach (var team in teams)
            {
                var byCategory = categories.ToDictionary(cat => cat.Id, _ => 0);

                if (teamScoresByTeamId.TryGetValue(team.Id, out var teamScoreList))
                {
                    foreach (var score in teamScoreList)
                    {
                        byCategory[score.CategoryId] += score.ScoreValue;
                    }
                }

                if (membersByTeamId.TryGetValue(team.Id, out var teamMembers))
                {
                    foreach (var member in teamMembers)
                    {
                        if (!memberScoresByMemberId.TryGetValue(member.Id, out var scoresForMember))
                        {
                            continue;
                        }

                        foreach (var score in scoresForMember)
                        {
                            byCategory[score.CategoryId] += score.ScoreValue;
                        }

                        memberTotalsByMemberId[member.Id] = scoresForMember.Sum(s => s.ScoreValue);
                    }
                }

                combinedScoresByTeamId[team.Id] = byCategory;
                combinedTotalsByTeamId[team.Id] = byCategory.Values.Sum();
            }

            return new SeasonScoringData
            {
                Teams = teams,
                Categories = categories,
                Members = members,
                TeamScores = teamScores,
                MemberScores = memberScores,
                TeamScoresByTeamId = teamScoresByTeamId,
                MembersByTeamId = membersByTeamId,
                MemberScoresByMemberId = memberScoresByMemberId,
                CombinedCategoryScoresByTeamId = combinedScoresByTeamId,
                CombinedTotalsByTeamId = combinedTotalsByTeamId,
                MemberTotalsByMemberId = memberTotalsByMemberId
            };
        }
    }
}
