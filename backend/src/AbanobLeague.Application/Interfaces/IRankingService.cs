using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AbanobLeague.Application.DTOs.Standings;

namespace AbanobLeague.Application.Interfaces
{
    public interface IRankingService
    {
        Task<StandingsDto> GetStandingsAsync(Guid seasonId);
        Task<IEnumerable<LeaderboardEntryDto>> GetLiveLeaderboardAsync(Guid seasonId);
        Task SaveRankingSnapshotAsync(Guid seasonId);
    }
}
