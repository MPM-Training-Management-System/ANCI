using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class update : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DocumentType",
                table: "TrainingProgramDocuments");

            migrationBuilder.DropColumn(
                name: "DocumentType",
                table: "EnrollmentDocuments");

            migrationBuilder.AddColumn<Guid>(
                name: "RequirementId",
                table: "EnrollmentDocuments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_EnrollmentDocuments_RequirementId",
                table: "EnrollmentDocuments",
                column: "RequirementId");

            migrationBuilder.AddForeignKey(
                name: "FK_EnrollmentDocuments_TrainingProgramRequirements_Requirement~",
                table: "EnrollmentDocuments",
                column: "RequirementId",
                principalTable: "TrainingProgramRequirements",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EnrollmentDocuments_TrainingProgramRequirements_Requirement~",
                table: "EnrollmentDocuments");

            migrationBuilder.DropIndex(
                name: "IX_EnrollmentDocuments_RequirementId",
                table: "EnrollmentDocuments");

            migrationBuilder.DropColumn(
                name: "RequirementId",
                table: "EnrollmentDocuments");

            migrationBuilder.AddColumn<string>(
                name: "DocumentType",
                table: "TrainingProgramDocuments",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DocumentType",
                table: "EnrollmentDocuments",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");
        }
    }
}
