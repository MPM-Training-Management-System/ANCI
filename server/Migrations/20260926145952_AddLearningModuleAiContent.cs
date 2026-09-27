using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class AddLearningModuleAiContent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "KeyTakeaways",
                table: "LearningModules",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LearningObjectives",
                table: "LearningModules",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Summary",
                table: "LearningModules",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WelcomeContent",
                table: "LearningModules",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "KeyTakeaways",
                table: "LearningModules");

            migrationBuilder.DropColumn(
                name: "LearningObjectives",
                table: "LearningModules");

            migrationBuilder.DropColumn(
                name: "Summary",
                table: "LearningModules");

            migrationBuilder.DropColumn(
                name: "WelcomeContent",
                table: "LearningModules");
        }
    }
}
