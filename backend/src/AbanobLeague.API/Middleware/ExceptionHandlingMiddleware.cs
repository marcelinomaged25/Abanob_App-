using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AbanobLeague.API.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                if (ex is DbUpdateException dbEx)
                {
                    _logger.LogError(dbEx, "Database update failed: {Inner}", dbEx.InnerException?.Message);
                }
                else
                {
                    _logger.LogError(ex, "An unhandled exception occurred during request execution.");
                }
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            var statusCode = HttpStatusCode.InternalServerError;
            var message = "حدث خطأ غير متوقع في الخادم. يرجى المحاولة لاحقاً.";

            if (exception is DbUpdateException)
            {
                statusCode = HttpStatusCode.Conflict;
                message = "تعذر إتمام العملية لوجود بيانات مرتبطة. يرجى تحديث الصفحة والمحاولة مرة أخرى.";
            }
            else if (exception is ArgumentException argEx)
            {
                statusCode = HttpStatusCode.BadRequest;
                message = argEx.Message;
            }

            context.Response.StatusCode = (int)statusCode;

            var response = new
            {
                statusCode = context.Response.StatusCode,
                message,
                details = exception.Message
            };

            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            return context.Response.WriteAsync(JsonSerializer.Serialize(response, options));
        }
    }
}
