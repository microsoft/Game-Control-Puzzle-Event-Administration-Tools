using GameControl.Server.Database;
using GameControl.Server.Database.SprocTypes;
using GameControl.Server.Database.Tables;
using GameControl.Server.Events;
using GameControl.Server.Hubs;
using GameControl.Server.RequestTypes;
using GameControl.Server.RequestTypes.Player;
using GameControl.Server.Util;
using GameControl.Server.ViewModel;
using GameControl.Server.ViewModel.Player;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace GameControl.Server.Controllers.Player
{
    [Authorize]
    [Route("api/[controller]")]
    public class PlayerPuzzlesController : Controller
    {
        private readonly GameControlContext dbContext;
        private readonly IHubContext<NotificationHub> hubContext;
        private readonly IEventHandler puzzleEventHandler;

        public PlayerPuzzlesController(GameControlContext dbContext, IHubContext<NotificationHub> hubContext, IEventHandler puzzleEventHandler)
        {
            this.dbContext = dbContext;
            this.hubContext = hubContext;
            this.puzzleEventHandler = puzzleEventHandler;
        }

        [HttpGet("{eventInstanceId}")]
        public IActionResult GetPuzzles(Guid eventInstanceId)
        {
            Guid participantId = Guid.Parse(User.Claims.First(p => p.Type == "ParticipantId").Value);
            var participation = this.dbContext.Participation.AsNoTracking().FirstOrDefault(p => p.Participant == participantId && p.EventInstance == eventInstanceId);

            if (participation?.Team != null)
            {
                var cluesForTeam = this.dbContext.GetCluesForTeamFast(eventInstanceId, participation.Team.Value).Select(p => new PlayerClueViewModel(p, eventInstanceId)).ToList();
                var contentForTeam = this.dbContext.GetAdditionalContentForTeam(participation.Team.Value).ToList();
                var eventSubmissions = this.dbContext.GetValidSubmissions(eventInstanceId).ToList();
                var sortOverridesRow = this.dbContext.TeamAdditionalData.AsNoTracking().FirstOrDefault(p => p.Team == participation.Team.Value && p.DataKey == TeamSortOverrideViewModel.AdditionalDataKey);

                var achievementIds = this.dbContext.GetAchievementsForTeam(participation.Team.Value).Select(a => a.AchievementId).ToImmutableHashSet();
                var overrides = new List<TeamSortOverrideViewModel>();

                Dictionary<Guid, List<AdditionalContentForTeam>> contentDictionary = new Dictionary<Guid, List<AdditionalContentForTeam>>();
                var unsolvedClueIds = new HashSet<Guid>();
                foreach (var content in contentForTeam)
                {
                    if (!contentDictionary.ContainsKey(content.TableOfContentId))
                    {
                        contentDictionary.Add(content.TableOfContentId, new List<AdditionalContentForTeam>());
                    }

                    contentDictionary[content.TableOfContentId].Add(content);

                    if (content.UnlockReason.Trim() == "Skip")
                    {
                        unsolvedClueIds.Add(content.TableOfContentId);
                    }
                }

                try
                {
                    if (sortOverridesRow != null)
                    {
                        overrides = JsonConvert.DeserializeObject<List<TeamSortOverrideViewModel>>(sortOverridesRow.DataValue);
                    }
                }
                catch (Exception)
                {
                    // Parsing sort orders is best effort - if it's misconfigured in the DB we'll ignore.
                }

                foreach (var clue in cluesForTeam)
                {
                    clue.Content = new List<ContentViewModel>();
                    if (contentDictionary.ContainsKey(clue.TableOfContentId))
                    {

                        IEnumerable<AdditionalContentForTeam> contentUnlockedByAchievements = contentDictionary[clue.TableOfContentId]
                            .Where(p => !p.UnlockedByAchievement.HasValue || achievementIds.Contains(p.UnlockedByAchievement.Value));

                        if (clue.IsSolved)
                        {
                            clue.Content = contentUnlockedByAchievements
                                .Where(p => p.ContentName != ContentViewModel.UnsolvedPlot && p.ContentName != ContentViewModel.SkipPlot)
                                .Select(p => new ContentViewModel(p));
                        }
                        else
                        {
                            clue.Content = contentUnlockedByAchievements
                                .Where(p => p.ContentName != ContentViewModel.SolvedPlot && p.ContentName != ContentViewModel.SkipPlot)
                                .Select(p => new ContentViewModel(p));
                        }
                    }

                    clue.Submissions = eventSubmissions
                        .Where(p => p.SubmittableId == clue.SubmittableId && p.TeamId == participation.Team.Value)
                        .OrderByDescending(p => p.SubmissionTime)
                        .Select(p => new SubmissionViewModel(p, true))
                        .ToList();

                    if (overrides != null)
                    {
                        var sortOverride = overrides.FirstOrDefault(p => p.TableOfContentId == clue.TableOfContentId);
                        if (sortOverride != null)
                        {
                            clue.SortOrder = sortOverride.SortOrder;
                        }
                    }

                    foreach (var submission in clue.Submissions)
                    {
                        submission.UnlockedTocs = this.dbContext.GetCluesUnlockedBySubmission(submission.SubmittableId).Select(p => new UnlockedInfo() { TableOfContentId = p.TableOfContentId, Title = p.Title }).ToList();
                        submission.UnlockedAchievements = this.dbContext.GetAchievementsUnlockedBySubmission(submission.SubmissionId).Select(p => new AchievementViewModel(p)).ToList();
                        if (submission.AdditionalContentId.HasValue)
                        {
                            var content = this.dbContext.AdditionalContent.FirstOrDefault(p => p.ContentId == submission.AdditionalContentId.Value);

                            // This should never be null due to the FK relationship, but we will check anyway to be safe.
                            if (content != null)
                            {
                                submission.AdditionalContent = new ContentViewModel(content);
                            }
                        }
                    }
                }

                // For any skipped clues that have plot for the skipped state, add them as though they were a Plot ToC instead of
                // a clue so that teams can see the content but aren't aware that it was part of a clue they didn't see.
                foreach (var unsolvedId in unsolvedClueIds)
                {
                    var skipPlotContent = contentDictionary[unsolvedId].Where(p => p.ContentName == ContentViewModel.SkipPlot).Select(p => new ContentViewModel(p) { Name = ContentViewModel.UnsolvedPlot });
                    
                    if (skipPlotContent.Count() > 0) {
                        var plotClue = new PlayerClueViewModel()
                        { 
                            TableOfContentId = unsolvedId,
                            SubmittableTitle = "Plot",
                            SubmittableId = contentDictionary[unsolvedId].First().Submittable,
                            Submissions = new List<SubmissionViewModel>(),
                            UnlockTime = contentDictionary[unsolvedId].First().UnlockTime,
                            IsRated = false,
                            IsSolved = true,
                            SubmittableType = "Plot",
                            SortOrder = overrides?.FirstOrDefault(p => p.TableOfContentId == unsolvedId)?.SortOrder ?? contentDictionary[unsolvedId].First().SortOrder,
                            EventInstanceId = eventInstanceId,
                            Content = skipPlotContent
                        };

                        cluesForTeam.Add(plotClue);
                    }
                }

                return Ok(cluesForTeam);
            }
            else
            {
                return Forbid("User is not authorized to view this event");
            }
        }

        [HttpPut("{eventInstanceId}/toc/{tableOfContentsId}/rating")]
        public IActionResult Rate(Guid eventInstanceId, Guid tableOfContentsId, [FromBody] RatingTemplate rating)
        {
            Guid participantId = Guid.Parse(User.Claims.First(p => p.Type == "ParticipantId").Value);
            var participation = this.dbContext.Participation.FirstOrDefault(p => p.Participant == participantId && p.EventInstance == eventInstanceId);
            var toc = this.dbContext.TableOfContentsEntry.FirstOrDefault(p => p.TableOfContentId == tableOfContentsId && p.EventInstance == eventInstanceId);

            if (participation?.Team != null && toc != null)
            {
                var teamAccess = this.dbContext.TeamToCAccess.FirstOrDefault(p => p.Team == participation.Team.Value && p.TableOfContentsEntry == tableOfContentsId && p.UnlockReason.Trim() != "Skip");
                if (teamAccess != null)
                {
                    var existingRating = this.dbContext.ParticipationToCRating.FirstOrDefault(p => p.Participation == participation.ParticipationId && p.TableOfContentsEntry == tableOfContentsId);

                    if (existingRating == null && rating != null && rating.Rating > 0 && rating.Rating <= 5)
                    {
                        this.dbContext.RateTableOfContentsEntry(tableOfContentsId, participation.ParticipationId, rating.Rating, rating.Comment);

                        var rateAchievement = this.dbContext.Settings.FirstOrDefault(p => p.EventInstanceId == eventInstanceId && p.Name == "RatePuzzleAchievement");
                        if (rateAchievement != null && participation.Team.HasValue)
                        {
                            // AddAchievementUnlockForTeam is a no-op if the achievement is already unlocked.
                            this.dbContext.AddAchievementUnlockForTeam(new Guid(rateAchievement.StringValue), participation.Team.Value);
                        }


                        return this.GetPuzzles(eventInstanceId);
                    }
                    else
                    {
                        return BadRequest();
                    }
                }
            }

            return Forbid();
        }

        // This function handles the actual logic of submitting an answer and processing side effects.
        // It's also referenced by APIs in the IntegrationsController, so when making changes, be sure
        // to validate that the APIs continue to work correctly.
        internal ValidSubmission HandleAnswerSubmission(TableOfContentsEntry toc, Guid team, Guid? participationId, string answer)
        {
            string sanitizedAnswer = GameControlUtil.SanitizeString(answer);

            if (string.IsNullOrEmpty(sanitizedAnswer))
            {
                return null;
            }

            ValidSubmission submission = this.dbContext.SubmitAnswer(toc.Submittable, team, participationId, sanitizedAnswer);

            if (submission.IsCorrectAnswer && this.puzzleEventHandler != null)
            {
                this.puzzleEventHandler.HandlePuzzleSolved(toc.EventInstance, team, toc.TableOfContentId);
            }

            // Do additional post-submission processing. If any clues should be unlocked by this answer, 
            // add an unlock in the DB.
            List<Guid> unlockedPuzzleIds = new List<Guid>();
            foreach (var clueToUnlock in this.dbContext.GetCluesToUnlockForAnswer(team, submission.AnswerId))
            {
                this.dbContext.UnlockTableOfContentsEntry(
                    team,
                    clueToUnlock.TableOfContentsEntry,
                    submission.SubmissionId);

                unlockedPuzzleIds.Add(clueToUnlock.TableOfContentsEntry);
            }

            // Let any listeners know that puzzles were unlocked.
            if (unlockedPuzzleIds.Count > 0 && this.puzzleEventHandler != null)
            {
                this.puzzleEventHandler.HandleUnlockedPuzzlesChanged(toc.EventInstance, team, unlockedPuzzleIds, null);
            }

            //  Query for Achievements that should be unlocked.
            if (submission.AnswerId != null)
            {
                foreach (var achievementToUnlock in this.dbContext.GetAchievementsToUnlockForAnswer(submission.AnswerId.Value))
                {
                    this.dbContext.AddAchievementUnlockForTeamFromSubmission(achievementToUnlock.AchievementId, team, submission.SubmissionId);
                    this.hubContext.Clients.Group(team.ToString()).SendAsync("achievement", team.ToString());
                }
            }

            //  Return the team's instance to the pool, if they had one, as "needs resetting".
            if (submission.IsCorrectAnswer == true)
            {
                var usedInstances = this.dbContext.ToCInstance.Where(p => p.TableOfContentsEntry == toc.TableOfContentId && p.CurrentTeam == team);
                foreach (var instance in usedInstances)
                {
                    instance.CurrentTeam = null;
                    instance.NeedsReset = true;
                    instance.LastUpdated = DateTime.UtcNow;
                }
                this.dbContext.SaveChanges();

                if (usedInstances.Any())
                {
                    this.hubContext.Clients.Group("ADMIN_" + toc.EventInstance.ToString()).SendAsync("admin_instance", toc.TableOfContentId);
                }
            }

            this.hubContext.Clients.Group("ADMIN_" + toc.EventInstance.ToString()).SendAsync("admin_submission", team.ToString());

            return submission;
        }

        [HttpPost("{tableOfContentsId}/[action]")]
        public IActionResult SubmitAnswer(Guid tableOfContentsId, [FromBody] SubmissionRequest answer)
        {
            Guid participantId = Guid.Parse(User.Claims.First(p => p.Type == "ParticipantId").Value);
            var toc = this.dbContext.TableOfContentsEntry.FirstOrDefault(p => p.TableOfContentId == tableOfContentsId);

            if (toc != null)
            {
                var participation = this.dbContext.Participation.AsNoTracking().FirstOrDefault(p => p.Participant == participantId && p.EventInstance == toc.EventInstance);

                if (participation != null && participation.Team.HasValue)
                {
                    if (!string.IsNullOrEmpty(answer.answer))
                    {
                        if (HandleAnswerSubmission(toc, participation.Team.Value, participation.ParticipationId, answer.answer) != null)
                        {
                            return GetPuzzles(toc.EventInstance);
                        }
                        else
                        {
                            return BadRequest();
                        }
                    }
                    else
                    {
                        return StatusCode((int)HttpStatusCode.BadRequest, "Answer cannot be null or empty");
                    }
                }
                else
                {
                    return StatusCode((int)HttpStatusCode.Forbidden, "User is not authorized to view this event");
                }

            }
            else
            {
                return NotFound();
            }
        }

        [HttpPost("{eventInstanceId}/pulse")]
        public IActionResult SubmitPulse(Guid eventInstanceId, [FromBody] NewPulseTemplate pulse)
        {
            Guid participantId = Guid.Parse(User.Claims.First(p => p.Type == "ParticipantId").Value);
            var participation = this.dbContext.Participation.FirstOrDefault(p => p.Participant == participantId && p.EventInstance == eventInstanceId);

            // NOTE: Users do not need a team to submit a pulse; we allow it from staff but keep it in this controller anyway.
            if (participation != null)
            {
                var pulseRow = this.dbContext.SubmitPulse(participation.ParticipationId, pulse.PulseText, pulse.PulseRating, null, null, null);

                var pulseAchievement = this.dbContext.Settings.FirstOrDefault(p => p.EventInstanceId == eventInstanceId && p.Name == "PulseAchievement");
                if (pulseAchievement != null && participation.Team.HasValue)
                {
                    // AddAchievementUnlockForTeam is a no-op if the achievement is already unlocked.
                    this.dbContext.AddAchievementUnlockForTeam(new Guid(pulseAchievement.StringValue), participation.Team.Value);
                }

                this.hubContext.Clients.Group("ADMIN_" + participation.EventInstance.ToString()).SendAsync("admin_pulse", participation.Team);

                return Ok(new ActivityFeedItemViewModel()
                {
                    Id = pulseRow.PulseId,
                    AggregatedContentType = "Pulse",
                    Description = pulseRow.PulseText,
                    EventInstance = participation.EventInstance,
                    HasAdditionalImage = 0,
                    LastUpdated = pulseRow.LastUpdated,
                    NumericValue = pulseRow.PulseRating,
                    TeamId = pulseRow.Team
                });
            }
            else
            {
                return Forbid();
            }
        }

        [Consumes("multipart/form-data")]
        [HttpPost("{eventInstanceId}/photoPulse")]
        public async Task<IActionResult> SubmitPhotoPulse(Guid eventInstanceId, [FromForm] NewPhotoPulseTemplate pulse)
        {
            Guid participantId = Guid.Parse(User.Claims.First(p => p.Type == "ParticipantId").Value);
            var participation = this.dbContext.Participation.FirstOrDefault(p => p.Participant == participantId && p.EventInstance == eventInstanceId);

            if (participation != null)
            {
                // TODO: Add additional validations to pulse request if needed
                if (pulse.PulseImage != null)
                {
                    using (var memoryStream = new MemoryStream())
                    {
                        await pulse.PulseImage.CopyToAsync(memoryStream);
                        var pulseRow = this.dbContext.SubmitPulse(participation.ParticipationId, pulse.PulseText, pulse.PulseRating, memoryStream.ToArray(), null, null);

                        var pulseAchievement = this.dbContext.Settings.FirstOrDefault(p => p.EventInstanceId == eventInstanceId && p.Name == "PulseAchievement");
                        if (pulseAchievement != null && participation.Team.HasValue)
                        {
                            // AddAchievementUnlockForTeam is a no-op if the achievement is already unlocked.
                            this.dbContext.AddAchievementUnlockForTeam(new Guid(pulseAchievement.StringValue), participation.Team.Value);
                        }

                        var photoPulseAchievement = this.dbContext.Settings.FirstOrDefault(p => p.EventInstanceId == eventInstanceId && p.Name == "PhotoPulseAchievement");
                        if (photoPulseAchievement != null && participation.Team.HasValue)
                        {
                            // AddAchievementUnlockForTeam is a no-op if the achievement is already unlocked.
                            this.dbContext.AddAchievementUnlockForTeam(new Guid(photoPulseAchievement.StringValue), participation.Team.Value);
                        }

#pragma warning disable CS4014 // Because this call is not awaited, execution of the current method continues before the call is completed
                        this.hubContext.Clients.Group("ADMIN_" + participation.EventInstance.ToString()).SendAsync("admin_pulse", participation.Team);
#pragma warning restore CS4014 // Because this call is not awaited, execution of the current method continues before the call is completed

                        return Ok(new ActivityFeedItemViewModel()
                        {
                            Id = pulseRow.PulseId,
                            AggregatedContentType = "Pulse",
                            Description = pulseRow.PulseText,
                            EventInstance = participation.EventInstance,
                            HasAdditionalImage = 1,
                            LastUpdated = pulseRow.LastUpdated,
                            NumericValue = pulseRow.PulseRating,
                            TeamId = pulseRow.Team
                        });
                    }
                }

                // If there's no image SubmitPulse should be used.
                return BadRequest();
            }

            return Forbid();
        }

        [HttpGet("{eventInstanceId}/messages")]
        public IActionResult GetGcMessages(Guid eventInstanceId)
        {
            Guid participantId = Guid.Parse(User.Claims.First(p => p.Type == "ParticipantId").Value);
            var participation = this.dbContext.Participation.FirstOrDefault(p => p.Participant == participantId && p.EventInstance == eventInstanceId);

            if (participation?.Team != null)
            {
                return Ok(this.dbContext.GcMessages.Where(p => p.Team == participation.Team).Select(p => new GcMessageViewModelBase()
                {
                    MessageId = p.MessageId,
                    MessageText = p.MessageText,
                    LastUpdated = p.LastUpdated
                }));
            }

            return Forbid();
        }

        #region Team Calls
        private IEnumerable<PlayerCallViewModel> GetActiveCallsForTeam(Guid team)
        {
            return this.dbContext.Call.Where(p => (p.CallType == "TeamFree" || p.CallType == "TeamHelp") && p.CallEnd == null && p.Team == team).Select(p => new PlayerCallViewModel(p)).ToList();
        }

        [HttpPut("{eventInstanceId}/calls")]
        public IActionResult CreateCall(Guid eventInstanceId, [FromBody] CallTemplate callTemplate)
        {
            Guid participantId = Guid.Parse(User.Claims.First(p => p.Type == "ParticipantId").Value);
            var participation = this.dbContext.Participation.FirstOrDefault(p => p.Participant == participantId && p.EventInstance == eventInstanceId);
            var teamId = participation.Team;

            if (participation != null && participation.Team != null)
            {
                if (callTemplate != null || string.IsNullOrEmpty(callTemplate.CallType))
                {
                    if (callTemplate.CallId == null)
                    {
                        // This is a new call - first we'll verify if there's an existing open call and treat this
                        // as a no-op.
                        var activeCalls = GetActiveCallsForTeam(participation.Team.Value);

                        if (activeCalls.Count() == 0)
                        {
                            // New call
                            Call newCall = new Call()
                            {
                                CallId = Guid.NewGuid(),
                                CallStart = DateTime.UtcNow,
                                TeamNotes = callTemplate.TeamNotes,
                                CallType = callTemplate.CallType,
                                Team = participation.Team.Value,
                                Participant = participation.Participant,
                                LastUpdated = DateTime.UtcNow
                            };

                            this.dbContext.Call.Add(newCall);
                            this.dbContext.SaveChanges();

                            this.hubContext.Clients.Group("ADMIN_" + eventInstanceId.ToString()).SendAsync("admin_call", teamId.ToString());
                            this.hubContext.Clients.Group(teamId.ToString()).SendAsync("call", teamId.ToString());

                            return GetCalls(eventInstanceId);
                        }
                        else
                        {
                            // If there was an active call we'll just return that.
                            return Ok(activeCalls);
                        }
                    }
                    else
                    {
                        // Edit call
                        var existingCall = this.dbContext.Call.FirstOrDefault(p => p.CallId == callTemplate.CallId);
                        if (existingCall != null)
                        {
                            existingCall.TeamNotes = callTemplate.TeamNotes;
                            existingCall.LastUpdated = DateTime.UtcNow;
                            existingCall.CallEnd = callTemplate.CallEnd;

                            this.dbContext.Call.Update(existingCall);
                            this.dbContext.SaveChanges();

                            this.hubContext.Clients.Group("ADMIN_" + eventInstanceId.ToString()).SendAsync("admin_call", teamId.ToString());
                            this.hubContext.Clients.Group(teamId.ToString()).SendAsync("call", teamId.ToString());

                            return GetCalls(eventInstanceId);
                        }

                        return NotFound();
                    }
                }
                else
                {
                    return BadRequest();
                }
            }

            return Forbid();
        }

        [HttpGet("{eventInstanceId}/calls")]
        public IActionResult GetCalls(Guid eventInstanceId)
        {
            Guid participantId = Guid.Parse(User.Claims.First(p => p.Type == "ParticipantId").Value);
            var participation = this.dbContext.Participation.FirstOrDefault(p => p.Participant == participantId && p.EventInstance == eventInstanceId);

            if (participation != null && participation.Team != null)
            {
                // Only return "team free" calls that haven't closed.
                return Ok(GetActiveCallsForTeam(participation.Team.Value));
            }

            return Forbid();
        }
        #endregion

        [HttpGet("{eventInstanceId}/achievements")]
        public IActionResult GetAchievements(Guid eventInstanceId)
        {
            Guid participantId = Guid.Parse(User.Claims.First(p => p.Type == "ParticipantId").Value);
            var participation = this.dbContext.Participation.FirstOrDefault(p => p.Participant == participantId && p.EventInstance == eventInstanceId);

            if (participation != null && participation.Team.HasValue)
            {
                return Ok(this.dbContext.GetAchievementsForTeam(participation.Team.Value).Select(p => new AchievementViewModel(p)));
            }

            return Forbid();
        }

        [HttpGet("{eventInstanceId}/feed")]
        public IActionResult GetActivityFeed(Guid eventInstanceId)
        {
            Guid participantId = Guid.Parse(User.Claims.First(p => p.Type == "ParticipantId").Value);
            var participation = this.dbContext.Participation.FirstOrDefault(p => p.Participant == participantId && p.EventInstance == eventInstanceId);

            if (participation != null && participation.Team.HasValue)
            {
                return Ok(this.dbContext.GetActivityFeedForTeam(eventInstanceId, participation.Team.Value));
            }

            return Forbid();
        }
    }
}
