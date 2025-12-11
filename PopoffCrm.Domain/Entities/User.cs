namespace PopoffCrm.Domain.Entities;

public class User : AuditedEntity
{
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string DisplayName { get; set; } = null!;
    public string Role { get; set; } = "Admin";

    public ICollection<Deployment> Deployments { get; set; } = new List<Deployment>();
}
