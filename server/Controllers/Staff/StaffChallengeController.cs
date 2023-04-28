using GameControl.Server.Database;
using GameControl.Server.Database.Tables;
using GameControl.Server.Events;
using GameControl.Server.Hubs;
using GameControl.Server.RequestTypes.Staff;
using GameControl.Server.ViewModel.Staff;
using LazyCache;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Linq;

namespace GameControl.Server.Controllers.Staff
{
    [Authorize]
    [Route("api/staff/challenges")]
    public class StaffChallengeController : ControllerBase
    {
        private readonly GameControlContext dbContext;
        private readonly IHubContext<NotificationHub> hubContext;
        private readonly IAppCache cache;
        private readonly IEventHandler puzzleEventHandler;
        private readonly StaffTeamsController staffTeamsController;

        public StaffChallengeController(GameControlContext dbContext, IHubContext<NotificationHub> hubContext, IAppCache cache, IEventHandler puzzleEventHandler, StaffTeamsController staffTeamsController)
        {
            this.dbContext = dbContext;
            this.hubContext = hubContext;
            this.cache = cache;
            this.puzzleEventHandler = puzzleEventHandler;
            this.staffTeamsController = staffTeamsController;
        }

        [HttpGet("{eventInstanceId}")]
        public IActionResult GetChallenges(Guid eventInstanceId)
        {
            if (this.dbContext.isUserStaffForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                var cachedChallenges = cache.GetOrAdd("Challenge_" + eventInstanceId.ToString(), cacheEntry =>
                {
                    cacheEntry.AbsoluteExpiration = DateTimeOffset.Now.AddSeconds(45);

                    var challenges = this.dbContext.Challenge.Where(p => p.EventInstance == eventInstanceId).Select(p => new StaffChallengeViewModel(p)).ToList();
                    var allSubmissions = this.dbContext.GetAllChallengeSubmissions(eventInstanceId).Select(p => new StaffChallengeSubmissionViewModel(p)).ToList();

                    foreach (var challenge in challenges)
                    {
                        challenge.Submissions = allSubmissions.Where(p => p.ChallengeId == challenge.ChallengeId).ToList();
                    }

                    return challenges;
                });
                return Ok(cachedChallenges);
            }

            return Forbid();
        }

        [HttpPut("{eventInstanceId}/{challengeId}")]
        public IActionResult UpdateChallengeSubmission(Guid eventInstanceId, Guid challengeId, [FromBody] ChallengeSubmissionApproval submissionTemplate)
        {
            if (this.dbContext.isUserStaffForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                Guid participantId = Guid.Parse(User.Claims.First(p => p.Type == "ParticipantId").Value);
                var participation = this.dbContext.Participation.FirstOrDefault(p => p.Participant == participantId && p.EventInstance == eventInstanceId);
                var challenge = this.dbContext.Challenge.FirstOrDefault(p => p.ChallengeId == challengeId && p.EventInstance == eventInstanceId);
                var submission = this.dbContext.ChallengeSubmission.FirstOrDefault(p => p.Challenge == challengeId && p.ChallengeSubmissionId == submissionTemplate.ChallengeSubmissionId);

                if (challenge != null && submission != null)
                {
                    submission.State = submissionTemplate.State;
                    submission.Approver = participation.ParticipationId;
                    submission.ApproverText = submissionTemplate.ApproverText;

                    this.dbContext.ChallengeSubmission.Update(submission);
                    this.dbContext.SaveChanges();

                    var submissionSubmitter = this.dbContext.Participation.First(p => p.ParticipationId == submission.Participant);

                    string sanitizedTitle = challenge.Title.Contains("^^^") ? challenge.Title.Split(new[] { "^^^" },StringSplitOptions.RemoveEmptyEntries)[0] : challenge.Title;
                    
                    string message = "";
                    if (submissionTemplate.State == 1)
                    {
                        message = "Game Control has accepted your submission for: " + sanitizedTitle;

                        if (challenge.PointsAwarded != 0)
                        {
                            this.staffTeamsController.GrantPointsForTeam(eventInstanceId, submissionSubmitter.Team.Value, challenge.PointsAwarded, "For completing " + sanitizedTitle, participation.ParticipationId);
                        }

                        if (submissionSubmitter.Team.HasValue && this.puzzleEventHandler != null)
                        {
                            this.puzzleEventHandler.HandleChallengeCompleted(eventInstanceId, submissionSubmitter.Team.Value, challenge.ChallengeId);
                        }
                    }
                    else if (submissionTemplate.State == 2)
                    {
                        message = "Game Control has rejected your submission for: " + sanitizedTitle;
                    }

                    if (!string.IsNullOrEmpty(message) && submissionSubmitter.Team.HasValue) {
                        GcMessage newMessage = new GcMessage()
                        {
                            LastUpdated = DateTime.UtcNow,
                            MessageId = Guid.NewGuid(),
                            MessageText = message,
                            Team = submissionSubmitter.Team.Value,
                            GcParticipation = participation.ParticipationId
                        };


                        this.dbContext.GcMessages.Add(newMessage);
                        this.dbContext.SaveChanges();

                        this.hubContext.Clients.Group("ADMIN_"+participation.EventInstance.ToString()).SendAsync("admin_challenge",newMessage.Team.ToString());
                        this.hubContext.Clients.Group(newMessage.Team.ToString()).SendAsync("message", newMessage.MessageId.ToString());
                        this.hubContext.Clients.Group(newMessage.Team.ToString()).SendAsync("challenge", challenge.ChallengeId.ToString());
                    }

                    // Invalidate challenges so the response is reflected in the UI.
                    cache.Remove("Challenge_" + eventInstanceId.ToString());

                    return GetChallenges(eventInstanceId);
                }

                return NotFound();
            }

            return Forbid();
        }

        [HttpPut("{eventInstanceId}")]
        public IActionResult AddOrUpdateChallenge(Guid eventInstanceId, [FromBody] ChallengeTemplate template)
        {
            Guid participantId = Guid.Parse(User.Claims.First(p => p.Type == "ParticipantId").Value);
            var participation = this.dbContext.Participation.FirstOrDefault(p => p.Participant == participantId && p.EventInstance == eventInstanceId);

            if (participation != null && participation.IsStaff)
            {
                // TODO: Validate the template
                if (!template.ChallengeId.HasValue)
                {
                    Challenge newChallenge = new Challenge
                    {
                        ChallengeId = Guid.NewGuid(),
                        EventInstance = eventInstanceId,
                        Title = template.Title,
                        Description = template.Description,
                        StartTime = template.StartTime,
                        EndTime = template.EndTime,
                        PointsAwarded = template.PointsAwarded ?? 0,
                        LastUpdated = DateTime.UtcNow
                    };

                    this.dbContext.Challenge.Add(newChallenge);
                    this.dbContext.SaveChanges();

                    if (!template.StartTime.HasValue && !template.Title.Contains("^^^"))
                    {
                        var teams = this.dbContext.Team.Where(p => p.EventInstance == eventInstanceId).ToList();

                        try
                        {
                            foreach (var team in teams)
                            {
                                GcMessage newMessage = new GcMessage()
                                {
                                    LastUpdated = DateTime.UtcNow,
                                    MessageId = Guid.NewGuid(),
                                    MessageText = "Now available: " + newChallenge.Title,
                                    Team = team.TeamId,
                                    GcParticipation = participation.ParticipationId
                                };

                                this.dbContext.GcMessages.Add(newMessage);
                                this.hubContext.Clients.Group(team.TeamId.ToString()).SendAsync("message", team.TeamId.ToString());

                            }

                            this.dbContext.SaveChanges();
                        }
                        catch (Exception)
                        {
                            // If we can't notify a user with a message, it's not a critical failure.
                        }
                    }

                    // Invalidate challenges so that the change does not appear to be reverted on refresh
                    cache.Remove("Challenge_" + eventInstanceId.ToString());

                    return Ok(new StaffChallengeViewModel(newChallenge));
                }
                else
                {
                    Challenge existingChallenge = this.dbContext.Challenge.FirstOrDefault(p => p.ChallengeId == template.ChallengeId.Value);

                    if (existingChallenge != null)
                    {
                        existingChallenge.Title = template.Title;
                        existingChallenge.Description = template.Description;
                        existingChallenge.StartTime = template.StartTime;
                        existingChallenge.EndTime = template.EndTime;
                        existingChallenge.LastUpdated = DateTime.UtcNow;
                        existingChallenge.PointsAwarded = template.PointsAwarded ?? 0;

                        this.dbContext.Challenge.Update(existingChallenge);
                        this.dbContext.SaveChanges();

                        // Invalidate challenges so that the change does not appear to be reverted on refresh
                        cache.Remove("Challenge_" + eventInstanceId.ToString());

                        return Ok(new StaffChallengeViewModel(existingChallenge));
                    }

                    return NotFound();
                }
            }

            return Forbid();
        }

        [HttpDelete("{eventInstanceId}/{challengeId}")]
        public IActionResult DeleteChallenge(Guid eventInstanceId, Guid challengeId)
        {
            if (this.dbContext.isUserStaffForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                Challenge challenge = this.dbContext.Challenge.FirstOrDefault(p => p.ChallengeId == challengeId);

                if (challenge != null)
                {
                    // Currently assumes that challenges have no submissions when deleted.
                    this.dbContext.Challenge.Remove(challenge);
                    this.dbContext.SaveChanges();

                    // Invalidate challenges so that the change does not appear to be reverted on refresh
                    cache.Remove("Challenge_" + eventInstanceId.ToString());

                    return GetChallenges(eventInstanceId);
                }

                return NotFound();
            }

            return Forbid();
        }
    }
}
