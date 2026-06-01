using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AbanobLeague.Application.DTOs.Seasons;
using AbanobLeague.Application.Interfaces;

namespace AbanobLeague.API.Controllers
{
    public class SeasonsController : BaseApiController
    {
        private readonly ISeasonService _seasonService;

        public SeasonsController(ISeasonService seasonService)
        {
            _seasonService = seasonService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _seasonService.GetAllSeasonsAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _seasonService.GetSeasonByIdAsync(id);
            if (result == null) return NotFound(new { message = "الموسم غير موجود" });
            return Ok(result);
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActive()
        {
            var result = await _seasonService.GetActiveSeasonAsync();
            if (result == null) return NotFound(new { message = "لا يوجد موسم نشط حالياً" });
            return Ok(result);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSeasonDto dto)
        {
            var result = await _seasonService.CreateSeasonAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSeasonDto dto)
        {
            var result = await _seasonService.UpdateSeasonAsync(id, dto);
            if (result == null) return NotFound(new { message = "الموسم غير موجود" });
            return Ok(result);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _seasonService.DeleteSeasonAsync(id);
            if (!success) return NotFound(new { message = "الموسم غير موجود" });
            return NoContent();
        }

        [Authorize]
        [HttpPost("{id}/activate")]
        public async Task<IActionResult> Activate(Guid id)
        {
            var success = await _seasonService.ActivateSeasonAsync(id);
            if (!success) return NotFound(new { message = "الموسم غير موجود" });
            return Ok(new { message = "تم تفعيل الموسم بنجاح" });
        }
    }
}
