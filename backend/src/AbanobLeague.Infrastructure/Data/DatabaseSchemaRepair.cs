using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace AbanobLeague.Infrastructure.Data
{
    /// <summary>
    /// Repairs legacy SQLite databases that were created with an older migration id
    /// (e.g. 20260531230408_InitialCreate) so EF Core will not apply TeamMembers/MemberScores.
    /// </summary>
    public static class DatabaseSchemaRepair
    {
        private const string TeamMembersMigrationId = "20260602000000_AddTeamMembersAndMemberScores";
        private const string CurrentInitialMigrationId = "20260601000509_InitialCreate";

        public static async Task EnsureTeamMembersSchemaAsync(AppDbContext context)
        {
            var teamMembersExists = await TableExistsAsync(context, "TeamMembers");
            if (!teamMembersExists)
            {
                await context.Database.ExecuteSqlRawAsync(@"
CREATE TABLE IF NOT EXISTS ""TeamMembers"" (
    ""Id"" TEXT NOT NULL CONSTRAINT ""PK_TeamMembers"" PRIMARY KEY,
    ""TeamId"" TEXT NOT NULL,
    ""FullName"" TEXT NOT NULL,
    ""DisplayOrder"" INTEGER NOT NULL,
    ""CreatedAt"" TEXT NOT NULL,
    CONSTRAINT ""FK_TeamMembers_Teams_TeamId"" FOREIGN KEY (""TeamId"") REFERENCES ""Teams"" (""Id"") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS ""IX_TeamMembers_TeamId"" ON ""TeamMembers"" (""TeamId"");
CREATE INDEX IF NOT EXISTS ""IX_TeamMembers_TeamId_DisplayOrder"" ON ""TeamMembers"" (""TeamId"", ""DisplayOrder"");

CREATE TABLE IF NOT EXISTS ""MemberScores"" (
    ""Id"" TEXT NOT NULL CONSTRAINT ""PK_MemberScores"" PRIMARY KEY,
    ""TeamMemberId"" TEXT NOT NULL,
    ""CategoryId"" TEXT NOT NULL,
    ""ScoreValue"" INTEGER NOT NULL,
    ""Notes"" TEXT NOT NULL,
    ""UpdatedAt"" TEXT NOT NULL,
    CONSTRAINT ""FK_MemberScores_Categories_CategoryId"" FOREIGN KEY (""CategoryId"") REFERENCES ""Categories"" (""Id"") ON DELETE CASCADE,
    CONSTRAINT ""FK_MemberScores_TeamMembers_TeamMemberId"" FOREIGN KEY (""TeamMemberId"") REFERENCES ""TeamMembers"" (""Id"") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS ""IX_MemberScores_CategoryId"" ON ""MemberScores"" (""CategoryId"");
CREATE UNIQUE INDEX IF NOT EXISTS ""IX_MemberScores_TeamMemberId_CategoryId"" ON ""MemberScores"" (""TeamMemberId"", ""CategoryId"");
");
            }

            // Prevent EF from trying to re-apply InitialCreate on legacy databases.
            await context.Database.ExecuteSqlRawAsync($@"
INSERT OR IGNORE INTO ""__EFMigrationsHistory"" (""MigrationId"", ""ProductVersion"")
VALUES ('{CurrentInitialMigrationId}', '8.0.11');
INSERT OR IGNORE INTO ""__EFMigrationsHistory"" (""MigrationId"", ""ProductVersion"")
VALUES ('{TeamMembersMigrationId}', '8.0.11');
");
        }

        private static async Task<bool> TableExistsAsync(AppDbContext context, string tableName)
        {
            var connection = context.Database.GetDbConnection();
            if (connection.State != System.Data.ConnectionState.Open)
            {
                await connection.OpenAsync();
            }

            await using var command = connection.CreateCommand();
            command.CommandText = "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = $name;";
            var parameter = command.CreateParameter();
            parameter.ParameterName = "$name";
            parameter.Value = tableName;
            command.Parameters.Add(parameter);

            var result = await command.ExecuteScalarAsync();
            return Convert.ToInt64(result) > 0;
        }
    }
}
