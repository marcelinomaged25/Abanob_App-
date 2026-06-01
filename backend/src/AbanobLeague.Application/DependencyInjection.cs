using Microsoft.Extensions.DependencyInjection;
using AbanobLeague.Application.Interfaces;
using AbanobLeague.Application.Services;

namespace AbanobLeague.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            services.AddScoped<ISeasonService, SeasonService>();
            services.AddScoped<ITeamService, TeamService>();
            services.AddScoped<ICategoryService, CategoryService>();
            services.AddScoped<IScoreService, ScoreService>();
            services.AddScoped<IMemberScoreService, MemberScoreService>();
            services.AddScoped<IRankingService, RankingService>();
            services.AddScoped<IAnalyticsService, AnalyticsService>();
            services.AddScoped<IQuickStatsService, QuickStatsService>();
            services.AddScoped<IHallOfFameService, HallOfFameService>();
            services.AddScoped<IAuditService, AuditService>();
            services.AddScoped<IAuthService, AuthService>();

            return services;
        }
    }
}
