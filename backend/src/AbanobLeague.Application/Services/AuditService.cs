using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AbanobLeague.Application.DTOs.Audit;
using AbanobLeague.Application.Interfaces;
using AbanobLeague.Application.Mappings;
using AbanobLeague.Domain.Entities;
using AbanobLeague.Domain.Interfaces;

namespace AbanobLeague.Application.Services
{
    public class AuditService : IAuditService
    {
        private readonly IUnitOfWork _unitOfWork;

        public AuditService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task LogActionAsync(Guid? userId, string action, string entityName, string oldValue, string newValue)
        {
            var log = new AuditLog
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Action = action,
                EntityName = entityName,
                OldValue = oldValue,
                NewValue = newValue,
                Timestamp = DateTime.UtcNow
            };

            await _unitOfWork.AuditLogs.AddAsync(log);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<IEnumerable<AuditLogDto>> GetAuditLogsAsync()
        {
            var logs = await _unitOfWork.AuditLogs.GetAllAsync();
            var adminUsers = await _unitOfWork.AdminUsers.GetAllAsync();
            var userMap = adminUsers.ToDictionary(u => u.Id);

            return logs.Select(log =>
            {
                string fullName = "زائر / نظام";
                string email = "system";

                if (log.UserId.HasValue && userMap.TryGetValue(log.UserId.Value, out var user))
                {
                    fullName = user.FullName;
                    email = user.Email;
                }

                return log.ToDto(fullName, email);
            })
            .OrderByDescending(l => l.Timestamp)
            .ToList();
        }
    }
}
