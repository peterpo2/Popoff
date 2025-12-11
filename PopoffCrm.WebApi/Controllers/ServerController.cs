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
public class ServerController : ControllerBase
{
    private readonly PopoffCrmDbContext _dbContext;

    public ServerController(PopoffCrmDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ServerDto>>> GetAll()
    {
        var servers = await _dbContext.Servers.ToListAsync();
        return Ok(servers.Select(s => s.ToDto()));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ServerDto>> GetById(Guid id)
    {
        var server = await _dbContext.Servers.FindAsync(id);
        if (server == null)
        {
            return NotFound();
        }

        return Ok(server.ToDto());
    }
}
