using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class practionalassessment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PracticalAssessments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TrainingBatchId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    PassingPercentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    IsPublished = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PracticalAssessments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PracticalAssessments_TrainingBatches_TrainingBatchId",
                        column: x => x.TrainingBatchId,
                        principalTable: "TrainingBatches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PracticalAssessmentCriteria",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PracticalAssessmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    WeightPercentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PracticalAssessmentCriteria", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PracticalAssessmentCriteria_PracticalAssessments_PracticalA~",
                        column: x => x.PracticalAssessmentId,
                        principalTable: "PracticalAssessments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PracticalAssessmentResults",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PracticalAssessmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    EnrollmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    TotalScore = table.Column<decimal>(type: "numeric(8,2)", precision: 8, scale: 2, nullable: false),
                    Percentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    IsPassed = table.Column<bool>(type: "boolean", nullable: false),
                    TrainerRemarks = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    EvaluatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    EvaluatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PracticalAssessmentResults", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PracticalAssessmentResults_Enrollments_EnrollmentId",
                        column: x => x.EnrollmentId,
                        principalTable: "Enrollments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PracticalAssessmentResults_PracticalAssessments_PracticalAs~",
                        column: x => x.PracticalAssessmentId,
                        principalTable: "PracticalAssessments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PracticalAssessmentCriterionScores",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PracticalAssessmentResultId = table.Column<Guid>(type: "uuid", nullable: false),
                    PracticalAssessmentCriterionId = table.Column<Guid>(type: "uuid", nullable: false),
                    Score = table.Column<decimal>(type: "numeric(8,2)", precision: 8, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PracticalAssessmentCriterionScores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PracticalAssessmentCriterionScores_PracticalAssessmentCrite~",
                        column: x => x.PracticalAssessmentCriterionId,
                        principalTable: "PracticalAssessmentCriteria",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PracticalAssessmentCriterionScores_PracticalAssessmentResul~",
                        column: x => x.PracticalAssessmentResultId,
                        principalTable: "PracticalAssessmentResults",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PracticalAssessmentCriteria_PracticalAssessmentId_DisplayOr~",
                table: "PracticalAssessmentCriteria",
                columns: new[] { "PracticalAssessmentId", "DisplayOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_PracticalAssessmentCriterionScores_PracticalAssessmentCrite~",
                table: "PracticalAssessmentCriterionScores",
                column: "PracticalAssessmentCriterionId");

            migrationBuilder.CreateIndex(
                name: "IX_PracticalAssessmentCriterionScores_PracticalAssessmentResul~",
                table: "PracticalAssessmentCriterionScores",
                columns: new[] { "PracticalAssessmentResultId", "PracticalAssessmentCriterionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PracticalAssessmentResults_EnrollmentId",
                table: "PracticalAssessmentResults",
                column: "EnrollmentId");

            migrationBuilder.CreateIndex(
                name: "IX_PracticalAssessmentResults_PracticalAssessmentId_Enrollment~",
                table: "PracticalAssessmentResults",
                columns: new[] { "PracticalAssessmentId", "EnrollmentId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PracticalAssessments_TrainingBatchId",
                table: "PracticalAssessments",
                column: "TrainingBatchId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PracticalAssessmentCriterionScores");

            migrationBuilder.DropTable(
                name: "PracticalAssessmentCriteria");

            migrationBuilder.DropTable(
                name: "PracticalAssessmentResults");

            migrationBuilder.DropTable(
                name: "PracticalAssessments");
        }
    }
}
