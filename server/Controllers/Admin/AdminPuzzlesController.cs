using GameControl.Server.Database;
using LazyCache;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.Controllers.Admin
{
    [Authorize]
    [Route("api/admin/player")]
    public class AdminPuzzlesController : ControllerBase
    {
        private GameControlContext dbContext;
        private readonly IAppCache cache;

        public AdminPuzzlesController(GameControlContext dbContext, IAppCache cache)
        {
            this.dbContext = dbContext;
            this.cache = cache;
        }

        [HttpDelete("{eventInstanceId}/submissions/{submissionId}")]
        public IActionResult DeleteSubmission(Guid eventInstanceId, Guid submissionId)
        {
            if (this.dbContext.isUserAdminForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                var submission = this.dbContext.Submission.FirstOrDefault(p => p.SubmissionId == submissionId);

                if (submission != null)
                {
                    this.dbContext.Submission.Remove(submission);
                    this.dbContext.SaveChanges();

                    this.cache.Remove("Teams_" + eventInstanceId.ToString());

                    return Ok();
                }

                return NotFound();
            }

            return Forbid();
        }
    }
}
