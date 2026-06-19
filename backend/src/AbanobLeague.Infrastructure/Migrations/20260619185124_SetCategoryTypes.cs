using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AbanobLeague.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SetCategoryTypes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Set "شطارة" and "عدد في القداس" as Team-only categories
            migrationBuilder.Sql("UPDATE \"Categories\" SET \"Type\" = 'Team' WHERE \"Name\" IN ('شطارة', 'عدد في القداس')");

            // Set all other categories as Individual-only
            migrationBuilder.Sql("UPDATE \"Categories\" SET \"Type\" = 'Individual' WHERE \"Name\" NOT IN ('شطارة', 'عدد في القداس')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
