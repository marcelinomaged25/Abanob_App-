using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AbanobLeague.Application.DTOs.MemberScores;
using AbanobLeague.Application.Interfaces;

namespace AbanobLeague.API.Controllers
{
    public class MemberScoresController : BaseApiController
    {
        private readonly IMemberScoreService _memberScoreService;

        public MemberScoresController(IMemberScoreService memberScoreService)
        {
            _memberScoreService = memberScoreService;
        }

        [HttpGet("season/{seasonId}/matrix")]
        public async Task<IActionResult> GetMatrix(Guid seasonId)
        {
            var result = await _memberScoreService.GetMemberScoreMatrixAsync(seasonId);
            return Ok(result);
        }

        [HttpGet("member/{teamMemberId}")]
        public async Task<IActionResult> GetByMember(Guid teamMemberId)
        {
            var result = await _memberScoreService.GetScoresByMemberAsync(teamMemberId);
            return Ok(result);
        }

        [Authorize]
        [HttpPut]
        public async Task<IActionResult> Update([FromBody] UpdateMemberScoreDto dto)
        {
            try
            {
                var result = await _memberScoreService.UpdateMemberScoreAsync(dto, UserId);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
