using GameControl.Server.Database;
using GameControl.Server.Database.Tables;
using GameControl.Server.Events;
using GameControl.Server.Hubs;
using GameControl.Server.RequestTypes.Player;
using GameControl.Server.ViewModel.Player;
using LazyCache;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.Controllers.Player
{
    [Authorize]
    [Route("api/player/challenges")]
    public class PlayerChallengesController : Controller
    {
        private readonly GameControlContext dbContext;
        private readonly IMediaHandler puzzleMediaHandler;
        private readonly IAppCache cache;
        private readonly IHubContext<NotificationHub> hubContext;

        public PlayerChallengesController(GameControlContext dbContext, IHubContext<NotificationHub> hubContext, IAppCache cache, IMediaHandler puzzleMediaHandler)
        {
            this.dbContext = dbContext;
            this.hubContext = hubContext;
            this.cache = cache;
            this.puzzleMediaHandler = puzzleMediaHandler;
        }

        private Guid? getTeamId(Guid eventInstanceId)
        {
            Guid participantId = Guid.Parse(User.Claims.First(p => p.Type == "ParticipantId").Value);
            var participation = this.dbContext.Participation.FirstOrDefault(p => p.Participant == participantId && p.EventInstance == eventInstanceId);

            return participation != null ? participation.Team : null;
        }

        [HttpGet("{eventInstanceId}")]
        public IActionResult GetChallenges(Guid eventInstanceId)
        {
            Guid participantId = Guid.Parse(User.Claims.First(p => p.Type == "ParticipantId").Value);
            var participation = this.dbContext.Participation.FirstOrDefault(p => p.Participant == participantId && p.EventInstance == eventInstanceId);

            if (participation?.Team != null)
            {
                var team = this.dbContext.Team.FirstOrDefault(p => p.TeamId == participation.Team.Value);
                var cluesForTeam = this.dbContext.GetCluesForTeamFast(eventInstanceId, participation.Team.Value).ToList();

                // Get challenges for the current event where no start time was specified or the start time is in the past.
                var challenges = this.dbContext.Challenge
                    .Where(p => p.EventInstance == eventInstanceId && (team.IsTestTeam || p.StartTime == null || p.StartTime < DateTime.UtcNow))
                    .OrderByDescending(p => p.LastUpdated)
                    .Select(p => new PlayerChallengeViewModel(p)).ToList();

                // Constrain those challenges to ones with no required clue or ones where the team has solved the required clue.
                challenges = challenges.Where(c => c.DependentClue == null || cluesForTeam.FirstOrDefault(p => p.TableOfContentId == c.DependentClue && (p.SubmissionTime.HasValue || p.AnswerCount == 0)) != null).ToList();

                foreach (var challenge in challenges)
                {
                    // Populate the submissions for each challenge.
                    challenge.Submissions = this.dbContext.GetChallengeSubmissionsForTeam(challenge.ChallengeId, participation.Team.Value)
                        .Select(p => new PlayerChallengeSubmissionViewModel(p));
                }

                return Ok(challenges);
            }

            return Forbid();
        }

        [Consumes("multipart/form-data")]
        [HttpPost("{eventInstanceId}/{challengeId}")]
        public async Task<IActionResult> SubmitChallenge(Guid eventInstanceId, [FromForm] ChallengeSubmissionTemplate submissionTemplate)
        {
            Guid participantId = Guid.Parse(User.Claims.First(p => p.Type == "ParticipantId").Value);
            var participation = this.dbContext.Participation.FirstOrDefault(p => p.Participant == participantId && p.EventInstance == eventInstanceId);

            if (participation?.Team != null)
            {
                var challenge = this.dbContext.Challenge.FirstOrDefault(p => p.ChallengeId == submissionTemplate.Challenge);

                if (challenge != null)
                {
                    if (challenge.StartTime.HasValue && challenge.StartTime.Value > DateTime.UtcNow)
                    {
                        return BadRequest("Challenge has not yet started");
                    }
                    else if (challenge.EndTime.HasValue && challenge.EndTime.Value < DateTime.UtcNow)
                    {
                        return BadRequest("Challenge has already ended");
                    }

                    var submissions = this.dbContext.GetChallengeSubmissionsForTeam(submissionTemplate.Challenge, participation.Team.Value);

                    if (submissions.Where(p => p.State == 0x1).Count() > 0)
                    {
                        return BadRequest("Challenge has already been completed");
                    }
                    else if (submissions.Where(p => p.State == 0).Count() > 0)
                    {
                        return BadRequest("Challenge already has a pending submission");
                    }

                    ChallengeSubmission newSubmission = new ChallengeSubmission
                    {
                        ChallengeSubmissionId = Guid.NewGuid(),
                        Challenge = submissionTemplate.Challenge,
                        LastChanged = DateTime.UtcNow,
                        State = 0,
                        SubmissionDate = DateTime.UtcNow,
                        Participant = participation.ParticipationId,
                        SubmissionNotes = submissionTemplate.SubmissionNotes ?? string.Empty,
                        SubmissionTextContent = submissionTemplate.SubmissionTextContent,
                        SubmissionType = submissionTemplate.SubmissionType                        
                    };

                    if (submissionTemplate.SubmissionBinaryContent != null)
                    {
                        if (this.puzzleMediaHandler.IsMediaSupported)
                        {
                            using (var memoryStream = new MemoryStream())
                            {
                                await submissionTemplate.SubmissionBinaryContent.CopyToAsync(memoryStream);
                                string filePath =
                                    string.Format("{0}/challenges/{1}/{2}{3}",
                                        participation.EventInstance,
                                        participation.Team,
                                        newSubmission.ChallengeSubmissionId,
                                        Path.GetExtension(submissionTemplate.SubmissionBinaryContent.FileName));
                                newSubmission.SubmissionTextContent = await this.puzzleMediaHandler.UploadBinaryContent(memoryStream, filePath);
                                newSubmission.SubmissionType = "BlobPic";
                            }
                        } else
                        {
                            return BadRequest("Media not supported");
                        }
                    }

                    this.dbContext.ChallengeSubmission.Add(newSubmission);
                    this.dbContext.SaveChanges();

#pragma warning disable CS4014 // Because this call is not awaited, execution of the current method continues before the call is completed
                    this.hubContext.Clients.Group("ADMIN_"+participation.EventInstance.ToString()).SendAsync("admin_challenge",participation.Team.ToString());
#pragma warning restore CS4014 // Because this call is not awaited, execution of the current method continues before the call is completed

                    // Invalidate challenges so the response is reflected in the UI.
                    cache.Remove("Challenge_" + eventInstanceId.ToString());

                    // return Ok with submission view model
                    return this.GetChallenges(eventInstanceId);
                }

                return NotFound();
            }

            return Forbid();
        }
    }
}
