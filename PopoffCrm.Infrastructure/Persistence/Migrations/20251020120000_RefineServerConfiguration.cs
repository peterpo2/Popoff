using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PopoffCrm.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RefineServerConfiguration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ConnectionData",
                table: "Servers");

            migrationBuilder.DropColumn(
                name: "ConnectionType",
                table: "Servers");

            migrationBuilder.DropColumn(
                name: "HostName",
                table: "Servers");

            migrationBuilder.DropColumn(
                name: "IpAddress",
                table: "Servers");

            migrationBuilder.AddColumn<string>(
                name: "ReferenceKey",
                table: "Servers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Servers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "LocalDocker");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReferenceKey",
                table: "Servers");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Servers");

            migrationBuilder.AddColumn<string>(
                name: "ConnectionData",
                table: "Servers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ConnectionType",
                table: "Servers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "HostName",
                table: "Servers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IpAddress",
                table: "Servers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
