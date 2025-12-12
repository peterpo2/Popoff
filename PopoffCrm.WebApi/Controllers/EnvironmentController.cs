using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PopoffCrm.Application.Common;
using PopoffCrm.Application.DTOs;
using PopoffCrm.Domain.Entities;
using PopoffCrm.Infrastructure.Persistence;

namespace PopoffCrm.WebApi.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class EnvironmentController : ControllerBase
{
    private readonly PopoffCrmDbContext _dbContext;

    public EnvironmentController(PopoffCrmDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EnvironmentDto>> GetById(Guid id)
    {
        var env = await _dbContext.Environments
            .Include(e => e.Project)
            .Include(e => e.Server)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (env == null)
        {
            return NotFound();
        }

        return Ok(env.ToDto());
    }

    [HttpGet("by-project/{projectId}")]
    public async Task<ActionResult<IEnumerable<EnvironmentDto>>> GetByProject(Guid projectId)
    {
        var envs = await _dbContext.Environments
            .Include(e => e.Project)
            .Include(e => e.Server)
            .Where(e => e.ProjectId == projectId)
            .ToListAsync();

        return Ok(envs.Select(e => e.ToDto()));
    }

    [HttpPost]
    public async Task<ActionResult<EnvironmentDto>> Create([FromBody] UpsertEnvironmentRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var projectExists = await _dbContext.Projects.AnyAsync(p => p.Id == request.ProjectId);
        var server = await _dbContext.Servers.FirstOrDefaultAsync(s => s.Id == request.ServerId);

        if (!projectExists || server == null)
        {
            return BadRequest("Project or server not found.");
        }

        var now = DateTime.UtcNow;
        var env = new Environment
        {
            Id = Guid.NewGuid(),
            ProjectId = request.ProjectId,
            ServerId = request.ServerId,
            Name = request.Name,
            Slug = request.Slug,
            IsProduction = request.IsProduction,
            FrontendUrl = request.FrontendUrl,
            ApiUrl = request.ApiUrl,
            DockerComposePath = request.DockerComposePath,
            DockerProjectName = request.DockerProjectName,
            GitBranch = request.GitBranch,
            CreatedOn = now,
            UpdatedOn = now,
            IsDeleted = false
        };

        _dbContext.Environments.Add(env);
        await _dbContext.SaveChangesAsync();

        await _dbContext.Entry(env).Reference(e => e.Project).LoadAsync();
        _dbContext.Entry(env).Reference(e => e.Server).Load();

        return CreatedAtAction(nameof(GetById), new { id = env.Id }, env.ToDto());
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<EnvironmentDto>> Update(Guid id, [FromBody] UpsertEnvironmentRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var env = await _dbContext.Environments.Include(e => e.Project).Include(e => e.Server).FirstOrDefaultAsync(e => e.Id == id);
        if (env == null)
        {
            return NotFound();
        }

        var projectExists = await _dbContext.Projects.AnyAsync(p => p.Id == request.ProjectId);
        var server = await _dbContext.Servers.FirstOrDefaultAsync(s => s.Id == request.ServerId);

        if (!projectExists || server == null)
        {
            return BadRequest("Project or server not found.");
        }

        env.ProjectId = request.ProjectId;
        env.ServerId = request.ServerId;
        env.Name = request.Name;
        env.Slug = request.Slug;
        env.IsProduction = request.IsProduction;
        env.FrontendUrl = request.FrontendUrl;
        env.ApiUrl = request.ApiUrl;
        env.DockerComposePath = request.DockerComposePath;
        env.DockerProjectName = request.DockerProjectName;
        env.GitBranch = request.GitBranch;
        env.UpdatedOn = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return Ok(env.ToDto());
    }
}
