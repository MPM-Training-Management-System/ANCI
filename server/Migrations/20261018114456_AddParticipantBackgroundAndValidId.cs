using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class AddParticipantBackgroundAndValidId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CompanyName",
                table: "ParticipantProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CourseOrDegree",
                table: "ParticipantProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EducationalStatus",
                table: "ParticipantProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EmergencyContactName",
                table: "ParticipantProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EmergencyContactNumber",
                table: "ParticipantProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EmergencyContactRelationship",
                table: "ParticipantProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EmploymentStatus",
                table: "ParticipantProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FieldOfStudy",
                table: "ParticipantProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HighestEducationalAttainment",
                table: "ParticipantProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Industry",
                table: "ParticipantProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "JobTitle",
                table: "ParticipantProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SchoolName",
                table: "ParticipantProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ValidIdImageUrl",
                table: "ParticipantProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ValidIdNumber",
                table: "ParticipantProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ValidIdRemarks",
                table: "ParticipantProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ValidIdType",
                table: "ParticipantProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ValidIdVerificationStatus",
                table: "ParticipantProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ValidIdVerifiedAt",
                table: "ParticipantProfiles",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ValidIdVerifiedBy",
                table: "ParticipantProfiles",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "YearGraduated",
                table: "ParticipantProfiles",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "YearsOfWorkExperience",
                table: "ParticipantProfiles",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompanyName",
                table: "ParticipantProfiles");

            migrationBuilder.DropColumn(
                name: "CourseOrDegree",
                table: "ParticipantProfiles");

            migrationBuilder.DropColumn(
                name: "EducationalStatus",
                table: "ParticipantProfiles");

            migrationBuilder.DropColumn(
                name: "EmergencyContactName",
                table: "ParticipantProfiles");

            migrationBuilder.DropColumn(
                name: "EmergencyContactNumber",
                table: "ParticipantProfiles");

            migrationBuilder.DropColumn(
                name: "EmergencyContactRelationship",
                table: "ParticipantProfiles");

            migrationBuilder.DropColumn(
                name: "EmploymentStatus",
                table: "ParticipantProfiles");

            migrationBuilder.DropColumn(
                name: "FieldOfStudy",
                table: "ParticipantProfiles");

            migrationBuilder.DropColumn(
                name: "HighestEducationalAttainment",
                table: "ParticipantProfiles");

            migrationBuilder.DropColumn(
                name: "Industry",
                table: "ParticipantProfiles");

            migrationBuilder.DropColumn(
                name: "JobTitle",
                table: "ParticipantProfiles");

            migrationBuilder.DropColumn(
                name: "SchoolName",
                table: "ParticipantProfiles");

            migrationBuilder.DropColumn(
                name: "ValidIdImageUrl",
                table: "ParticipantProfiles");

            migrationBuilder.DropColumn(
                name: "ValidIdNumber",
                table: "ParticipantProfiles");

            migrationBuilder.DropColumn(
                name: "ValidIdRemarks",
                table: "ParticipantProfiles");

            migrationBuilder.DropColumn(
                name: "ValidIdType",
                table: "ParticipantProfiles");

            migrationBuilder.DropColumn(
                name: "ValidIdVerificationStatus",
                table: "ParticipantProfiles");

            migrationBuilder.DropColumn(
                name: "ValidIdVerifiedAt",
                table: "ParticipantProfiles");

            migrationBuilder.DropColumn(
                name: "ValidIdVerifiedBy",
                table: "ParticipantProfiles");

            migrationBuilder.DropColumn(
                name: "YearGraduated",
                table: "ParticipantProfiles");

            migrationBuilder.DropColumn(
                name: "YearsOfWorkExperience",
                table: "ParticipantProfiles");
        }
    }
}
