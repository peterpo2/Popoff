using System.ComponentModel.DataAnnotations;

namespace PopoffCrm.Application.DTOs;

public class CreateProjectRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Code { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    public string? RepositoryUrl { get; set; }
}
