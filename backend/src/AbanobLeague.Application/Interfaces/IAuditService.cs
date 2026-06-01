using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AbanobLeague.Application.DTOs.Audit;

namespace AbanobLeague.Application.Interfaces
{
    public interface IAuditService
    {
        Task LogActionAsync(Guid? userId, string action, string entityName, string oldValue, string newValue);
        Task<IEnumerable<AuditLogDto>> GetAuditLogsAsync();
    }
}
