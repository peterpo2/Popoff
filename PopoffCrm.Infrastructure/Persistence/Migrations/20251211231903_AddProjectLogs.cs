using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PopoffCrm.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectLogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProjectAuditLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProjectId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EnvironmentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ActionType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Data = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CorrelationId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Origin = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectAuditLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectAuditLogs_Environments_EnvironmentId",
                        column: x => x.EnvironmentId,
                        principalTable: "Environments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectAuditLogs_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectErrorLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProjectId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EnvironmentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OccurredOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ErrorType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Details = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Source = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Severity = table.Column<int>(type: "int", nullable: false),
                    CorrelationId = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    RequestData = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsResolved = table.Column<bool>(type: "bit", nullable: false),
                    ResolvedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ResolvedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectErrorLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectErrorLogs_Environments_EnvironmentId",
                        column: x => x.EnvironmentId,
                        principalTable: "Environments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectErrorLogs_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectPerformanceLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProjectId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EnvironmentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    OperationName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DurationMs = table.Column<long>(type: "bigint", nullable: false),
                    ThresholdMs = table.Column<long>(type: "bigint", nullable: true),
                    IsSlow = table.Column<bool>(type: "bit", nullable: false),
                    Details = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectPerformanceLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectPerformanceLogs_Environments_EnvironmentId",
                        column: x => x.EnvironmentId,
                        principalTable: "Environments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectPerformanceLogs_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProjectAuditLogs_EnvironmentId",
                table: "ProjectAuditLogs",
                column: "EnvironmentId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectAuditLogs_ProjectId_EnvironmentId",
                table: "ProjectAuditLogs",
                columns: new[] { "ProjectId", "EnvironmentId" });

            migrationBuilder.CreateIndex(
                name: "IX_ProjectAuditLogs_Timestamp",
                table: "ProjectAuditLogs",
                column: "Timestamp");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectErrorLogs_EnvironmentId",
                table: "ProjectErrorLogs",
                column: "EnvironmentId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectErrorLogs_OccurredOn",
                table: "ProjectErrorLogs",
                column: "OccurredOn");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectErrorLogs_ProjectId_EnvironmentId_Severity",
                table: "ProjectErrorLogs",
                columns: new[] { "ProjectId", "EnvironmentId", "Severity" });

            migrationBuilder.CreateIndex(
                name: "IX_ProjectPerformanceLogs_EnvironmentId",
                table: "ProjectPerformanceLogs",
                column: "EnvironmentId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectPerformanceLogs_IsSlow",
                table: "ProjectPerformanceLogs",
                column: "IsSlow");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectPerformanceLogs_ProjectId_EnvironmentId",
                table: "ProjectPerformanceLogs",
                columns: new[] { "ProjectId", "EnvironmentId" });

            migrationBuilder.CreateIndex(
                name: "IX_ProjectPerformanceLogs_Timestamp",
                table: "ProjectPerformanceLogs",
                column: "Timestamp");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProjectAuditLogs");

            migrationBuilder.DropTable(
                name: "ProjectErrorLogs");

            migrationBuilder.DropTable(
                name: "ProjectPerformanceLogs");
        }
    }
}
