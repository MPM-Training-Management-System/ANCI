using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class AddLearningModuleFileAndChunks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_LearningModules_LearningMaterialId_DisplayOrder",
                table: "LearningModules");

            migrationBuilder.DropIndex(
                name: "IX_LearningModules_LearningMaterialId_ModuleNumber",
                table: "LearningModules");

            migrationBuilder.AddColumn<string>(
                name: "ContentType",
                table: "LearningModules",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExtractedText",
                table: "LearningModules",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FileName",
                table: "LearningModules",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "FileSize",
                table: "LearningModules",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FileUrl",
                table: "LearningModules",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PublicId",
                table: "LearningModules",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "LearningModuleChunks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    LearningModuleId = table.Column<Guid>(type: "uuid", nullable: false),
                    ChunkNumber = table.Column<int>(type: "integer", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    CharacterCount = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LearningModuleChunks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LearningModuleChunks_LearningModules_LearningModuleId",
                        column: x => x.LearningModuleId,
                        principalTable: "LearningModules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LearningModules_LearningMaterialId",
                table: "LearningModules",
                column: "LearningMaterialId");

            migrationBuilder.CreateIndex(
                name: "IX_LearningModuleChunks_LearningModuleId_ChunkNumber",
                table: "LearningModuleChunks",
                columns: new[] { "LearningModuleId", "ChunkNumber" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LearningModuleChunks");

            migrationBuilder.DropIndex(
                name: "IX_LearningModules_LearningMaterialId",
                table: "LearningModules");

            migrationBuilder.DropColumn(
                name: "ContentType",
                table: "LearningModules");

            migrationBuilder.DropColumn(
                name: "ExtractedText",
                table: "LearningModules");

            migrationBuilder.DropColumn(
                name: "FileName",
                table: "LearningModules");

            migrationBuilder.DropColumn(
                name: "FileSize",
                table: "LearningModules");

            migrationBuilder.DropColumn(
                name: "FileUrl",
                table: "LearningModules");

            migrationBuilder.DropColumn(
                name: "PublicId",
                table: "LearningModules");

            migrationBuilder.CreateIndex(
                name: "IX_LearningModules_LearningMaterialId_DisplayOrder",
                table: "LearningModules",
                columns: new[] { "LearningMaterialId", "DisplayOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_LearningModules_LearningMaterialId_ModuleNumber",
                table: "LearningModules",
                columns: new[] { "LearningMaterialId", "ModuleNumber" },
                unique: true);
        }
    }
}
