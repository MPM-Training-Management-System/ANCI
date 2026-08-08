using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class UpdateUserTrainerModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Participant_Users_UserId",
                table: "Participant");

            migrationBuilder.DropForeignKey(
                name: "FK_TrainerAssignments_TrainingPrograms_TrainingProgramId",
                table: "TrainerAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_TrainerAssignments_Users_ApprovedBy",
                table: "TrainerAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_TrainerAssignments_Users_TrainerId",
                table: "TrainerAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_TrainingPrograms_Users_TrainerId",
                table: "TrainingPrograms");

            migrationBuilder.DropForeignKey(
                name: "FK_TrainingSchedules_Users_TrainerId",
                table: "TrainingSchedules");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TrainerAssignments",
                table: "TrainerAssignments");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Participant",
                table: "Participant");

            migrationBuilder.DropIndex(
                name: "IX_Participant_Email",
                table: "Participant");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "Participant");

            migrationBuilder.DropColumn(
                name: "Username",
                table: "Participant");

            migrationBuilder.RenameTable(
                name: "TrainerAssignments",
                newName: "TrainingAssignments");

            migrationBuilder.RenameTable(
                name: "Participant",
                newName: "Participants");

            migrationBuilder.RenameIndex(
                name: "IX_TrainerAssignments_TrainingProgramId",
                table: "TrainingAssignments",
                newName: "IX_TrainingAssignments_TrainingProgramId");

            migrationBuilder.RenameIndex(
                name: "IX_TrainerAssignments_TrainerId",
                table: "TrainingAssignments",
                newName: "IX_TrainingAssignments_TrainerId");

            migrationBuilder.RenameIndex(
                name: "IX_TrainerAssignments_ApprovedBy",
                table: "TrainingAssignments",
                newName: "IX_TrainingAssignments_ApprovedBy");

            migrationBuilder.RenameIndex(
                name: "IX_Participant_UserId",
                table: "Participants",
                newName: "IX_Participants_UserId");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "TrainingSchedules",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "TrainingPrograms",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "AppliedAt",
                table: "TrainingAssignments",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TrainingAssignments",
                table: "TrainingAssignments",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Participants",
                table: "Participants",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "Trainers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    FirstName = table.Column<string>(type: "text", nullable: false),
                    MiddleName = table.Column<string>(type: "text", nullable: true),
                    LastName = table.Column<string>(type: "text", nullable: false),
                    DateOfBirth = table.Column<DateOnly>(type: "date", nullable: false),
                    Gender = table.Column<string>(type: "text", nullable: false),
                    CivilStatus = table.Column<string>(type: "text", nullable: false),
                    MobileNumber = table.Column<string>(type: "text", nullable: false),
                    HomeAddress = table.Column<string>(type: "text", nullable: false),
                    Expertise = table.Column<string>(type: "text", nullable: false),
                    YearsOfExperience = table.Column<int>(type: "integer", nullable: false),
                    Organization = table.Column<string>(type: "text", nullable: false),
                    Biography = table.Column<string>(type: "text", nullable: false),
                    IsVerified = table.Column<bool>(type: "boolean", nullable: false),
                    ProfileImage = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Trainers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Trainers_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Trainers_UserId",
                table: "Trainers",
                column: "UserId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Participants_Users_UserId",
                table: "Participants",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TrainingAssignments_Trainers_TrainerId",
                table: "TrainingAssignments",
                column: "TrainerId",
                principalTable: "Trainers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TrainingAssignments_TrainingPrograms_TrainingProgramId",
                table: "TrainingAssignments",
                column: "TrainingProgramId",
                principalTable: "TrainingPrograms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TrainingAssignments_Users_ApprovedBy",
                table: "TrainingAssignments",
                column: "ApprovedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TrainingPrograms_Trainers_TrainerId",
                table: "TrainingPrograms",
                column: "TrainerId",
                principalTable: "Trainers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_TrainingSchedules_Trainers_TrainerId",
                table: "TrainingSchedules",
                column: "TrainerId",
                principalTable: "Trainers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Participants_Users_UserId",
                table: "Participants");

            migrationBuilder.DropForeignKey(
                name: "FK_TrainingAssignments_Trainers_TrainerId",
                table: "TrainingAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_TrainingAssignments_TrainingPrograms_TrainingProgramId",
                table: "TrainingAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_TrainingAssignments_Users_ApprovedBy",
                table: "TrainingAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_TrainingPrograms_Trainers_TrainerId",
                table: "TrainingPrograms");

            migrationBuilder.DropForeignKey(
                name: "FK_TrainingSchedules_Trainers_TrainerId",
                table: "TrainingSchedules");

            migrationBuilder.DropTable(
                name: "Trainers");

            migrationBuilder.DropIndex(
                name: "IX_Users_Username",
                table: "Users");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TrainingAssignments",
                table: "TrainingAssignments");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Participants",
                table: "Participants");

            migrationBuilder.RenameTable(
                name: "TrainingAssignments",
                newName: "TrainerAssignments");

            migrationBuilder.RenameTable(
                name: "Participants",
                newName: "Participant");

            migrationBuilder.RenameIndex(
                name: "IX_TrainingAssignments_TrainingProgramId",
                table: "TrainerAssignments",
                newName: "IX_TrainerAssignments_TrainingProgramId");

            migrationBuilder.RenameIndex(
                name: "IX_TrainingAssignments_TrainerId",
                table: "TrainerAssignments",
                newName: "IX_TrainerAssignments_TrainerId");

            migrationBuilder.RenameIndex(
                name: "IX_TrainingAssignments_ApprovedBy",
                table: "TrainerAssignments",
                newName: "IX_TrainerAssignments_ApprovedBy");

            migrationBuilder.RenameIndex(
                name: "IX_Participants_UserId",
                table: "Participant",
                newName: "IX_Participant_UserId");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "TrainingSchedules",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "TrainingPrograms",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "AppliedAt",
                table: "TrainerAssignments",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "Participant",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Username",
                table: "Participant",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TrainerAssignments",
                table: "TrainerAssignments",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Participant",
                table: "Participant",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_Participant_Email",
                table: "Participant",
                column: "Email",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Participant_Users_UserId",
                table: "Participant",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TrainerAssignments_TrainingPrograms_TrainingProgramId",
                table: "TrainerAssignments",
                column: "TrainingProgramId",
                principalTable: "TrainingPrograms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TrainerAssignments_Users_ApprovedBy",
                table: "TrainerAssignments",
                column: "ApprovedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TrainerAssignments_Users_TrainerId",
                table: "TrainerAssignments",
                column: "TrainerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TrainingPrograms_Users_TrainerId",
                table: "TrainingPrograms",
                column: "TrainerId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TrainingSchedules_Users_TrainerId",
                table: "TrainingSchedules",
                column: "TrainerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
