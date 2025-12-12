using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PopoffCrm.Application.Common;
using PopoffCrm.Application.DTOs;
using PopoffCrm.Application.Interfaces;
using PopoffCrm.Domain.Entities;
using PopoffCrm.Infrastructure.Persistence;

namespace PopoffCrm.WebApi.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class DeploymentController : ControllerBase
{
    private readonly PopoffCrmDbContext _dbContext;
    private readonly IDockerService _dockerService;

    public DeploymentController(PopoffCrmDbContext dbContext, IDockerService dockerService)
    {
        _dbContext = dbContext;
        _dockerService = dockerService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DeploymentDto>>> GetAll()
    {
        var deployments = await _dbContext.Deployments.AsNoTracking().ToListAsync();
        return Ok(deployments.Select(d => d.ToDto()));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DeploymentDto>> GetById(Guid id)
    {
        var deployment = await _dbContext.Deployments.FindAsync(id);
        if (deployment == null)
        {
            return NotFound();
        }

        return Ok(deployment.ToDto());
    }

    [HttpPost("/api/environments/{environmentId}/deploy")]
    public async Task<ActionResult<DeploymentDto>> DeployEnvironment(Guid environmentId)
    {
        var env = await _dbContext.Environments
            .Include(e => e.Project)
            .Include(e => e.Server)
            .FirstOrDefaultAsync(e => e.Id == environmentId);
        if (env == null)
        {
            return NotFound();
        }

        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (!Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized();
        }

        var deployment = new Deployment
        {
            Id = Guid.NewGuid(),
            EnvironmentId = env.Id,
            RequestedByUserId = userId,
            StartedAt = DateTime.UtcNow,
            Status = DeploymentStatus.Pending,
            Branch = env.GitBranch,
            TriggerType = "Manual"
        };

        _dbContext.Deployments.Add(deployment);
        await _dbContext.SaveChangesAsync();

        deployment.Status = DeploymentStatus.Running;
        _dbContext.Deployments.Update(deployment);
        await _dbContext.SaveChangesAsync();

        var result = await _dockerService.DeployEnvironmentAsync(env);
        deployment.Status = result.Success ? DeploymentStatus.Success : DeploymentStatus.Failed;
        deployment.FinishedAt = DateTime.UtcNow;
        deployment.LogExcerpt = result.Logs ?? result.Message;
        _dbContext.Deployments.Update(deployment);
        await _dbContext.SaveChangesAsync();

        return Ok(deployment.ToDto());
    }
}
