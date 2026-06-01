using System;
using AbanobLeague.Domain.Entities;
using AbanobLeague.Application.DTOs.Seasons;
using AbanobLeague.Application.DTOs.Teams;
using AbanobLeague.Application.DTOs.Categories;
using AbanobLeague.Application.DTOs.Scores;
using AbanobLeague.Application.DTOs.MemberScores;
using AbanobLeague.Application.DTOs.Audit;

namespace AbanobLeague.Application.Mappings
{
    public static class MappingExtensions
    {
        public static SeasonDto ToDto(this Season season)
        {
            if (season == null) throw new ArgumentNullException(nameof(season));
            return new SeasonDto
            {
                Id = season.Id,
                Name = season.Name,
                Description = season.Description,
                StartDate = season.StartDate,
                EndDate = season.EndDate,
                IsActive = season.IsActive,
                CreatedAt = season.CreatedAt
            };
        }

        public static TeamDto ToDto(this Team team)
        {
            if (team == null) throw new ArgumentNullException(nameof(team));
            return new TeamDto
            {
                Id = team.Id,
                Name = team.Name,
                LogoUrl = team.LogoUrl,
                Description = team.Description,
                SeasonId = team.SeasonId,
                SeasonName = team.Season?.Name ?? string.Empty,
                MemberCount = team.Members?.Count ?? 0,
                CreatedAt = team.CreatedAt
            };
        }

        public static TeamMemberDto ToDto(this TeamMember member)
        {
            if (member == null) throw new ArgumentNullException(nameof(member));
            return new TeamMemberDto
            {
                Id = member.Id,
                TeamId = member.TeamId,
                TeamName = member.Team?.Name ?? string.Empty,
                FullName = member.FullName,
                DisplayOrder = member.DisplayOrder
            };
        }

        public static CategoryDto ToDto(this Category category)
        {
            if (category == null) throw new ArgumentNullException(nameof(category));
            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                MaxScore = category.MaxScore,
                Order = category.Order,
                SeasonId = category.SeasonId
            };
        }

        public static ScoreDto ToDto(this Score score)
        {
            if (score == null) throw new ArgumentNullException(nameof(score));
            return new ScoreDto
            {
                Id = score.Id,
                TeamId = score.TeamId,
                TeamName = score.Team?.Name ?? string.Empty,
                CategoryId = score.CategoryId,
                CategoryName = score.Category?.Name ?? string.Empty,
                ScoreValue = score.ScoreValue,
                MaxScore = score.Category?.MaxScore ?? 0,
                Notes = score.Notes,
                UpdatedAt = score.UpdatedAt
            };
        }

        public static MemberScoreDto ToDto(this MemberScore score)
        {
            if (score == null) throw new ArgumentNullException(nameof(score));
            return new MemberScoreDto
            {
                Id = score.Id,
                TeamMemberId = score.TeamMemberId,
                TeamMemberName = score.TeamMember?.FullName ?? string.Empty,
                TeamId = score.TeamMember?.TeamId ?? Guid.Empty,
                TeamName = score.TeamMember?.Team?.Name ?? string.Empty,
                CategoryId = score.CategoryId,
                CategoryName = score.Category?.Name ?? string.Empty,
                ScoreValue = score.ScoreValue,
                MaxScore = score.Category?.MaxScore ?? 0,
                Notes = score.Notes,
                UpdatedAt = score.UpdatedAt
            };
        }

        public static AuditLogDto ToDto(this AuditLog log, string fullName, string email)
        {
            if (log == null) throw new ArgumentNullException(nameof(log));
            return new AuditLogDto
            {
                Id = log.Id,
                UserId = log.UserId,
                UserFullName = fullName,
                UserEmail = email,
                Action = log.Action,
                EntityName = log.EntityName,
                OldValue = log.OldValue,
                NewValue = log.NewValue,
                Timestamp = log.Timestamp
            };
        }
    }
}
