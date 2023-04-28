using GameControl.Server.Database;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;

namespace GameControl.Server.Controllers.Player
{
    [Authorize]
    [Route("api/player/team")]
    public class PlayerTeamController : Controller
    {
        private readonly GameControlContext dbContext;

        public PlayerTeamController(GameControlContext dbContext)
        {
            this.dbContext = dbContext;
        }

        [HttpGet("{eventInstanceId}")]
        public IActionResult GetTeam(Guid eventInstanceId)
        {
            Guid participantId = Guid.Parse(User.Claims.First(p => p.Type == "ParticipantId").Value);
            var participation = this.dbContext.Participation.AsNoTracking().FirstOrDefault(p => p.Participant == participantId && p.EventInstance == eventInstanceId);

            if (participation?.Team != null)
            {
                var team = this.dbContext.Team.AsNoTracking().FirstOrDefault(p => p.TeamId == participation.Team);
                var points = team.Points ?? 0;
                return Ok(new { points });
            }

            return Forbid();
        }
    }
}
