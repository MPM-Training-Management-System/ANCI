using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class ChangeAttendanceRecordDuplicateRule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AttendanceRecords_EnrollmentId_AttendanceDate",
                table: "AttendanceRecords");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_EnrollmentId_AttendanceSessionId",
                table: "AttendanceRecords",
                columns: new[] { "EnrollmentId", "AttendanceSessionId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AttendanceRecords_EnrollmentId_AttendanceSessionId",
                table: "AttendanceRecords");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_EnrollmentId_AttendanceDate",
                table: "AttendanceRecords",
                columns: new[] { "EnrollmentId", "AttendanceDate" },
                unique: true);
        }
    }
}
