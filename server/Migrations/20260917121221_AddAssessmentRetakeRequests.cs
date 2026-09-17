using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class AddAssessmentRetakeRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AssessmentRetakeRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ParticipantId = table.Column<Guid>(type: "uuid", nullable: false),
                    WrittenAssessmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    PreviousAttemptId = table.Column<Guid>(type: "uuid", nullable: false),
                    Reason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ReviewedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    RequestedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReviewedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AdminRemarks = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssessmentRetakeRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AssessmentRetakeRequests_AssessmentAttempts_PreviousAttempt~",
                        column: x => x.PreviousAttemptId,
                        principalTable: "AssessmentAttempts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AssessmentRetakeRequests_ParticipantProfiles_ParticipantId",
                        column: x => x.ParticipantId,
                        principalTable: "ParticipantProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AssessmentRetakeRequests_WrittenAssessments_WrittenAssessme~",
                        column: x => x.WrittenAssessmentId,
                        principalTable: "WrittenAssessments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AssessmentRetakeRequests_ParticipantId",
                table: "AssessmentRetakeRequests",
                column: "ParticipantId");

            migrationBuilder.CreateIndex(
                name: "IX_AssessmentRetakeRequests_PreviousAttemptId",
                table: "AssessmentRetakeRequests",
                column: "PreviousAttemptId");

            migrationBuilder.CreateIndex(
                name: "IX_AssessmentRetakeRequests_Status",
                table: "AssessmentRetakeRequests",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_AssessmentRetakeRequests_WrittenAssessmentId",
                table: "AssessmentRetakeRequests",
                column: "WrittenAssessmentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AssessmentRetakeRequests");
        }
    }
}
