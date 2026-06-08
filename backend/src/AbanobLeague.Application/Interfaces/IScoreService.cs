using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AbanobLeague.Application.DTOs.Scores;

namespace AbanobLeague.Application.Interfaces
{
    public interface IScoreService
    {
        Task<ScoreDto> UpdateScoreAsync(UpdateScoreDto dto, Guid userId);
        Task<bool> DeleteScoreAsync(Guid scoreId, Guid userId);
        Task<ScoreMatrixDto> GetScoreMatrixAsync(Guid seasonId);
        Task<IEnumerable<ScoreDto>> GetScoresByTeamAsync(Guid teamId);
    }
}
