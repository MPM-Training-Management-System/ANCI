using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class AddWrittenAssessmentSourceDocument : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SourceContentType",
                table: "WrittenAssessments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SourceFileName",
                table: "WrittenAssessments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "SourceFileSize",
                table: "WrittenAssessments",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SourceFileUrl",
                table: "WrittenAssessments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SourcePublicId",
                table: "WrittenAssessments",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SourceContentType",
                table: "WrittenAssessments");

            migrationBuilder.DropColumn(
                name: "SourceFileName",
                table: "WrittenAssessments");

            migrationBuilder.DropColumn(
                name: "SourceFileSize",
                table: "WrittenAssessments");

            migrationBuilder.DropColumn(
                name: "SourceFileUrl",
                table: "WrittenAssessments");

            migrationBuilder.DropColumn(
                name: "SourcePublicId",
                table: "WrittenAssessments");
        }
    }
}
