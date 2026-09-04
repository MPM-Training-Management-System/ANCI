using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class SeparateManualAttendanceAndDailyAttendance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AttendanceRecords_AttendanceSessionId_EnrollmentId",
                table: "AttendanceRecords");

            migrationBuilder.AddColumn<string>(
                name: "ManualAttendanceStatus",
                table: "AttendanceSessions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateOnly>(
                name: "AttendanceDate",
                table: "AttendanceRecords",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_EnrollmentId_AttendanceDate",
                table: "AttendanceRecords",
                columns: new[] { "EnrollmentId", "AttendanceDate" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AttendanceRecords_EnrollmentId_AttendanceDate",
                table: "AttendanceRecords");

            migrationBuilder.DropColumn(
                name: "ManualAttendanceStatus",
                table: "AttendanceSessions");

            migrationBuilder.DropColumn(
                name: "AttendanceDate",
                table: "AttendanceRecords");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_AttendanceSessionId_EnrollmentId",
                table: "AttendanceRecords",
                columns: new[] { "AttendanceSessionId", "EnrollmentId" },
                unique: true);
        }
    }
}
