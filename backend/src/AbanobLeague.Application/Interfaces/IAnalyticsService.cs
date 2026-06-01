using System;
using System.Threading.Tasks;
using AbanobLeague.Application.DTOs.Analytics;

namespace AbanobLeague.Application.Interfaces
{
    public interface IAnalyticsService
    {
        Task<AnalyticsDto> GetAnalyticsAsync(Guid seasonId);
    }
}
