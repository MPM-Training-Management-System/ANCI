using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTrainerApplicationStructure : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "CertificationNumber",
                table: "TrainerApplications",
                newName: "ProfessionalTitle");

            migrationBuilder.RenameColumn(
                name: "CertificationName",
                table: "TrainerApplications",
                newName: "ProfessionalLicenseType");

            migrationBuilder.AlterColumn<string>(
                name: "MiddleName",
                table: "TrainerProfiles",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "LastName",
                table: "TrainerProfiles",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Gender",
                table: "TrainerProfiles",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "FirstName",
                table: "TrainerProfiles",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Bio",
                table: "TrainerProfiles",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Address",
                table: "TrainerProfiles",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CurrentOrganization",
                table: "TrainerProfiles",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MobileNumber",
                table: "TrainerProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "ProfessionalLicenseExpirationDate",
                table: "TrainerProfiles",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProfessionalLicenseNumber",
                table: "TrainerProfiles",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProfessionalLicenseType",
                table: "TrainerProfiles",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProfessionalTitle",
                table: "TrainerProfiles",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Suffix",
                table: "TrainerProfiles",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ProfileImageUrl",
                table: "TrainerApplications",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "TrainerApplications",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Bio",
                table: "TrainerApplications",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "BirthDate",
                table: "TrainerApplications",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CurrentOrganization",
                table: "TrainerApplications",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FirstName",
                table: "TrainerApplications",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Gender",
                table: "TrainerApplications",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastName",
                table: "TrainerApplications",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MiddleName",
                table: "TrainerApplications",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "ProfessionalLicenseExpirationDate",
                table: "TrainerApplications",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProfessionalLicenseNumber",
                table: "TrainerApplications",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Suffix",
                table: "TrainerApplications",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "TrainerApplicationCertifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TrainerApplicationId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    IssuingOrganization = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    IssuedDate = table.Column<DateOnly>(type: "date", nullable: true),
                    ExpirationDate = table.Column<DateOnly>(type: "date", nullable: true),
                    CertificateUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrainerApplicationCertifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TrainerApplicationCertifications_TrainerApplications_Traine~",
                        column: x => x.TrainerApplicationId,
                        principalTable: "TrainerApplications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TrainerApplicationEducations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TrainerApplicationId = table.Column<Guid>(type: "uuid", nullable: false),
                    Degree = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    FieldOfStudy = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Institution = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    YearGraduated = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrainerApplicationEducations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TrainerApplicationEducations_TrainerApplications_TrainerApp~",
                        column: x => x.TrainerApplicationId,
                        principalTable: "TrainerApplications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TrainerCertifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TrainerProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    IssuingOrganization = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    IssuedDate = table.Column<DateOnly>(type: "date", nullable: true),
                    ExpirationDate = table.Column<DateOnly>(type: "date", nullable: true),
                    CertificateUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrainerCertifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TrainerCertifications_TrainerProfiles_TrainerProfileId",
                        column: x => x.TrainerProfileId,
                        principalTable: "TrainerProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TrainerEducations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TrainerProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    Degree = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    FieldOfStudy = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Institution = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    YearGraduated = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrainerEducations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TrainerEducations_TrainerProfiles_TrainerProfileId",
                        column: x => x.TrainerProfileId,
                        principalTable: "TrainerProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TrainerApplicationCertifications_TrainerApplicationId",
                table: "TrainerApplicationCertifications",
                column: "TrainerApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_TrainerApplicationEducations_TrainerApplicationId",
                table: "TrainerApplicationEducations",
                column: "TrainerApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_TrainerCertifications_TrainerProfileId",
                table: "TrainerCertifications",
                column: "TrainerProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_TrainerEducations_TrainerProfileId",
                table: "TrainerEducations",
                column: "TrainerProfileId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TrainerApplicationCertifications");

            migrationBuilder.DropTable(
                name: "TrainerApplicationEducations");

            migrationBuilder.DropTable(
                name: "TrainerCertifications");

            migrationBuilder.DropTable(
                name: "TrainerEducations");

            migrationBuilder.DropColumn(
                name: "CurrentOrganization",
                table: "TrainerProfiles");

            migrationBuilder.DropColumn(
                name: "MobileNumber",
                table: "TrainerProfiles");

            migrationBuilder.DropColumn(
                name: "ProfessionalLicenseExpirationDate",
                table: "TrainerProfiles");

            migrationBuilder.DropColumn(
                name: "ProfessionalLicenseNumber",
                table: "TrainerProfiles");

            migrationBuilder.DropColumn(
                name: "ProfessionalLicenseType",
                table: "TrainerProfiles");

            migrationBuilder.DropColumn(
                name: "ProfessionalTitle",
                table: "TrainerProfiles");

            migrationBuilder.DropColumn(
                name: "Suffix",
                table: "TrainerProfiles");

            migrationBuilder.DropColumn(
                name: "Address",
                table: "TrainerApplications");

            migrationBuilder.DropColumn(
                name: "Bio",
                table: "TrainerApplications");

            migrationBuilder.DropColumn(
                name: "BirthDate",
                table: "TrainerApplications");

            migrationBuilder.DropColumn(
                name: "CurrentOrganization",
                table: "TrainerApplications");

            migrationBuilder.DropColumn(
                name: "FirstName",
                table: "TrainerApplications");

            migrationBuilder.DropColumn(
                name: "Gender",
                table: "TrainerApplications");

            migrationBuilder.DropColumn(
                name: "LastName",
                table: "TrainerApplications");

            migrationBuilder.DropColumn(
                name: "MiddleName",
                table: "TrainerApplications");

            migrationBuilder.DropColumn(
                name: "ProfessionalLicenseExpirationDate",
                table: "TrainerApplications");

            migrationBuilder.DropColumn(
                name: "ProfessionalLicenseNumber",
                table: "TrainerApplications");

            migrationBuilder.DropColumn(
                name: "Suffix",
                table: "TrainerApplications");

            migrationBuilder.RenameColumn(
                name: "ProfessionalTitle",
                table: "TrainerApplications",
                newName: "CertificationNumber");

            migrationBuilder.RenameColumn(
                name: "ProfessionalLicenseType",
                table: "TrainerApplications",
                newName: "CertificationName");

            migrationBuilder.AlterColumn<string>(
                name: "MiddleName",
                table: "TrainerProfiles",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "LastName",
                table: "TrainerProfiles",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Gender",
                table: "TrainerProfiles",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "FirstName",
                table: "TrainerProfiles",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Bio",
                table: "TrainerProfiles",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(2000)",
                oldMaxLength: 2000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Address",
                table: "TrainerProfiles",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ProfileImageUrl",
                table: "TrainerApplications",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000,
                oldNullable: true);
        }
    }
}
