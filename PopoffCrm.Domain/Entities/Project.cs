namespace PopoffCrm.Domain.Entities;

public class Project : AuditedEntity
{
    public string Name { get; set; } = null!;
    public string Code { get; set; } = null!;
    public string? Description { get; set; }
    public string? RepositoryUrl { get; set; }

    public ICollection<Environment> Environments { get; set; } = new List<Environment>();
}
