using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class AddTrainingSessions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "BreakHours",
                table: "TrainingBatches",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "DurationHours",
                table: "TrainingBatches",
                type: "numeric(8,2)",
                precision: 8,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<bool>(
                name: "IncludeWeekends",
                table: "TrainingBatches",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ScheduleStatus",
                table: "TrainingBatches",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "TrainingSessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TrainingBatchId = table.Column<Guid>(type: "uuid", nullable: false),
                    SessionNumber = table.Column<int>(type: "integer", nullable: false),
                    SessionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    StartTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    EndTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    DurationHours = table.Column<decimal>(type: "numeric(8,2)", precision: 8, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrainingSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TrainingSessions_TrainingBatches_TrainingBatchId",
                        column: x => x.TrainingBatchId,
                        principalTable: "TrainingBatches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TrainingSessions_TrainingBatchId_SessionDate",
                table: "TrainingSessions",
                columns: new[] { "TrainingBatchId", "SessionDate" });

            migrationBuilder.CreateIndex(
                name: "IX_TrainingSessions_TrainingBatchId_SessionNumber",
                table: "TrainingSessions",
                columns: new[] { "TrainingBatchId", "SessionNumber" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TrainingSessions");

            migrationBuilder.DropColumn(
                name: "BreakHours",
                table: "TrainingBatches");

            migrationBuilder.DropColumn(
                name: "DurationHours",
                table: "TrainingBatches");

            migrationBuilder.DropColumn(
                name: "IncludeWeekends",
                table: "TrainingBatches");

            migrationBuilder.DropColumn(
                name: "ScheduleStatus",
                table: "TrainingBatches");
        }
    }
}
