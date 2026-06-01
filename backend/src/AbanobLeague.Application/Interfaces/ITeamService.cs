using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AbanobLeague.Application.DTOs.Teams;

namespace AbanobLeague.Application.Interfaces
{
    public interface ITeamService
    {
        Task<IEnumerable<TeamDto>> GetTeamsBySeasonAsync(Guid seasonId);
        Task<TeamDto?> GetTeamByIdAsync(Guid id);
        Task<TeamDto> CreateTeamAsync(CreateTeamDto dto, string? logoUrl = null);
        Task<TeamDto?> UpdateTeamAsync(Guid id, UpdateTeamDto dto, string? logoUrl = null);
        Task<bool> DeleteTeamAsync(Guid id);
        Task<TeamProfileDto?> GetTeamProfileAsync(Guid id);
    }
}
