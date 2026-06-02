using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AbanobLeague.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AllowMultipleScoresPerCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Scores_TeamId_CategoryId",
                table: "Scores");



            migrationBuilder.CreateIndex(
                name: "IX_Scores_TeamId_CategoryId",
                table: "Scores",
                columns: new[] { "TeamId", "CategoryId" });


        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {


            migrationBuilder.DropIndex(
                name: "IX_Scores_TeamId_CategoryId",
                table: "Scores");

            migrationBuilder.CreateIndex(
                name: "IX_Scores_TeamId_CategoryId",
                table: "Scores",
                columns: new[] { "TeamId", "CategoryId" },
                unique: true);
        }
    }
}
