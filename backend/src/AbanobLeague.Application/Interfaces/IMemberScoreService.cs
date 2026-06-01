using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AbanobLeague.Application.DTOs.MemberScores;

namespace AbanobLeague.Application.Interfaces
{
    public interface IMemberScoreService
    {
        Task<MemberScoreMatrixDto> GetMemberScoreMatrixAsync(Guid seasonId);
        Task<MemberScoreDto> UpdateMemberScoreAsync(UpdateMemberScoreDto dto, Guid userId);
        Task<IEnumerable<MemberScoreDto>> GetScoresByMemberAsync(Guid teamMemberId);
    }
}
