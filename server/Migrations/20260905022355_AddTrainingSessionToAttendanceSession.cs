using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class AddTrainingSessionToAttendanceSession : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "TrainingSessionId",
                table: "AttendanceSessions",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceSessions_TrainingSessionId",
                table: "AttendanceSessions",
                column: "TrainingSessionId");

            migrationBuilder.AddForeignKey(
                name: "FK_AttendanceSessions_TrainingSessions_TrainingSessionId",
                table: "AttendanceSessions",
                column: "TrainingSessionId",
                principalTable: "TrainingSessions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AttendanceSessions_TrainingSessions_TrainingSessionId",
                table: "AttendanceSessions");

            migrationBuilder.DropIndex(
                name: "IX_AttendanceSessions_TrainingSessionId",
                table: "AttendanceSessions");

            migrationBuilder.DropColumn(
                name: "TrainingSessionId",
                table: "AttendanceSessions");
        }
    }
}
