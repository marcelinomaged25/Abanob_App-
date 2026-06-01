using System;
using System.Threading.Tasks;
using AbanobLeague.Application.DTOs.Stats;

namespace AbanobLeague.Application.Interfaces
{
    public interface IQuickStatsService
    {
        Task<QuickStatsDto> GetQuickStatsAsync(Guid seasonId);
    }
}
