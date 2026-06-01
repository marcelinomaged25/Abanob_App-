using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AbanobLeague.Application.DTOs.Categories;
using AbanobLeague.Application.Interfaces;

namespace AbanobLeague.API.Controllers
{
    public class CategoriesController : BaseApiController
    {
        private readonly ICategoryService _categoryService;

        public CategoriesController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpGet("season/{seasonId}")]
        public async Task<IActionResult> GetBySeason(Guid seasonId)
        {
            var result = await _categoryService.GetCategoriesBySeasonAsync(seasonId);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _categoryService.GetCategoryByIdAsync(id);
            if (result == null) return NotFound(new { message = "الفئة غير موجودة" });
            return Ok(result);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCategoryDto dto)
        {
            var result = await _categoryService.CreateCategoryAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCategoryDto dto)
        {
            var result = await _categoryService.UpdateCategoryAsync(id, dto);
            if (result == null) return NotFound(new { message = "الفئة غير موجودة" });
            return Ok(result);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _categoryService.DeleteCategoryAsync(id);
            if (!success) return NotFound(new { message = "الفئة غير موجودة" });
            return NoContent();
        }

        [Authorize]
        [HttpPut("season/{seasonId}/reorder")]
        public async Task<IActionResult> Reorder(Guid seasonId, [FromBody] List<CategoryReorderDto> reorders)
        {
            var success = await _categoryService.ReorderCategoriesAsync(seasonId, reorders);
            if (!success) return BadRequest(new { message = "فشل في إعادة ترتيب الفئات" });
            return Ok(new { message = "تم إعادة ترتيب الفئات بنجاح" });
        }
    }
}
