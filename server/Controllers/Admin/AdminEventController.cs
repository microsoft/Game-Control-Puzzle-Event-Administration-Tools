using GameControl.Server.Database;
using GameControl.Server.Database.Tables;
using GameControl.Server.Hubs;
using GameControl.Server.RequestTypes;
using GameControl.Server.RequestTypes.Admin;
using GameControl.Server.ViewModel;
using GameControl.Server.ViewModel.Admin;
using GameControl.Server.ViewModel.Staff;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using System;
using System.Linq;

namespace GameControl.Server.Controllers
{
    [Authorize]
    [Route("api/admin/events")]
    public class AdminEventController : ControllerBase
    {
        private readonly GameControlContext dbContext;
        private readonly IHubContext<NotificationHub> hubContext;

        public AdminEventController(GameControlContext dbContext, IHubContext<NotificationHub> hubContext)
        {
            this.dbContext = dbContext;
            this.hubContext = hubContext;
        }

        [HttpGet("{eventInstanceId}/json")]
        public IActionResult GetEventInstanceSummary(Guid eventInstanceId)
        {
            if (this.dbContext.isUserAdminForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                var jsonObject = new JObject();

                jsonObject.Add("eventInstanceId", eventInstanceId);

                #region Achievement Data
                var eventInstance = this.dbContext.EventInstance.First(p => p.EventInstanceId == eventInstanceId);
                var achievementsDb = this.dbContext.Achievement.Where(p => p.EventId == eventInstance.Event).Select(p => new AchievementViewModel(p));

                var achievementsArray = new JArray();
                foreach (var achievement in achievementsDb)
                {
                    var achievementObject = new JObject();
                    achievementObject.Add("name", achievement.Name);
                    achievementObject.Add("description", achievement.Description);

                    var achievementDictionary = new JObject();
                    achievementDictionary.Add(achievement.AchievementId.ToString(), achievementObject);
                    achievementsArray.Add(achievementDictionary);
                }

                jsonObject.Add("achievements", achievementsArray);
                #endregion Achievement Data

                #region Content Data
                

                // ContentId
                // Type
                // Name
                // Content

                // or
                // LocationId
                // Type
                // Name
                // Address
                // Lat
                // Long
                // Flags

                #endregion Content Data

                #region Puzzle Data
                var puzzlesArray = new JArray();

                var allDbPuzzles = this.dbContext.GetCluesForStaff(eventInstanceId).Select(p => new StaffClueViewModel(p, eventInstanceId)).ToList();
                foreach (var puzzle in allDbPuzzles)
                {
                    var puzzleObject = new JObject();
                    puzzleObject.Add("tableOfContentId", puzzle.TableOfContentId);
                    puzzleObject.Add("submittableId", puzzle.SubmittableId);
                    puzzleObject.Add("title", puzzle.SubmittableTitle);
                    puzzleObject.Add("type", puzzle.SubmittableType);
                    puzzleObject.Add("sortOrder", puzzle.SortOrder);

                    // TODO: Add answers
                    var answers = this.dbContext.Answer.Where(p =>
                        p.Submittable == puzzle.SubmittableId && p.EventInstance == puzzle.EventInstanceId)
                        .ToList()
                        .Select(p => new AnswerViewModel(p)
                    {
                            UnlockedClues = this.dbContext.GetToCsUnlockedByAnswer(p.AnswerId),
                            UnlockedAchievements = this.dbContext.GetAchievementsUnlockedByAnswer(p.AnswerId).Select(q => new AchievementViewModel(q)),
                            AdditionalContent = p.AdditionalContent.HasValue ? new ContentViewModel(this.dbContext.AdditionalContent.First(q => q.ContentId == p.AdditionalContent.Value)) : null
                    });

                    #region Answers
                    var answersArray = new JArray();
                    foreach (var answer in answers)
                    {
                        var answerObject = new JObject();
                        answerObject.Add("answerText", answer.AnswerText);
                        answerObject.Add("response", answer.AnswerResponse);
                        answerObject.Add("isCorrect", answer.IsCorrectAnswer);
                        answerObject.Add("isHidden", answer.IsHidden);

                        if (answer.TeamId.HasValue)
                        {
                            answerObject.Add("appliesToTeam", answer.TeamId.Value);
                        }

                        #region Unlocked Clues
                        if (answer.UnlockedClues.Count() > 0)
                        {
                            var unlockedCluesArray = new JArray();
                            foreach (var unlockedClue in answer.UnlockedClues)
                            {
                                JObject unlockedClueObject = new JObject();
                                unlockedClueObject.Add("unlockedTableOfContentId", unlockedClue.TableOfContentId);
                                unlockedClueObject.Add("__comment.title", unlockedClue.Title);
                                unlockedCluesArray.Add(unlockedClueObject);
                            }

                            answerObject.Add("unlockedPuzzles", unlockedCluesArray);
                        }
                        #endregion Unlocked Clues

                        #region Unlocked Achievements
                        if (answer.UnlockedAchievements.Count() > 0)
                        {
                            var unlockedAchievementsArray = new JArray();

                            foreach (var unlockedAchievement in answer.UnlockedAchievements)
                            {
                                var unlockedAchievementObject = new JObject();
                                unlockedAchievementObject.Add("unlockedAchievementId", unlockedAchievement.AchievementId);
                                unlockedAchievementObject.Add("__comment.name", unlockedAchievement.Name);
                                unlockedAchievementObject.Add(unlockedAchievement);
                            }

                            answerObject.Add("unlockedAchievements", unlockedAchievementsArray);
                        }
                        #endregion Unlocked Achievements

                        var answerDictionary = new JObject();
                        answerDictionary.Add(answer.AnswerId.ToString(), answerObject);
                        answersArray.Add(answerDictionary);
                    }

                    // TODO: Add content? Or just a reference to content?

                    var puzzleDictionary = new JObject();
                    puzzleDictionary.Add(puzzle.TableOfContentId.ToString(), puzzleObject);
                    puzzlesArray.Add(puzzleDictionary);
                    #endregion Answers
                }

                jsonObject.Add("puzzles", puzzlesArray);
                #endregion Puzzle Data

                #region Team Data
                // TODO: Organize this outside the greater object for partitioning this later?

                #endregion Team Data

                #region Event State Data
                // Grab processed data for the event's state

                // Should team calls live here?
                #endregion Event State Data

                return Ok(jsonObject.ToString());
            }
            else
            {
                return Forbid();
            }
        }

        [HttpGet]
        public IActionResult GetEvents()
        {
            if (this.dbContext.isUserMetaAdmin(ParticipantIdFromClaim))
            {
                var allEventInstances = this.dbContext.EventInstance.AsNoTracking();
                var allEvents = this.dbContext.Event.AsNoTracking().Select(p => new EventViewModel()
                {
                    EventId = p.EventId,
                    Name = p.EventName,
                    EventInstances = allEventInstances.Where(q => q.Event == p.EventId).OrderBy(s => s.StartTime).ToList()
                }).ToList();

                return Ok(allEvents);
            }
            else
            {
                return Forbid();
            }
        }

        [HttpPut]
        public IActionResult AddEvent([FromBody] NewEventTemplate eventTemplate)
        {
            if (this.dbContext.isUserMetaAdmin(Guid.Parse(User.Claims.First(p => p.Type == "ParticipantId").Value)))
            {
                if (!eventTemplate.EventId.HasValue)
                {
                    Event newEvent = new Event()
                    {
                        EventId = Guid.NewGuid(),
                        EventName = eventTemplate.EventName
                    };

                    this.dbContext.Event.Add(newEvent);
                    this.dbContext.SaveChanges();
                }
                else
                {
                    var existingEvent = this.dbContext.Event.FirstOrDefault(p => p.EventId == eventTemplate.EventId.Value);

                    if (existingEvent != null)
                    {
                        existingEvent.EventName = eventTemplate.EventName;
                        this.dbContext.Event.Update(existingEvent);
                        this.dbContext.SaveChanges();
                    }
                    else
                    {
                        return NotFound();
                    }
                }

                return GetEvents();
            } else
            {
                return Forbid();
            }
        }

        #region Event Instances

        [HttpGet("{eventId}")]
        public IActionResult GetEventInstances(Guid eventId)
        {
            if (this.dbContext.isUserMetaAdmin(Guid.Parse(User.Claims.First(p => p.Type == "ParticipantId").Value)))
            {
                return Ok(this.dbContext.EventInstance.Where(p => p.Event == eventId));
            }
            else
            {
                return Forbid();
            }
        }

        [HttpPut("{eventId}")]
        public IActionResult AddEventInstance(Guid eventId, [FromBody] EventInstanceTemplate eventInstanceTemplate)
        {
            if (this.dbContext.isUserMetaAdmin(Guid.Parse(User.Claims.First(p => p.Type == "ParticipantId").Value)))
            {
                EventInstance newEventInstance = new EventInstance()
                {
                    EventInstanceId = Guid.NewGuid(),
                    Event = eventId,
                    FriendlyName = eventInstanceTemplate.FriendlyName,
                    StartTime = eventInstanceTemplate.StartTime,
                    EndTime = eventInstanceTemplate.EndTime,
                    EventType = eventInstanceTemplate.EventType
                };

                this.dbContext.EventInstance.Add(newEventInstance);
                this.dbContext.SaveChanges();

                return Ok(newEventInstance);
            }

            return Forbid();
        }

        [HttpPut("{eventId}/clone/{sourceEventInstanceId}")]
        public IActionResult ClonePreviousEventInstance(Guid eventId, Guid sourceEventInstanceId, [FromBody] EventInstanceTemplate eventInstanceTemplate)
        {
            if (this.dbContext.isUserMetaAdmin(Guid.Parse(User.Claims.First(p => p.Type == "ParticipantId").Value)))
            {
                EventInstance newEventInstance = new EventInstance()
                {
                    EventInstanceId = Guid.NewGuid(),
                    Event = eventId,
                    FriendlyName = eventInstanceTemplate.FriendlyName,
                    StartTime = eventInstanceTemplate.StartTime,
                    EndTime = eventInstanceTemplate.EndTime,
                    EventType = eventInstanceTemplate.EventType
                };

                this.dbContext.EventInstance.Add(newEventInstance);
                this.dbContext.SaveChanges();

                var tocs = this.dbContext.TableOfContentsEntry.Where(p => p.EventInstance == sourceEventInstanceId);

                foreach (var toc in tocs)
                {
                    TableOfContentsEntry newEntry = new TableOfContentsEntry()
                    {
                        TableOfContentId = Guid.NewGuid(),
                        EventInstance = newEventInstance.EventInstanceId,
                        SortOrder = toc.SortOrder,
                        Submittable = toc.Submittable
                    };
                    this.dbContext.TableOfContentsEntry.Add(newEntry);
                }

                this.dbContext.SaveChanges();
                return Ok(newEventInstance);
            }

            return Forbid();
        }

        #endregion

        #region API Keys

        [HttpGet("{eventInstanceId}/keys")]
        public IActionResult GetApiKeys(Guid eventInstanceId)
        {
            if (this.dbContext.isUserAdminForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                return Ok(this.dbContext.ApiKey.AsNoTracking().Where(p => p.EventInstance == eventInstanceId));
            }

            return Forbid();
        }

        [HttpPut("{eventInstanceId}/keys")]
        public IActionResult UpdateApiKey(Guid eventInstanceId, [FromBody] ApiKeyTemplate newKey)
        {
            if (this.dbContext.isUserAdminForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                if (!newKey.Id.HasValue)
                {
                    var newKeyRow = new ApiKey()
                    {
                        EventInstance = eventInstanceId,
                        Name = newKey.Name,
                        IsRevoked = false,
                        KeyValue = Guid.NewGuid().ToString(),
                        LastUpdated = DateTime.UtcNow
                    };

                    this.dbContext.ApiKey.Add(newKeyRow);
                    this.dbContext.SaveChanges();
                }
                else
                {
                    var existingKey = this.dbContext.ApiKey.FirstOrDefault(p => p.Id == newKey.Id.Value);
                    if (existingKey != null)
                    {
                        existingKey.IsRevoked = newKey.IsRevoked;
                        existingKey.Name = newKey.Name;
                        existingKey.LastUpdated = DateTime.UtcNow;

                        this.dbContext.ApiKey.Update(existingKey);
                        this.dbContext.SaveChanges();
                    }
                    else
                    {
                        return NotFound();
                    }
                }

                return GetApiKeys(eventInstanceId);
            }

            return Forbid();
        }

        [HttpDelete("{eventInstanceId}/keys")]
        public IActionResult DeleteApiKey(Guid eventInstanceId, int keyId)
        {
            if (this.dbContext.isUserAdminForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                var existingKey = this.dbContext.ApiKey.FirstOrDefault(p => p.Id == keyId);
                if (existingKey != null)
                {
                    this.dbContext.ApiKey.Remove(existingKey);
                    this.dbContext.SaveChanges();

                    return GetApiKeys(eventInstanceId);
                }
                else
                {
                    return NotFound();
                }
            }

            return Forbid();
        }

        #endregion

        #region Event Settings
        [HttpGet("{eventInstanceId}/settings")]
        public IActionResult GetEventSettings(Guid eventInstanceId)
        {
            if (this.dbContext.isUserAdminForEvent(Guid.Parse(User.Claims.First(p => p.Type == "ParticipantId").Value), eventInstanceId))
            {
                return Ok(this.dbContext.Settings.Where(p => p.EventInstanceId == eventInstanceId).Select(p => new SettingViewModel(p)).ToList());
            }

            return Forbid();
        }

        [HttpPut("{eventInstanceId}/settings/{settingName}")]
        public IActionResult UpdateStringSetting(Guid eventInstanceId, string settingName, [FromBody] SettingTemplate stringValue)
        {
            if (this.dbContext.isUserAdminForEvent(Guid.Parse(User.Claims.First(p => p.Type == "ParticipantId").Value), eventInstanceId))
            {
                if (stringValue == null || (stringValue.SettingType != "String" && stringValue.SettingType != "UserString"))
                {
                    return BadRequest();
                }

                var existingSetting = this.dbContext.Settings.FirstOrDefault(p => p.EventInstanceId == eventInstanceId && p.Name == settingName);

                if (existingSetting == null)
                {
                    Settings newSetting = new Settings
                    {
                        SettingType = stringValue.SettingType,
                        Name = settingName,
                        LastUpdated = DateTime.UtcNow,
                        EventInstanceId = eventInstanceId,
                        StringValue = stringValue.Value
                    };

                    this.dbContext.Settings.Add(newSetting);
                    this.dbContext.SaveChanges();
                }
                else
                {
                    existingSetting.StringValue = stringValue.Value;
                    existingSetting.LastUpdated = DateTime.UtcNow;

                    this.dbContext.Settings.Update(existingSetting);
                    this.dbContext.SaveChanges();
                }

                return GetEventSettings(eventInstanceId);
            }

            return Forbid();
        }
        #endregion

        #region ForceRefresh
        [HttpGet("{eventInstanceId}/refreshplayers")]
        public IActionResult ForceRefreshTeams(Guid eventInstanceId)
        {
            if (this.dbContext.isUserStaffForEvent(Guid.Parse(User.Claims.First(p => p.Type == "ParticipantId").Value), eventInstanceId))
            {
                var teams = this.dbContext.Team
                .Where(p => p.EventInstance == eventInstanceId)
                .Select(p => new
                {
                    TeamId = p.TeamId,
                    Name = p.Name,
                    Color = p.Color,
                    IsTestTeam = p.IsTestTeam,
                }).ToList();

                foreach (var team in teams)
                {
                    this.hubContext.Clients.Group(team.TeamId.ToString()).SendAsync("forcerefresh");
                }
                return Ok(new {Refreshed = true});
            }
            return Forbid();
        }

        [HttpGet("{eventInstanceId}/refreshstaff")]
        public IActionResult ForceRefreshStaff(Guid eventInstanceId)
        {
            if (this.dbContext.isUserStaffForEvent(Guid.Parse(User.Claims.First(p => p.Type == "ParticipantId").Value), eventInstanceId))
            {
                this.hubContext.Clients.Group("ADMIN_" + eventInstanceId.ToString()).SendAsync("admin_forcerefresh");
                return Ok(new { Refreshed = true });
            }

            return Forbid();
        }
        #endregion
    }
}
