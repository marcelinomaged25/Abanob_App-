using System;
using System.Threading.Tasks;
using AbanobLeague.Application.DTOs.HallOfFame;

namespace AbanobLeague.Application.Interfaces
{
    public interface IHallOfFameService
    {
        Task<HallOfFameDto> GetHallOfFameAsync(Guid seasonId);
    }
}
