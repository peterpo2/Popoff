using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PopoffCrm.Application.Common;
using PopoffCrm.Application.DTOs;
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
}
