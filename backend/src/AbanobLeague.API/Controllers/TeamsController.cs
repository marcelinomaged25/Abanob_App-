using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using AbanobLeague.Application.DTOs.Teams;
using AbanobLeague.Application.Interfaces;

namespace AbanobLeague.API.Controllers
{
    public class TeamsController : BaseApiController
    {
        private readonly ITeamService _teamService;
        private readonly IWebHostEnvironment _env;

        public TeamsController(ITeamService teamService, IWebHostEnvironment env)
        {
            _teamService = teamService;
            _env = env;
        }

        [HttpGet("season/{seasonId}")]
        public async Task<IActionResult> GetBySeason(Guid seasonId)
        {
            var result = await _teamService.GetTeamsBySeasonAsync(seasonId);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _teamService.GetTeamByIdAsync(id);
            if (result == null) return NotFound(new { message = "الفريق غير موجود" });
            return Ok(result);
        }

        [HttpGet("{id}/profile")]
        public async Task<IActionResult> GetProfile(Guid id)
        {
            var result = await _teamService.GetTeamProfileAsync(id);
            if (result == null) return NotFound(new { message = "الفريق غير موجود" });
            return Ok(result);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTeamDto dto)
        {
            var result = await _teamService.CreateTeamAsync(dto, null);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTeamDto dto)
        {
            var result = await _teamService.UpdateTeamAsync(id, dto, null);
            if (result == null) return NotFound(new { message = "الفريق غير موجود" });
            return Ok(result);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _teamService.DeleteTeamAsync(id);
            if (!success) return NotFound(new { message = "الفريق غير موجود" });
            return NoContent();
        }

        [Authorize]
        [HttpPost("{id}/logo")]
        public async Task<IActionResult> UploadLogo(Guid id, IFormFile file)
        {
            var team = await _teamService.GetTeamByIdAsync(id);
            if (team == null) return NotFound(new { message = "الفريق غير موجود" });

            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "الملف غير صالح" });
            }

            // Create directories if they don't exist
            var uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "logos");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var extension = Path.GetExtension(file.FileName);
            var fileName = $"{id}{extension}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Relative URL path
            var logoUrl = $"/uploads/logos/{fileName}";
            var dto = new UpdateTeamDto { Name = team.Name, Description = team.Description };
            var updatedTeam = await _teamService.UpdateTeamAsync(id, dto, logoUrl);

            return Ok(updatedTeam);
        }
    }
}
