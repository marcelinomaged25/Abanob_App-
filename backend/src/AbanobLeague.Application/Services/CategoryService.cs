using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AbanobLeague.Application.DTOs.Categories;
using AbanobLeague.Application.Interfaces;
using AbanobLeague.Application.Mappings;
using AbanobLeague.Domain.Entities;
using AbanobLeague.Domain.Interfaces;

namespace AbanobLeague.Application.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly IUnitOfWork _unitOfWork;

        public CategoryService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<CategoryDto>> GetCategoriesBySeasonAsync(Guid seasonId)
        {
            var categories = await _unitOfWork.Categories.FindAsync(c => c.SeasonId == seasonId);
            return categories.Select(c => c.ToDto()).OrderBy(c => c.Order);
        }

        public async Task<CategoryDto?> GetCategoryByIdAsync(Guid id)
        {
            var category = await _unitOfWork.Categories.GetByIdAsync(id);
            return category?.ToDto();
        }

        public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto dto)
        {
            var category = new Category
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                MaxScore = dto.MaxScore,
                Order = dto.Order,
                SeasonId = dto.SeasonId
            };

            await _unitOfWork.Categories.AddAsync(category);
            await _unitOfWork.SaveChangesAsync();

            return category.ToDto();
        }

        public async Task<CategoryDto?> UpdateCategoryAsync(Guid id, UpdateCategoryDto dto)
        {
            var category = await _unitOfWork.Categories.GetByIdAsync(id);
            if (category == null) return null;

            category.Name = dto.Name;
            category.MaxScore = dto.MaxScore;
            category.Order = dto.Order;

            _unitOfWork.Categories.Update(category);
            await _unitOfWork.SaveChangesAsync();

            return category.ToDto();
        }

        public async Task<bool> DeleteCategoryAsync(Guid id)
        {
            var category = await _unitOfWork.Categories.GetByIdAsync(id);
            if (category == null) return false;

            var memberScores = (await _unitOfWork.MemberScores.FindAsync(s => s.CategoryId == id)).ToList();
            foreach (var memberScore in memberScores)
            {
                _unitOfWork.MemberScores.Delete(memberScore);
            }
            await _unitOfWork.SaveChangesAsync();

            var scores = (await _unitOfWork.Scores.FindAsync(s => s.CategoryId == id)).ToList();
            foreach (var score in scores)
            {
                _unitOfWork.Scores.Delete(score);
            }
            await _unitOfWork.SaveChangesAsync();

            _unitOfWork.Categories.Delete(category);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ReorderCategoriesAsync(Guid seasonId, List<CategoryReorderDto> reorders)
        {
            var categories = await _unitOfWork.Categories.FindAsync(c => c.SeasonId == seasonId);
            var categoryMap = categories.ToDictionary(c => c.Id);

            foreach (var item in reorders)
            {
                if (categoryMap.TryGetValue(item.CategoryId, out var category))
                {
                    category.Order = item.Order;
                    _unitOfWork.Categories.Update(category);
                }
            }

            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}
