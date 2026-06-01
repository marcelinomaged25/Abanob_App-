using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AbanobLeague.Application.DTOs.Seasons;
using AbanobLeague.Application.Interfaces;
using AbanobLeague.Application.Mappings;
using AbanobLeague.Domain.Entities;
using AbanobLeague.Domain.Interfaces;

namespace AbanobLeague.Application.Services
{
    public class SeasonService : ISeasonService
    {
        private readonly IUnitOfWork _unitOfWork;

        public SeasonService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<SeasonDto>> GetAllSeasonsAsync()
        {
            var seasons = await _unitOfWork.Seasons.GetAllAsync();
            return seasons.Select(s => s.ToDto()).OrderByDescending(s => s.CreatedAt);
        }

        public async Task<SeasonDto?> GetSeasonByIdAsync(Guid id)
        {
            var season = await _unitOfWork.Seasons.GetByIdAsync(id);
            return season?.ToDto();
        }

        public async Task<SeasonDto?> GetActiveSeasonAsync()
        {
            var activeSeasons = await _unitOfWork.Seasons.FindAsync(s => s.IsActive);
            return activeSeasons.FirstOrDefault()?.ToDto();
        }

        public async Task<SeasonDto> CreateSeasonAsync(CreateSeasonDto dto)
        {
            var season = new Season
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Description = dto.Description,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                IsActive = false, // Set false by default, must activate explicitly
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Seasons.AddAsync(season);
            await _unitOfWork.SaveChangesAsync();

            return season.ToDto();
        }

        public async Task<SeasonDto?> UpdateSeasonAsync(Guid id, UpdateSeasonDto dto)
        {
            var season = await _unitOfWork.Seasons.GetByIdAsync(id);
            if (season == null) return null;

            season.Name = dto.Name;
            season.Description = dto.Description;
            season.StartDate = dto.StartDate;
            season.EndDate = dto.EndDate;

            if (dto.IsActive && !season.IsActive)
            {
                // Deactivate others
                var activeSeasons = await _unitOfWork.Seasons.FindAsync(s => s.IsActive);
                foreach (var active in activeSeasons)
                {
                    active.IsActive = false;
                    _unitOfWork.Seasons.Update(active);
                }
                season.IsActive = true;
            }
            else if (!dto.IsActive && season.IsActive)
            {
                season.IsActive = false;
            }

            _unitOfWork.Seasons.Update(season);
            await _unitOfWork.SaveChangesAsync();

            return season.ToDto();
        }

        public async Task<bool> DeleteSeasonAsync(Guid id)
        {
            var season = await _unitOfWork.Seasons.GetByIdAsync(id);
            if (season == null) return false;

            // SQLite keeps some of the season graph on restrictive foreign keys
            // (notably ranking snapshots, scores, and member records), so we remove dependent rows
            // explicitly before deleting the season itself.
            var teams = (await _unitOfWork.Teams.FindAsync(t => t.SeasonId == id)).ToList();
            var categories = (await _unitOfWork.Categories.FindAsync(c => c.SeasonId == id)).ToList();
            var rankingSnapshots = (await _unitOfWork.RankingSnapshots.FindAsync(rs => rs.SeasonId == id)).ToList();
            var teamMembers = (await _unitOfWork.TeamMembers.FindAsync(tm => teams.Select(t => t.Id).Contains(tm.TeamId))).ToList();

            var teamIds = teams.Select(t => t.Id).ToHashSet();
            var categoryIds = categories.Select(c => c.Id).ToHashSet();
            var scores = (await _unitOfWork.Scores.GetAllAsync())
                .Where(score => teamIds.Contains(score.TeamId) || categoryIds.Contains(score.CategoryId))
                .ToList();
            var memberIds = teamMembers.Select(m => m.Id).ToHashSet();
            var memberScores = (await _unitOfWork.MemberScores.GetAllAsync())
                .Where(score => memberIds.Contains(score.TeamMemberId) || categoryIds.Contains(score.CategoryId))
                .ToList();

            foreach (var memberScore in memberScores)
            {
                _unitOfWork.MemberScores.Delete(memberScore);
            }

            foreach (var score in scores)
            {
                _unitOfWork.Scores.Delete(score);
            }

            foreach (var snapshot in rankingSnapshots)
            {
                _unitOfWork.RankingSnapshots.Delete(snapshot);
            }

            foreach (var team in teams)
            {
                _unitOfWork.Teams.Delete(team);
            }

            foreach (var member in teamMembers)
            {
                _unitOfWork.TeamMembers.Delete(member);
            }

            foreach (var category in categories)
            {
                _unitOfWork.Categories.Delete(category);
            }

            _unitOfWork.Seasons.Delete(season);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ActivateSeasonAsync(Guid id)
        {
            var season = await _unitOfWork.Seasons.GetByIdAsync(id);
            if (season == null) return false;

            var activeSeasons = await _unitOfWork.Seasons.FindAsync(s => s.IsActive);
            foreach (var active in activeSeasons)
            {
                active.IsActive = false;
                _unitOfWork.Seasons.Update(active);
            }

            season.IsActive = true;
            _unitOfWork.Seasons.Update(season);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}
