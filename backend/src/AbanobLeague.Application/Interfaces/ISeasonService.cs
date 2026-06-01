using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AbanobLeague.Application.DTOs.Seasons;

namespace AbanobLeague.Application.Interfaces
{
    public interface ISeasonService
    {
        Task<IEnumerable<SeasonDto>> GetAllSeasonsAsync();
        Task<SeasonDto?> GetSeasonByIdAsync(Guid id);
        Task<SeasonDto?> GetActiveSeasonAsync();
        Task<SeasonDto> CreateSeasonAsync(CreateSeasonDto dto);
        Task<SeasonDto?> UpdateSeasonAsync(Guid id, UpdateSeasonDto dto);
        Task<bool> DeleteSeasonAsync(Guid id);
        Task<bool> ActivateSeasonAsync(Guid id);
    }
}
