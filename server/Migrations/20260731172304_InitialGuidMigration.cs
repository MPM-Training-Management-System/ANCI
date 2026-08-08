using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class InitialGuidMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    Username = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Password = table.Column<string>(type: "text", nullable: false),
                    Fullname = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Participant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProfileImage = table.Column<string>(type: "text", nullable: true),
                    FirstName = table.Column<string>(type: "text", nullable: false),
                    MiddleName = table.Column<string>(type: "text", nullable: true),
                    LastName = table.Column<string>(type: "text", nullable: false),
                    DateOfBirth = table.Column<DateOnly>(type: "date", nullable: false),
                    Gender = table.Column<string>(type: "text", nullable: false),
                    CivilStatus = table.Column<string>(type: "text", nullable: false),
                    MobileNumber = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Username = table.Column<string>(type: "text", nullable: false),
                    HomeAddress = table.Column<string>(type: "text", nullable: false),
                    EmergencyContactName = table.Column<string>(type: "text", nullable: true),
                    EmergencyRelationship = table.Column<string>(type: "text", nullable: true),
                    EmergencyContactNumber = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Participant", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Participant_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TrainingPrograms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProgramCode = table.Column<string>(type: "text", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Category = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Objectives = table.Column<string>(type: "text", nullable: false),
                    Venue = table.Column<string>(type: "text", nullable: false),
                    MaxParticipants = table.Column<int>(type: "integer", nullable: false),
                    TrainerId = table.Column<Guid>(type: "uuid", nullable: true),
                    Thumbnail = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrainingPrograms", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TrainingPrograms_Users_TrainerId",
                        column: x => x.TrainerId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "TrainingSchedules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TrainingProgramId = table.Column<Guid>(type: "uuid", nullable: false),
                    TrainerId = table.Column<Guid>(type: "uuid", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Venue = table.Column<string>(type: "text", nullable: false),
                    MaximumParticipants = table.Column<int>(type: "integer", nullable: false),
                    CurrentParticipants = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrainingSchedules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TrainingSchedules_TrainingPrograms_TrainingProgramId",
                        column: x => x.TrainingProgramId,
                        principalTable: "TrainingPrograms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TrainingSchedules_Users_TrainerId",
                        column: x => x.TrainerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Participant_Email",
                table: "Participant",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Participant_UserId",
                table: "Participant",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TrainingPrograms_TrainerId",
                table: "TrainingPrograms",
                column: "TrainerId");

            migrationBuilder.CreateIndex(
                name: "IX_TrainingSchedules_TrainerId",
                table: "TrainingSchedules",
                column: "TrainerId");

            migrationBuilder.CreateIndex(
                name: "IX_TrainingSchedules_TrainingProgramId",
                table: "TrainingSchedules",
                column: "TrainingProgramId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Participant");

            migrationBuilder.DropTable(
                name: "TrainingSchedules");

            migrationBuilder.DropTable(
                name: "TrainingPrograms");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
