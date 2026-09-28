using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class AddLearningModuleFiles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_LearningModuleChunks_LearningModuleId_ChunkNumber",
                table: "LearningModuleChunks");

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

            migrationBuilder.AddColumn<Guid>(
                name: "LearningModuleFileId",
                table: "LearningModuleChunks",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "LearningModuleFiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    LearningModuleId = table.Column<Guid>(type: "uuid", nullable: false),
                    FileUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    PublicId = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    FileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    ContentType = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    ExtractedText = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LearningModuleFiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LearningModuleFiles_LearningModules_LearningModuleId",
                        column: x => x.LearningModuleId,
                        principalTable: "LearningModules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LearningModuleChunks_LearningModuleFileId",
                table: "LearningModuleChunks",
                column: "LearningModuleFileId");

            migrationBuilder.CreateIndex(
                name: "IX_LearningModuleChunks_LearningModuleFileId_ChunkNumber",
                table: "LearningModuleChunks",
                columns: new[] { "LearningModuleFileId", "ChunkNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LearningModuleChunks_LearningModuleId",
                table: "LearningModuleChunks",
                column: "LearningModuleId");

            migrationBuilder.CreateIndex(
                name: "IX_LearningModuleFiles_LearningModuleId",
                table: "LearningModuleFiles",
                column: "LearningModuleId");

            migrationBuilder.AddForeignKey(
                name: "FK_LearningModuleChunks_LearningModuleFiles_LearningModuleFile~",
                table: "LearningModuleChunks",
                column: "LearningModuleFileId",
                principalTable: "LearningModuleFiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LearningModuleChunks_LearningModuleFiles_LearningModuleFile~",
                table: "LearningModuleChunks");

            migrationBuilder.DropTable(
                name: "LearningModuleFiles");

            migrationBuilder.DropIndex(
                name: "IX_LearningModuleChunks_LearningModuleFileId",
                table: "LearningModuleChunks");

            migrationBuilder.DropIndex(
                name: "IX_LearningModuleChunks_LearningModuleFileId_ChunkNumber",
                table: "LearningModuleChunks");

            migrationBuilder.DropIndex(
                name: "IX_LearningModuleChunks_LearningModuleId",
                table: "LearningModuleChunks");

            migrationBuilder.DropColumn(
                name: "LearningModuleFileId",
                table: "LearningModuleChunks");

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

            migrationBuilder.CreateIndex(
                name: "IX_LearningModuleChunks_LearningModuleId_ChunkNumber",
                table: "LearningModuleChunks",
                columns: new[] { "LearningModuleId", "ChunkNumber" });
        }
    }
}
