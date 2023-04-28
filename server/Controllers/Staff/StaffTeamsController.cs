using LazyCache;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using GameControl.Server.Database;
using GameControl.Server.Database.Tables;
using GameControl.Server.Hubs;
using GameControl.Server.RequestTypes;
using GameControl.Server.RequestTypes.Staff;
using GameControl.Server.ViewModel;
using GameControl.Server.ViewModel.Staff;
using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using GameControl.Server.Events;

namespace GameControl.Server.Controllers
{
    [Authorize]
    [Route("api/staff/teams")]
    public class StaffTeamsController : ControllerBase
    {
        private readonly GameControlContext dbContext;
        private readonly IHubContext<NotificationHub> hubContext;
        private readonly IEventHandler puzzleEventHandler;

        private readonly IAppCache cache;

        public StaffTeamsController(GameControlContext dbContext, IHubContext<NotificationHub> hubContext, IAppCache cache, IEventHandler puzzleEventHandler)
        {
            this.dbContext = dbContext;
            this.hubContext = hubContext;
            this.cache = cache;
            this.puzzleEventHandler = puzzleEventHandler;
        }

        [HttpGet("{eventInstanceId}")]
        public IActionResult GetTeams(Guid eventInstanceId)
        {
            if (this.dbContext.isUserStaffForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                var cachedTeams = cache.GetOrAdd("Teams_" + eventInstanceId.ToString(), cacheEntry =>
                {
                    cacheEntry.AbsoluteExpiration = DateTimeOffset.Now.AddSeconds(3);
                    var callsForEvent = this.dbContext.GetCallsForEventInstance(eventInstanceId);
                    var submissionsForEvent = this.dbContext.GetValidSubmissions(eventInstanceId).ToList();

                    var teams = this.dbContext.Team
                        .Where(p => p.EventInstance == eventInstanceId)
                        .OrderBy(p => p.IsTestTeam)
                        .ThenBy(p => p.Name)
                        .Select(p => new StaffTeamViewModel(p)).ToList();

                    foreach (var team in teams)
                    {
                        var activeCall = callsForEvent.FirstOrDefault(p => p.Team == team.TeamId && p.CallEnd == null);

                        if (activeCall != null)
                        {
                            team.ActiveCall = new CallViewModel(activeCall);
                        }

                        team.CallHistory = callsForEvent.Where(p => p.Team == team.TeamId).Select(p => new CallViewModel(p));

                        team.Roster = this.dbContext.GetRosterForTeam(team.TeamId).Select(p => new UserViewModel()
                        {
                            ParticipantId = p.ParticipantId,
                            ContactNumber = p.ContactNumber,
                            Email = p.Email,
                            DisplayName = p.FirstName + ' ' + p.LastName
                        });

                        team.SubmissionHistory = submissionsForEvent.Where(p => p.TeamId == team.TeamId).Select(p => new SubmissionViewModel(p));

                        try
                        {
                            // NOTE: For now we are only grabbing additional data that we have concrete types for - eventually we may want to return any keys
                            // here to allow clients to determine what to do with it.
                            var teamAdditionalData = this.dbContext.TeamAdditionalData.AsNoTracking().FirstOrDefault(p => p.Team == team.TeamId && p.DataKey == TeamSortOverrideViewModel.AdditionalDataKey);
                            if (teamAdditionalData != null)
                            {
                                team.AdditionalData = new TeamAdditionalDataViewModel()
                                {
                                    SortOverride = JsonConvert.DeserializeObject<TeamSortOverrideViewModel[]>(teamAdditionalData.DataValue)
                                };
                            }
                        }
                        catch (Exception)
                        {
                            // Best effort. If any additional data fails to load we won't error out the rest of the call.
                        }
                    }

                      return teams;
                });

                return Ok(cachedTeams);
            }
            else
            {
                return Forbid();
            }
        }

        internal bool GrantPointsForTeam(Guid eventInstanceId, Guid teamId, long points, string reason, Guid? granterParticipation)
        {
            this.dbContext.UpdatePointsForTeam(eventInstanceId, teamId, granterParticipation, points, reason);
            this.dbContext.SaveChanges();

            return true;
        }


        [HttpPut("{eventInstanceId}/teams/{teamId}/points")]
        public IActionResult UpdatePoints(Guid eventInstanceId, Guid teamId, [FromBody] PointsTemplate pointsTemplate)
        {
            Guid participantId = Guid.Parse(User.Claims.First(p => p.Type == "ParticipantId").Value);
            var participation = this.dbContext.Participation.FirstOrDefault(p => p.Participant == participantId && p.EventInstance == eventInstanceId);

            if (participation != null && participation.IsStaff)
            {
                var team = this.dbContext.Team.FirstOrDefault(p => p.TeamId == teamId && p.EventInstance == eventInstanceId);

                if (team != null)
                {
                    if (GrantPointsForTeam(eventInstanceId, teamId, pointsTemplate.PointValue, pointsTemplate.Reason, participation.ParticipationId))
                    {
                        return GetTeams(eventInstanceId);
                    }
                }

                return NotFound();
            }

            return Forbid();
        }

        [HttpGet("{eventInstanceId}/teams/{teamId}/achievements")]
        public IActionResult TeamAchievements(Guid eventInstanceId, Guid teamId)
        {
            if (this.dbContext.isUserStaffForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                Team team = this.dbContext.Team.FirstOrDefault(p => p.TeamId == teamId && p.EventInstance == eventInstanceId);

                if (team == null)
                {
                    return NotFound();
                }

                return Ok(this.dbContext.GetAchievementsForTeam(teamId).Select(p => new AchievementViewModel(p)));
            }

            return Forbid();
        }

        [HttpPut("{eventInstanceId}/teams/{teamId}/achievements/{achievementId}")]
        public IActionResult GrantTeamAchievement(Guid eventInstanceId, Guid teamId, Guid achievementId)
        {
            if (this.dbContext.isUserStaffForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                Team team = this.dbContext.Team.FirstOrDefault(p => p.TeamId == teamId && p.EventInstance == eventInstanceId);

                if (team == null)
                {
                    return NotFound();
                }

                this.dbContext.AddAchievementUnlockForTeam(achievementId, teamId);
                this.hubContext.Clients.Group(teamId.ToString()).SendAsync("achievement", teamId.ToString());

                return this.TeamAchievements(eventInstanceId, teamId);
            }

            return Forbid();
        }

        [HttpDelete("{eventInstanceId}/teams/{teamId}/achievements/{achievementId}")]
        public IActionResult RevokeTeamAchievement(Guid eventInstanceId, Guid teamId, Guid achievementId)
        {
            if (this.dbContext.isUserStaffForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                Team team = this.dbContext.Team.FirstOrDefault(p => p.TeamId == teamId && p.EventInstance == eventInstanceId);

                if (team == null)
                {
                    return NotFound();
                }

                this.dbContext.RevokeAchievementUnlockForTeam(achievementId, teamId);
                this.hubContext.Clients.Group(teamId.ToString()).SendAsync("achievement", teamId.ToString());
                return this.TeamAchievements(eventInstanceId, teamId);
            }

            return Forbid();
        }

        [HttpGet("{eventInstanceId}/feed")]
        public IActionResult ActivityFeed(Guid eventInstanceId, int? startPage)
        {
            if (this.dbContext.isUserStaffForEvent(ParticipantIdFromClaim, eventInstanceId))
            {

                var feed = cache.GetOrAdd("Feed_" + eventInstanceId.ToString(), cacheEntry =>
                  {
                      cacheEntry.AbsoluteExpiration = DateTimeOffset.Now.AddSeconds(4);
                      int feedResultCount = 0;
                      return new Tuple<Database.SprocTypes.ActivityFeedItemViewModel[], int>(this.dbContext.GetActivityFeedForStaff(eventInstanceId, startPage ?? 0, out feedResultCount).ToArray(), feedResultCount);
                  });

                return Ok(new { items = feed.Item1, totalResultCount = feed.Item2 });
            }
            else
            {
                return Forbid();
            }
        }

        [HttpPut("{eventInstanceId}")]
        public IActionResult AddTeam(Guid eventInstanceId, [FromBody] NewTeamTemplate newTeam)
        {
            if (newTeam == null)
            {
                return BadRequest("Request body was null");
            }

            if (this.dbContext.isUserStaffForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                return this.CreateOrUpdateTeamInternal(eventInstanceId, newTeam);
            }

            return Forbid();
        }

        internal IActionResult CreateOrUpdateTeamInternal(Guid eventInstanceId, NewTeamTemplate newTeam)
        {
            if (!newTeam.TeamId.HasValue)
            {
                // If there's a correlation ID, search for that and potentially treat this as an update.
                if (newTeam.CorrelationId.HasValue)
                {
                    var existingTeam = this.dbContext.Team.FirstOrDefault(p => newTeam.CorrelationId.Value.ToString().Equals(p.CertificateThumbprint));

                    if (existingTeam != null)
                    {
                        return this.UpdateTeam(existingTeam, newTeam);
                    }
                }

                var newTeamRow = new Team()
                {
                    TeamId = Guid.NewGuid(),
                    Name = newTeam.Name,
                    ShortName = newTeam.ShortName,
                    Color = newTeam.Color,
                    IsTestTeam = newTeam.IsTestTeam,
                    EventInstance = eventInstanceId,
                    Passphrase = newTeam.Passphrase,
                    LastUpdate = DateTime.UtcNow,
                    GcNotes = newTeam.GcNotes,
                    CertificateThumbprint = newTeam.CorrelationId.HasValue ? newTeam.CorrelationId.Value.ToString() : null
                };

                this.dbContext.Team.Add(newTeamRow);
                this.dbContext.SaveChanges();

                return Ok(new StaffTeamViewModel(newTeamRow));
            }
            else
            {
                var team = this.dbContext.Team.FirstOrDefault(p => p.TeamId == newTeam.TeamId.Value);
                if (team != null)
                {
                    return this.UpdateTeam(team, newTeam);
                }

                return NotFound();
            }
        }

        private IActionResult UpdateTeam(Team existingTeam, NewTeamTemplate updatedTeam)
        {
            existingTeam.Name = updatedTeam.Name;
            existingTeam.ShortName = string.IsNullOrEmpty(updatedTeam.ShortName) ? existingTeam.ShortName : updatedTeam.ShortName;
            existingTeam.Color = updatedTeam.Color;
            existingTeam.IsTestTeam = updatedTeam.IsTestTeam;
            existingTeam.Passphrase = updatedTeam.Passphrase;
            existingTeam.LastUpdate = DateTime.UtcNow;
            existingTeam.GcNotes = updatedTeam.GcNotes;
            // Don't update the correlation ID if one was not specified.
            existingTeam.CertificateThumbprint = updatedTeam.CorrelationId.HasValue ? updatedTeam.CorrelationId.Value.ToString() : existingTeam.CertificateThumbprint;

            this.dbContext.Team.Update(existingTeam);
            this.dbContext.SaveChanges();

            return Ok(new StaffTeamViewModel(existingTeam));
        }

        [HttpDelete("{eventInstanceId}/teams/{teamId}")]
        public IActionResult DeleteTeam(Guid eventInstanceId, Guid teamId)
        {
            if (this.dbContext.isUserAdminForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                var team = this.dbContext.Team.FirstOrDefault(p => p.TeamId == teamId && p.EventInstance == eventInstanceId);

                if (team != null)
                {
                    try
                    {
                        this.dbContext.Team.Remove(team);
                        this.dbContext.SaveChanges();
                        return this.GetTeams(eventInstanceId);
                    }
                    catch (DbUpdateException)
                    {
                        return BadRequest("Could not delete team, ensure all references to the team have been removed");
                    }
                }

                return NotFound();
            }

            return Forbid();
        }

        [HttpPut("{eventInstanceId}/teams/{teamId}/call")]
        public IActionResult CreateOrUpdateCall(Guid eventInstanceId, Guid teamId, [FromBody] CallTemplate call)
        {
            if (this.dbContext.isUserStaffForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                #region Start a new call
                if (call.CallId == null)
                {
                    if (this.dbContext.Call.FirstOrDefault(p => p.Team == teamId && p.CallEnd == null) == null)
                    {
                        Guid participantId = Guid.Parse(User.Claims.First(p => p.Type == "ParticipantId").Value);

                        Call newCall = new Call()
                        {
                            CallId = Guid.NewGuid(),
                            Team = teamId,
                            Participant = participantId,
                            LastUpdated = DateTime.UtcNow,
                            CallType = call.CallType ?? "None",
                            CallSubType = call.CallSubType ?? "None",
                            CallStart = DateTime.UtcNow,
                            ToCEntry = call.TableOfContentsEntry,
                            Notes = call.Notes
                        };

                        // Allow CallEnd to be provided, and force it to be at least equal to or later than the call start time.
                        if (call.CallEnd.HasValue)
                        {
                            newCall.CallEnd = call.CallEnd > newCall.CallStart ? call.CallEnd : newCall.CallStart;
                        }

                        this.dbContext.Call.Add(newCall);
                        this.dbContext.SaveChanges();

                        this.hubContext.Clients.Group("ADMIN_" + eventInstanceId.ToString()).SendAsync("admin_call", teamId.ToString());
                        this.hubContext.Clients.Group(teamId.ToString()).SendAsync("call", teamId.ToString());

                        cache.Remove("Teams_" + eventInstanceId.ToString());

                        return Ok(newCall);
                    }
                    else
                    {
                        return BadRequest("Team already has an active call");
                    }
                }
                #endregion
                #region Update an existing call
                else
                {
                    Call existingCall = this.dbContext.Call.FirstOrDefault(p => p.CallId == call.CallId);

                    if (existingCall != null)
                    {
                        existingCall.CallEnd = call.CallEnd;
                        existingCall.Notes = call.Notes;
                        existingCall.LastUpdated = DateTime.UtcNow;
                        existingCall.CallType = call.CallType;
                        existingCall.CallSubType = call.CallSubType;
                        existingCall.PublicNotes = call.PublicNotes;
                        existingCall.ToCEntry = call.TableOfContentsEntry;

                        this.dbContext.Call.Update(existingCall);
                        this.dbContext.SaveChanges();

                        this.hubContext.Clients.Group("ADMIN_" + eventInstanceId.ToString()).SendAsync("admin_call", teamId.ToString());
                        this.hubContext.Clients.Group(teamId.ToString()).SendAsync("call", teamId.ToString());

                        cache.Remove("Teams_" + eventInstanceId.ToString());

                        return Ok(existingCall);
                    }
                    else
                    {
                        return NotFound();
                    }
                }
                #endregion
            }
            else
            {
                return Forbid();
            }
        }

        [HttpPut("{eventInstanceId}/teams/messages")]
        public IActionResult SendGcMessage(Guid eventInstanceId, [FromBody] GcMessageTemplate messageTemplate)
        {
            if (messageTemplate.Teams == null || messageTemplate.Teams.Count() == 0)
            {
                return BadRequest();
            }

            if (this.dbContext.isUserStaffForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                Guid participantId = Guid.Parse(User.Claims.First(p => p.Type == "ParticipantId").Value);
                var participation = this.dbContext.Participation.FirstOrDefault(p => p.Participant == participantId && p.EventInstance == eventInstanceId);

                foreach (var team in messageTemplate.Teams)
                {
                    GcMessage newMessage = new GcMessage()
                    {
                        LastUpdated = DateTime.UtcNow,
                        MessageId = Guid.NewGuid(),
                        MessageText = messageTemplate.Message,
                        Team = team,
                        GcParticipation = participation.ParticipationId
                    };

                    this.dbContext.GcMessages.Add(newMessage);
                }

                this.dbContext.SaveChanges();

                foreach (var team in messageTemplate.Teams)
                {
                    this.hubContext.Clients.Group(team.ToString()).SendAsync("message", team.ToString());
                }

                return GetAllGcMessages(eventInstanceId);
            }

            return Forbid();
        }

        [HttpGet("{eventInstanceId}/messages")]
        public IActionResult GetAllGcMessages(Guid eventInstanceId)
        {
            if (this.dbContext.isUserStaffForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                return Ok(this.dbContext.GetGcMessages(eventInstanceId));
            }

            return Forbid();
        }

        [HttpPut("{eventInstanceId}/teams/{teamId}/data")]
        public IActionResult UpdateTeamAdditionalData(Guid eventInstanceId, Guid teamId, [FromBody] TeamOverridesTemplate overrides)
        {
            if (this.dbContext.isUserStaffForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                var team = this.dbContext.Team.AsNoTracking().FirstOrDefault(p => p.TeamId == teamId && p.EventInstance == eventInstanceId);

                if (team != null)
                {
                    if (overrides != null && overrides.SortOverride != null)
                    {
                        var sortOverrideRow = this.dbContext.TeamAdditionalData.FirstOrDefault(p => p.Team == team.TeamId && p.DataKey == TeamSortOverrideViewModel.AdditionalDataKey);
                        bool isUpdate = sortOverrideRow != null;

                        if (sortOverrideRow == null)
                        {
                            sortOverrideRow = new TeamAdditionalData()
                            {
                                Team = team.TeamId,
                                DataKey = TeamSortOverrideViewModel.AdditionalDataKey
                            };
                        }

                        var overrideJsonString = JsonConvert.SerializeObject(overrides.SortOverride);
                        sortOverrideRow.LastUpdated = DateTime.UtcNow;
                        sortOverrideRow.DataValue = overrideJsonString;

                        if (isUpdate)
                        {
                            this.dbContext.TeamAdditionalData.Update(sortOverrideRow);
                        }
                        else
                        {
                            this.dbContext.TeamAdditionalData.Add(sortOverrideRow);
                        }

                        this.dbContext.SaveChanges();
                        this.cache.Remove("Teams_" + eventInstanceId.ToString());
                    }

                    return GetTeams(eventInstanceId);
                }

                return NotFound();
            }

            return Forbid();
        }
    }
}
