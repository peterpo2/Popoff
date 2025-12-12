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
public class ProjectController : ControllerBase
{
    private readonly PopoffCrmDbContext _dbContext;

    public ProjectController(PopoffCrmDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProjectDto>>> GetAll()
    {
        var projects = await _dbContext.Projects.ToListAsync();
        return Ok(projects.Select(p => p.ToDto()));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProjectDto>> GetById(Guid id)
    {
        var project = await _dbContext.Projects.FindAsync(id);
        if (project == null)
        {
            return NotFound();
        }

        return Ok(project.ToDto());
    }

    [HttpPost]
    public async Task<ActionResult<ProjectDto>> Create([FromBody] CreateProjectRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var now = DateTime.UtcNow;
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Code = request.Code,
            Description = request.Description,
            RepositoryUrl = request.RepositoryUrl,
            CreatedOn = now,
            UpdatedOn = now,
            IsDeleted = false
        };

        _dbContext.Projects.Add(project);
        await _dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = project.Id }, project.ToDto());
    }
}
