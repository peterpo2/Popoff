using System;
using System.ComponentModel.DataAnnotations;

namespace PopoffCrm.Application.DTOs;

public class UpsertEnvironmentRequest
{
    [Required]
    public Guid ProjectId { get; set; }

    [Required]
    public Guid ServerId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Slug { get; set; } = string.Empty;

    public bool IsProduction { get; set; }

    public string? FrontendUrl { get; set; }
    public string? ApiUrl { get; set; }
    public string? DockerComposePath { get; set; }
    public string? DockerProjectName { get; set; }
    public string? GitBranch { get; set; }
}
