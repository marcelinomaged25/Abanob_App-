using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AbanobLeague.Application.DTOs.Scores;
using AbanobLeague.Application.Interfaces;

namespace AbanobLeague.API.Controllers
{
    public class ScoresController : BaseApiController
    {
        private readonly IScoreService _scoreService;

        public ScoresController(IScoreService scoreService)
        {
            _scoreService = scoreService;
        }

        [HttpGet("season/{seasonId}/matrix")]
        public async Task<IActionResult> GetMatrix(Guid seasonId)
        {
            var result = await _scoreService.GetScoreMatrixAsync(seasonId);
            return Ok(result);
        }

        [HttpGet("team/{teamId}")]
        public async Task<IActionResult> GetByTeam(Guid teamId)
        {
            var result = await _scoreService.GetScoresByTeamAsync(teamId);
            return Ok(result);
        }

        [Authorize]
        [HttpPut]
        public async Task<IActionResult> Update([FromBody] UpdateScoreDto dto)
        {
            try
            {
                var result = await _scoreService.UpdateScoreAsync(dto, UserId);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
