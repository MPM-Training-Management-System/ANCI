using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class updatedata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FirstName",
                table: "Trainers");

            migrationBuilder.DropColumn(
                name: "LastName",
                table: "Trainers");

            migrationBuilder.DropColumn(
                name: "MiddleName",
                table: "Trainers");

            migrationBuilder.RenameColumn(
                name: "Fullname",
                table: "Users",
                newName: "LastName");

            migrationBuilder.AddColumn<string>(
                name: "FirstName",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "MiddleName",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsProfileCompleted",
                table: "Trainers",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FirstName",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "MiddleName",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsProfileCompleted",
                table: "Trainers");

            migrationBuilder.RenameColumn(
                name: "LastName",
                table: "Users",
                newName: "Fullname");

            migrationBuilder.AddColumn<string>(
                name: "FirstName",
                table: "Trainers",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LastName",
                table: "Trainers",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "MiddleName",
                table: "Trainers",
                type: "text",
                nullable: true);
        }
    }
}
