using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class UpdateUserIdStructure : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Participant_ParticipantId",
                table: "Participant");

            migrationBuilder.DropColumn(
                name: "ParticipantId",
                table: "Participant");

            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Users");

            migrationBuilder.AddColumn<string>(
                name: "ParticipantId",
                table: "Participant",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Participant_ParticipantId",
                table: "Participant",
                column: "ParticipantId",
                unique: true);
        }
    }
}
