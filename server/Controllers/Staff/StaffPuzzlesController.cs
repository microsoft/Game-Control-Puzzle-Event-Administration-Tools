using GameControl.Server.Database;
using GameControl.Server.Database.Tables;
using GameControl.Server.Events;
using GameControl.Server.Hubs;
using GameControl.Server.RequestTypes;
using GameControl.Server.RequestTypes.Staff;
using GameControl.Server.Util;
using GameControl.Server.ViewModel;
using GameControl.Server.ViewModel.Staff;
using LazyCache;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.Controllers
{
    [Authorize]
    [Route("api/staff/puzzles")]
    public class StaffPuzzlesController : ControllerBase
    {
        private readonly GameControlContext dbContext;
        private readonly IHubContext<NotificationHub> hubContext;
        private readonly IAppCache cache;
        private readonly IEventHandler puzzleEventHandler;
        private readonly IMediaHandler puzzleMediaHandler;

        public StaffPuzzlesController(GameControlContext dbContext, IHubContext<NotificationHub> hubContext, IAppCache cache, IEventHandler puzzleEventHandler, IMediaHandler puzzleMediaHandler)
        {
            this.dbContext = dbContext;
            this.hubContext = hubContext;
            this.cache = cache;
            this.puzzleEventHandler = puzzleEventHandler;
            this.puzzleMediaHandler = puzzleMediaHandler;
        }

        [HttpGet("{eventInstanceId}")]
        public IActionResult AllPuzzles(Guid eventInstanceId)
        {
            if (this.dbContext.isUserStaffForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                var allClues = this.dbContext.GetCluesForStaff(eventInstanceId).Select(p => new StaffClueViewModel(p, eventInstanceId)).ToList();
                var gridData = this.dbContext.GetDataForTheGrid(eventInstanceId);

                // TODO: Consider moving some of the aggregation logic into the frontend to reduce
                // API tier load
                var teamsList = this.dbContext.Team.Where(p => p.EventInstance == eventInstanceId).ToList();
                var clueInstances = this.dbContext.GetClueInstancesForEvent(eventInstanceId).ToList();

                foreach (var clue in allClues)
                {
                    clue.Content = ContentUtil.GetContentForClue(this.dbContext, clue.TableOfContentId);
                    clue.Instances = clueInstances.Where(p => p.TableOfContentsEntry == clue.TableOfContentId).Select(p => new PuzzleInstanceViewModel(p));

                    var teamsStatus = clue.TeamsStatus as List<SolveDataViewModel>;
                    TimeSpan runningSolveTime = new TimeSpan();
                    int numTeams = 0;

                    foreach (var team in teamsList)
                    {
                        var teamProgress = gridData.FirstOrDefault(p => p.TeamId == team.TeamId && p.SubmittableId == clue.SubmittableId);

                        if (teamProgress != null)
                        {
                            if (teamProgress.SubmissionTime.HasValue && !team.IsTestTeam)
                            {
                                runningSolveTime += (teamProgress.SubmissionTime.Value - teamProgress.UnlockTime);
                                numTeams++;
                            }

                            teamsStatus.Add(new SolveDataViewModel()
                            {
                                IsSkipped = teamProgress.UnlockReason.Trim().Equals("Skip", StringComparison.OrdinalIgnoreCase),
                                SolveTime = teamProgress.SubmissionTime,
                                StartTime = teamProgress.UnlockTime,
                                TeamId = teamProgress.TeamId.Value,
                                TeamName = team.Name
                            });
                        }
                        else
                        {
                            teamsStatus.Add(new SolveDataViewModel()
                            {
                                IsSkipped = false,
                                SolveTime = null,
                                StartTime = null,
                                TeamId = team.TeamId,
                                TeamName = team.Name
                            });
                        }
                    }

                    if (numTeams > 0)
                    {
                        clue.AverageSolveTime = (int)(runningSolveTime.TotalMinutes / numTeams);
                    }
                }

                return Ok(allClues);
            }
            else
            {
                return Forbid();
            }
        }

        [HttpGet("{eventInstanceId}/toc/{tableOfContentsId}")]
        public IActionResult Details(Guid eventInstanceId, Guid tableOfContentsId)
        {
            if (this.dbContext.isUserStaffForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                var toc = this.dbContext.TableOfContentsEntry.FirstOrDefault(p => p.TableOfContentId == tableOfContentsId);

                if (toc != null)
                {
                    var submittable = this.dbContext.Submittable.FirstOrDefault(p => p.SubmittableId == toc.Submittable);

                    var answers = this.dbContext.Answer.Where(p =>
                        p.Submittable == toc.Submittable && p.EventInstance == toc.EventInstance)
                        .ToList()
                        .Select(p => new AnswerViewModel(p)
                        {
                            UnlockedClues = this.dbContext.GetToCsUnlockedByAnswer(p.AnswerId),
                            UnlockedAchievements = this.dbContext.GetAchievementsUnlockedByAnswer(p.AnswerId).Select(q => new AchievementViewModel(q)),
                            AdditionalContent = p.AdditionalContent.HasValue ? new ContentViewModel(this.dbContext.AdditionalContent.First(q => q.ContentId == p.AdditionalContent.Value)) : null
                        });

                    StaffClueViewModel clueDetails = new StaffClueViewModel(toc, submittable)
                    {
                        Content = ContentUtil.GetContentForClue(this.dbContext, tableOfContentsId),
                        Answers = answers,
                        Ratings = this.dbContext.GetRatingsForTableOfContentsEntry(toc.TableOfContentId).Select(p => new PuzzleRatingViewModel(p)),
                        Instances = this.dbContext.ToCInstance.Where(p => p.TableOfContentsEntry == toc.TableOfContentId).Select(p => new PuzzleInstanceViewModel(p))
                    };

                    return Ok(clueDetails);
                }
                else
                {
                    return NotFound();
                }
            }
            else
            {
                return Forbid();
            }
        }

        [HttpDelete("{eventInstanceId}/toc/{tableOfContentId}")]
        public IActionResult DeleteToC(Guid eventInstanceId, Guid tableOfContentId)
        {
            if (this.dbContext.isUserStaffForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                var toc = this.dbContext.TableOfContentsEntry.FirstOrDefault(p => p.TableOfContentId == tableOfContentId);

                if (toc != null)
                {
                    var submittable = this.dbContext.Submittable.FirstOrDefault(p => p.SubmittableId == toc.Submittable);
                    var answers = this.dbContext.Answer.Where(p => p.Submittable == submittable.SubmittableId && p.EventInstance == eventInstanceId);

                    if (answers != null && answers.Count() > 0)
                    {
                        return BadRequest("Ensure no items link to this puzzle first.");
                    }

                    // TODO: Should we delete the submittable or leave it as a disconnected item from the ToC entry? 
                    // For now, we will leave the submittable.

                    try
                    {
                        this.dbContext.TableOfContentsEntry.Remove(toc);
                        this.dbContext.SaveChanges();
                    }
                    catch (DbUpdateException)
                    {
                        return BadRequest("Ensure no items link to this puzzle first.");
                    }

                    return AllPuzzles(eventInstanceId);
                }

                return NotFound();
            }
            else
            {
                return Forbid();
            }
        }

        [HttpPut("{eventInstanceId}/toc")]
        public IActionResult AddOrUpdateSubmittable(Guid eventInstanceId, [FromBody] ClueTemplate newClue)
        {
            if (this.dbContext.isUserStaffForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                if (newClue.TableOfContentId == null)
                {
                    var transaction = this.dbContext.Database.BeginTransaction();

                    var newSubmittable = new Submittable()
                    {
                        SubmittableId = Guid.NewGuid(),
                        Title = newClue.Title,
                        ShortTitle = newClue.ShortTitle,
                        SubmittableType = newClue.SubmittableType,
                        LastUpdate = DateTime.UtcNow,
                    };

                    this.dbContext.Submittable.Add(newSubmittable);
                    this.dbContext.SaveChanges();

                    var newToc = new TableOfContentsEntry()
                    {
                        TableOfContentId = Guid.NewGuid(),
                        Submittable = newSubmittable.SubmittableId,
                        EventInstance = eventInstanceId,
                        SortOrder = newClue.SortOrder,
                        OpenTime = newClue.OpenTime,
                        ClosingTime = newClue.ClosingTime,
                        ParSolveTime = newClue.ParTime
                    };

                    this.dbContext.TableOfContentsEntry.Add(newToc);
                    this.dbContext.SaveChanges();

                    transaction.Commit();

                    return Ok(new StaffClueViewModel(newToc, newSubmittable));
                }
                else
                {
                    var transaction = this.dbContext.Database.BeginTransaction();

                    var toc = this.dbContext.TableOfContentsEntry.FirstOrDefault(p => p.TableOfContentId == newClue.TableOfContentId);

                    if (toc == null)
                    {
                        return NotFound();
                    }

                    var submittable = this.dbContext.Submittable.FirstOrDefault(p => p.SubmittableId == toc.Submittable);

                    if (submittable == null)
                    {
                        // This really shouldn't be possible since the Submittable is a FK relationship on the toc and this would
                        // imply a database integrity issue, but we'll check anyway.
                        return NotFound();
                    }


                    if (submittable.Title != newClue.Title ||
                        submittable.SubmittableType != newClue.SubmittableType ||
                        submittable.ShortTitle != newClue.ShortTitle)
                    {
                        submittable.LastUpdate = DateTime.UtcNow;
                    }

                    submittable.Title = newClue.Title;
                    submittable.ShortTitle = newClue.ShortTitle;
                    submittable.SubmittableType = newClue.SubmittableType;

                    toc.SortOrder = newClue.SortOrder;
                    toc.OpenTime = newClue.OpenTime;
                    toc.ClosingTime = newClue.ClosingTime;
                    toc.ParSolveTime = newClue.ParTime;

                    this.dbContext.TableOfContentsEntry.Update(toc);
                    this.dbContext.Submittable.Update(submittable);
                    this.dbContext.SaveChanges();

                    transaction.Commit();

                    return Ok(new StaffClueViewModel(toc, submittable));
                }
            }

            return Forbid();
        }

        [HttpPut("{eventInstanceId}/toc/{tableOfContentsId}/answers")]
        public IActionResult AddAnswer(Guid eventInstanceId, Guid tableOfContentsId, [FromBody] AnswerTemplate answer)
        {
            if (this.dbContext.isUserStaffForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                var toc = this.dbContext.TableOfContentsEntry.FirstOrDefault(p => p.TableOfContentId == tableOfContentsId && p.EventInstance == eventInstanceId);
                if (toc != null)
                {
                    string sanitizedAnswer = GameControlUtil.SanitizeString(answer.AnswerText);

                    if (!string.IsNullOrEmpty(sanitizedAnswer))
                    {
                        if (!answer.AnswerId.HasValue)
                        {
                            var similarAnswer = this.dbContext.Answer.AsEnumerable().FirstOrDefault(p => 
                                sanitizedAnswer.Equals(p.AnswerText, StringComparison.InvariantCultureIgnoreCase) &&
                                p.EventInstance == eventInstanceId &&
                                p.Submittable == toc.Submittable &&
                                p.AppliesToTeam == answer.AppliesToTeam);

                            if (similarAnswer != null)
                            {
                                return BadRequest("That answer is already in use for this puzzle.");
                            }
                            else
                            {
                                Answer newAnswer = new Answer()
                                {
                                    AnswerId = Guid.NewGuid(),
                                    AnswerText = sanitizedAnswer,
                                    AnswerResponse = answer.AnswerResponse,
                                    IsCorrectAnswer = answer.IsCorrect,
                                    LastUpdated = DateTime.UtcNow,
                                    EventInstance = eventInstanceId,
                                    Submittable = toc.Submittable,
                                    AppliesToTeam = answer.IsTeamSpecific ? answer.AppliesToTeam : null,
                                    IsHidden = answer.IsHidden
                                };

                                this.dbContext.Answer.Add(newAnswer);
                                this.dbContext.SaveChanges();
                            }
                        }
                        else
                        {
                            Answer previousAnswer = this.dbContext.Answer.FirstOrDefault(p => p.AnswerId == answer.AnswerId.Value);

                            if (previousAnswer != null)
                            {
                                previousAnswer.AnswerResponse = answer.AnswerResponse;
                                previousAnswer.IsCorrectAnswer = answer.IsCorrect;
                                previousAnswer.IsHidden = answer.IsHidden;
                                previousAnswer.LastUpdated = DateTime.UtcNow;

                                this.dbContext.Answer.Update(previousAnswer);
                                this.dbContext.SaveChanges();
                            }
                            else
                            {
                                return NotFound();
                            }
                        }
                        return this.Details(eventInstanceId, tableOfContentsId);
                    }
                    else
                    {
                        return BadRequest("Answer cannot be empty");
                    }
                }
                else
                {
                    return NotFound();
                }
            }
            else
            {
                return Forbid();
            }
        }

        [HttpDelete("{eventInstanceId}/toc/{tableOfContentsId}/answers/{answerId}")]
        public IActionResult DeleteAnswer(Guid eventInstanceId, Guid tableOfContentsId, Guid answerId)
        {
            if (this.dbContext.isUserStaffForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                var answer = this.dbContext.Answer.FirstOrDefault(p => p.AnswerId == answerId);

                if (answer != null)
                {
                    var tocUnlocksForAnswer = this.dbContext.GetToCsUnlockedByAnswer(answerId);

                    if (tocUnlocksForAnswer.Count() > 0)
                    {
                        return BadRequest("One or more puzzles are unlocked by this answer. Please delete them first before deleting the answer.");
                    }
                    else
                    {
                        this.dbContext.Answer.Remove(answer);
                        this.dbContext.SaveChanges();

                        return this.Details(eventInstanceId, tableOfContentsId); 
                    }
                }
                else
                {
                    return NotFound();
                }
            }
            else
            {
                return Forbid();
            }
        }

        [HttpPut("{eventInstanceId}/answers/{answerId}/unlocks/{tableOfContentsId}")]
        public IActionResult AddUnlock(Guid eventInstanceId, Guid answerId, Guid tableOfContentsId, Guid? appliesToTeam)
        {
            if (this.dbContext.isUserStaffForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                var answer = this.dbContext.Answer.FirstOrDefault(p => p.AnswerId == answerId);

                if (answer != null)
                {
                    if (dbContext.SubmittableUnlockRelationship.FirstOrDefault(p =>
                        p.Answer == answerId && p.TableOfContentsEntry == tableOfContentsId && p.Team == appliesToTeam) == null)
                    {
                        this.dbContext.SubmittableUnlockRelationship.Add(new Database.Tables.SubmittableUnlockRelationship()
                        {
                            Answer = answerId,
                            TableOfContentsEntry = tableOfContentsId,
                            Team = appliesToTeam,
                            LastUpdated = DateTime.UtcNow
                        });

                        this.dbContext.SaveChanges();
                        return Ok(new AnswerViewModel()
                        {
                            AnswerId = answer.AnswerId,
                            AnswerResponse = answer.AnswerResponse,
                            AnswerText = answer.AnswerText,
                            IsCorrectAnswer = answer.IsCorrectAnswer,
                            TeamId = answer.AppliesToTeam,
                            UnlockedClues = this.dbContext.GetToCsUnlockedByAnswer(answer.AnswerId),
                            UnlockedAchievements = this.dbContext.GetAchievementsUnlockedByAnswer(answer.AnswerId).Select(p => new AchievementViewModel(p)).ToList()
                        });
                    }
                    else
                    {
                        return BadRequest();
                    }
                }
                else
                {
                    return NotFound();
                }
            }
            else
            {
                return Forbid();
            }
        }

        [HttpDelete("{eventInstanceId}/answers/{answerId}/unlocks/{tableOfContentsId}")]
        public IActionResult DeleteUnlock(Guid eventInstanceId, Guid answerId, Guid tableOfContentsId)
        {
            if (this.dbContext.isUserStaffForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                var answer = this.dbContext.Answer.FirstOrDefault(p => p.AnswerId == answerId);                
                var unlock = this.dbContext.SubmittableUnlockRelationship.FirstOrDefault(p => p.Answer == answerId && p.TableOfContentsEntry == tableOfContentsId);

                if (answer != null && unlock != null)
                {
                    this.dbContext.SubmittableUnlockRelationship.Remove(unlock);
                    this.dbContext.SaveChanges();

                    return Ok(new AnswerViewModel()
                    {
                        AnswerId = answer.AnswerId,
                        AnswerResponse = answer.AnswerResponse,
                        AnswerText = answer.AnswerText,
                        IsCorrectAnswer = answer.IsCorrectAnswer,
                        TeamId = answer.AppliesToTeam,
                        UnlockedClues = this.dbContext.GetToCsUnlockedByAnswer(answer.AnswerId),
                        UnlockedAchievements = this.dbContext.GetAchievementsUnlockedByAnswer(answer.AnswerId).Select(p => new AchievementViewModel(p)).ToList()
                    });
                }
                else
                {
                    return NotFound();
                }
            }
            else
            {
                return Forbid();
            }
        }

        #region Achievements
        [HttpGet("{eventInstanceId}/achievements")]
        public IActionResult GetAchievements(Guid eventInstanceId)
        {
            if (this.dbContext.isUserStaffForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                var eventInstance = this.dbContext.EventInstance.First(p => p.EventInstanceId == eventInstanceId);
                return Ok(this.dbContext.Achievement.Where(p => p.EventId == eventInstance.Event).Select(p => new AchievementViewModel(p)));
            }

            return Forbid();
        }

        [HttpPut("{eventInstanceId}/achievements")]
        public async Task<IActionResult> UpdateAchievement(Guid eventInstanceId, [FromForm] AchievementTemplate achievement)
        {
            if (this.dbContext.isUserStaffForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                if (!achievement.AchievementId.HasValue)
                {
                    var eventInstance = this.dbContext.EventInstance.First(p => p.EventInstanceId == eventInstanceId);

                    using (var memoryStream = new MemoryStream())
                    {
                        await achievement.AchievementImage.CopyToAsync(memoryStream);

                        // create new achievement
                        var newAchievement = new Achievement()
                        {
                            AchievementId = Guid.NewGuid(),
                            CreatedOn = DateTime.UtcNow,
                            Name = achievement.Name,
                            Description = achievement.Description,
                            EventId = eventInstance.Event,
                            Icon = memoryStream.ToArray()
                        };

                        this.dbContext.Achievement.Add(newAchievement);
                        this.dbContext.SaveChanges();
                        return Ok(new AchievementViewModel(newAchievement));
                    }
                }
                else
                {
                    // update existing achievement
                    var existingAchievement = this.dbContext.Achievement.FirstOrDefault(p => p.AchievementId == achievement.AchievementId.Value);

                    if (existingAchievement != null)
                    {
                        existingAchievement.Name = achievement.Name;
                        existingAchievement.Description = achievement.Description;

                        // Only update the image if one is specified, if not we'll keep the old one.
                        if (achievement.AchievementImage != null)
                        {
                            using (var memoryStream = new MemoryStream())
                            {
                                await achievement.AchievementImage.CopyToAsync(memoryStream);
                                existingAchievement.Icon = memoryStream.ToArray();
                            }
                        }

                        this.dbContext.Achievement.Update(existingAchievement);
                        this.dbContext.SaveChanges();
                        return Ok(new AchievementViewModel(existingAchievement));
                    }
                    else
                    {
                        return NotFound();
                    }
                }
            }

            return Forbid();
        }

        [HttpPut("{eventInstanceId}/answers/{answerId}/achievements/{achievementId}")]
        public IActionResult AddAchievementUnlock(Guid eventInstanceId, Guid answerId, Guid achievementId)
        {
            if (this.dbContext.isUserStaffForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                var answer = this.dbContext.Answer.FirstOrDefault(p => p.AnswerId == answerId);

                if (answer != null)
                {
                    // TODO: Do any validation on achievement Ids?
                    this.dbContext.AddAchievementUnlockToAnswer(eventInstanceId, answerId, achievementId);

                    return Ok(new AnswerViewModel()
                    {
                        AnswerId = answer.AnswerId,
                        AnswerResponse = answer.AnswerResponse,
                        AnswerText = answer.AnswerText,
                        IsCorrectAnswer = answer.IsCorrectAnswer,
                        TeamId = answer.AppliesToTeam,
                        UnlockedClues = this.dbContext.GetToCsUnlockedByAnswer(answer.AnswerId),
                        UnlockedAchievements = this.dbContext.GetAchievementsUnlockedByAnswer(answer.AnswerId).Select(p => new AchievementViewModel(p)).ToList()
                    });
                }
                else
                {
                    return NotFound();
                }
            }

            return Forbid();
        }

        [HttpDelete("{eventInstanceId}/answers/{answerId}/achievements/{achievementId}")]
        public IActionResult DeleteAchievementUnlock(Guid eventInstanceId, Guid answerId, Guid achievementId)
        {
            if (this.dbContext.isUserStaffForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                var answer = this.dbContext.Answer.FirstOrDefault(p => p.AnswerId == answerId);

                if (answer != null)
                {
                    // TODO: Do any validation on achievement Ids?
                    this.dbContext.DeleteAchievementUnlockFromAnswer(eventInstanceId, answerId, achievementId);

                    return Ok(new AnswerViewModel()
                    {
                        AnswerId = answer.AnswerId,
                        AnswerResponse = answer.AnswerResponse,
                        AnswerText = answer.AnswerText,
                        IsCorrectAnswer = answer.IsCorrectAnswer,
                        TeamId = answer.AppliesToTeam,
                        UnlockedClues = this.dbContext.GetToCsUnlockedByAnswer(answer.AnswerId),
                        UnlockedAchievements = this.dbContext.GetAchievementsUnlockedByAnswer(answer.AnswerId).Select(p => new AchievementViewModel(p)).ToList()
                    });
                }
                else
                {
                    return NotFound();
                }

            }

            return Forbid();
        }
        #endregion

        #region Instances
        // Instances are for puzzles that have limited physical resources, and represent an available or occupied resource.
        // For example, if a puzzle requires an actor interaction in order to proceed and instance represents the staff
        // resources for a single run of the puzzle.
        [HttpPut("{eventInstanceId}/toc/{tableOfContentId}/instances")]
        public IActionResult AddOrUpdateInstance(Guid eventInstanceId, Guid tableOfContentId, [FromBody] PuzzleInstanceTemplate instance)
        {
            if (this.dbContext.isUserStaffForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                var toc = this.dbContext.TableOfContentsEntry.FirstOrDefault(p => p.TableOfContentId == tableOfContentId);

                if (toc != null)
                {
                    if (!instance.Id.HasValue)
                    {
                        // If there is no Id, we are adding a new instance.
                        var newInstance = new ToCInstance()
                        {
                            ToCInstanceId = Guid.NewGuid(),
                            FriendlyName = instance.FriendlyName,
                            TableOfContentsEntry = tableOfContentId,
                            CurrentTeam = instance.CurrentTeam,
                            Notes = instance.Notes,
                            NeedsReset = instance.NeedsReset.HasValue && instance.NeedsReset.Value,
                            LastUpdated = DateTime.UtcNow
                        };

                        this.dbContext.ToCInstance.Add(newInstance);
                        this.dbContext.SaveChanges();
                        return Details(eventInstanceId, tableOfContentId);
                    }
                    else
                    {
                        // Update
                        var existingInstance = this.dbContext.ToCInstance.FirstOrDefault(p => p.ToCInstanceId == instance.Id.Value);
                        if (existingInstance != null)
                        {
                            existingInstance.FriendlyName = instance.FriendlyName;
                            existingInstance.Notes = instance.Notes;
                            existingInstance.LastUpdated = DateTime.UtcNow;
                            existingInstance.CurrentTeam = instance.CurrentTeam;
                            existingInstance.NeedsReset = instance.NeedsReset.HasValue && instance.NeedsReset.Value;

                            this.dbContext.ToCInstance.Update(existingInstance);
                            this.dbContext.SaveChanges();
                            return Details(eventInstanceId, tableOfContentId);
                        }
                        else
                        {
                            return NotFound();
                        }
                    }
                }

                return NotFound();
            }

            return Forbid();
        }

        [HttpDelete("{eventInstanceId}/toc/{tableOfContentId}/instances/{instanceId}")]
        public IActionResult DeleteInstance(Guid eventInstanceId, Guid tableOfContentId, Guid instanceId)
        {
            if (this.dbContext.isUserStaffForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                var puzzleInstance = this.dbContext.ToCInstance.FirstOrDefault(p => p.ToCInstanceId == instanceId);

                if (puzzleInstance != null)
                {
                    this.dbContext.ToCInstance.Remove(puzzleInstance);
                    this.dbContext.SaveChanges();
                    return Details(eventInstanceId, tableOfContentId);
                }
                else
                {
                    return NotFound();
                }
            }

            return Forbid();
        }
        #endregion

        [HttpDelete("{eventInstanceId}/toc/{tableOfContentId}/content/{contentId}")]
        public IActionResult DeleteContent(Guid eventInstanceId, Guid tableOfContentId, Guid contentId)
        {
            if (this.dbContext.isUserStaffForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                var toc = this.dbContext.TableOfContentsEntry.FirstOrDefault(p => p.TableOfContentId == tableOfContentId);

                if (toc != null)
                {
                    var content = this.dbContext.AdditionalContent.FirstOrDefault(p => p.ContentId == contentId);
                    var contentLink = this.dbContext.ToCContent.FirstOrDefault(p => p.TableOfContentsEntry == tableOfContentId && p.AdditionalContent == contentId);

                    var location = this.dbContext.Location.FirstOrDefault(p => p.LocationId == contentId);
                    var locationLink = this.dbContext.ToCContent.FirstOrDefault(p => p.TableOfContentsEntry == tableOfContentId && p.Location == contentId);

                    if (content != null && contentLink != null)
                    {
                        this.dbContext.ToCContent.Remove(contentLink);
                        this.dbContext.SaveChanges();
                        this.dbContext.AdditionalContent.Remove(content);
                        this.dbContext.SaveChanges();

                        return Details(eventInstanceId, tableOfContentId);
                    }
                    else if (location != null && locationLink != null)
                    {
                        this.dbContext.ToCContent.Remove(locationLink);
                        this.dbContext.SaveChanges();
                        this.dbContext.Location.Remove(location);
                        this.dbContext.SaveChanges();

                        return Details(eventInstanceId, tableOfContentId);
                    }

                    // Otherwise we'll bottom out to NotFound
                }

                return NotFound();
            }

            return Forbid();
        }

        [HttpDelete("{eventInstanceId}/toc/{tableOfContentsId}/answers/{answerId}/content")]
        public IActionResult DeleteAnswerContent(Guid eventInstanceId, Guid tableOfContentsId, Guid answerId)
        {
            if (this.dbContext.isUserStaffForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                var answer = this.dbContext.Answer.FirstOrDefault(p => p.AnswerId == answerId);
                if (answer != null)
                {
                    answer.AdditionalContent = null;
                    this.dbContext.Answer.Update(answer);
                    this.dbContext.SaveChanges();
                    return this.Details(eventInstanceId, tableOfContentsId);
                }

                return NotFound();
            }

            return Forbid();
        }

        [Consumes("multipart/form-data")]
        [HttpPost("{eventInstanceId}/toc/{tableOfContentsId}/answers/{answerId}/content")]
        public async Task<IActionResult> AddContentToAnswer(Guid eventInstanceId, Guid tableOfContentsId, Guid answerId, [FromForm] NewTextContentTemplate content)
        {
            if (this.dbContext.isUserStaffForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                var answer = this.dbContext.Answer.FirstOrDefault(p => p.AnswerId == answerId);            
                if (answer != null)
                {
                    if (!content.ContentId.HasValue)
                    {
                        try
                        {
                            var newContent = await ContentUtil.AddContent(this.dbContext, this.puzzleMediaHandler, content);

                            if (newContent != null)
                            {
                                answer.AdditionalContent = newContent.ContentId;
                                this.dbContext.Answer.Update(answer);
                                this.dbContext.SaveChanges();
                                return this.Details(eventInstanceId, tableOfContentsId);
                            }
                            else
                            {
                                return BadRequest("Invalid content template");
                            }
                        } catch (InvalidOperationException)
                        {
                            return BadRequest("Media not supported");
                        }
                    }
                    else
                    {
                        return BadRequest("Answer content cannot currently be updated.");
                    }
                }

               return NotFound();
            }

            return Forbid();
        }

        [Consumes("multipart/form-data")]
        [HttpPost("{eventInstanceId}/toc/{tableOfContentId}/content")]
        public async Task<IActionResult> AddContent(Guid eventInstanceId, Guid tableOfContentId, [FromForm] NewTextContentTemplate content)
        {
            if (this.dbContext.isUserStaffForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                if (!content.ContentId.HasValue)
                {
                    try
                    {
                        var newContent = await ContentUtil.AddContent(this.dbContext, this.puzzleMediaHandler, content);

                        if (newContent != null)
                        {
                            this.dbContext.ToCContent.Add(new ToCContent()
                            {
                                Id = Guid.NewGuid(),
                                LastUpdated = DateTime.UtcNow,
                                AdditionalContent = newContent.ContentId,
                                TableOfContentsEntry = tableOfContentId
                            });
                            this.dbContext.SaveChanges();

                            return Details(eventInstanceId, tableOfContentId);
                        }
                        else
                        {
                            return BadRequest("Invalid content template");
                        }
                    } catch (InvalidOperationException)
                    {
                        return BadRequest("Media not supported");
                    }
                }
                else
                {
                    Content existingContent = this.dbContext.AdditionalContent.FirstOrDefault(p => p.ContentId == content.ContentId.Value);

                    if (existingContent != null && existingContent.ContentType.Trim() == content.ContentType.Trim())
                    {
                        if (existingContent.ContentType.Trim() == "PlainText" ||
                            existingContent.ContentType.Trim() == "RichText" ||
                            existingContent.ContentType.Trim() == "YoutubeUrl" ||
                            existingContent.ContentType.Trim() == "Hyperlink")
                        {
                            existingContent.ContentText = content.StringContent;
                            existingContent.LastUpdate = DateTime.UtcNow;
                            this.dbContext.AdditionalContent.Update(existingContent);
                            this.dbContext.SaveChanges();
                            return Details(eventInstanceId, tableOfContentId);
                        }

                        return BadRequest("Content type not supported for update.");
                    }
                    else
                    {
                        return NotFound();
                    }
                }
            }
            else
            {
                return Forbid();
            }
        }

        [HttpPut("{eventInstanceId}/toc/{tableOfContentId}/locations")]
        public IActionResult AddLocation(Guid eventInstanceId, Guid tableOfContentId, [FromBody] LocationTemplate location)
        {
            if (this.dbContext.isUserStaffForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                if (!location.LocationId.HasValue)
                {
                    Location newLocation = new Location()
                    {
                        LocationId = Guid.NewGuid(),
                        Address = location.Address,
                        LastUpdate = DateTime.UtcNow,
                        Latitude = location.Latitude,
                        Longitude = location.Longitude,
                        Name = location.Name,
                        LocationFlag = location.LocationFlags
                    };

                    this.dbContext.Location.Add(newLocation);
                    this.dbContext.SaveChanges();

                    this.dbContext.ToCContent.Add(new ToCContent()
                    {
                        Id = Guid.NewGuid(),
                        AdditionalContent = null,
                        LastUpdated = DateTime.UtcNow,
                        Location = newLocation.LocationId,
                        TableOfContentsEntry = tableOfContentId
                    });
                    this.dbContext.SaveChanges();

                    return Details(eventInstanceId, tableOfContentId);
                }
                else
                {
                    var existingLocation = this.dbContext.Location.FirstOrDefault(p => p.LocationId == location.LocationId);

                    if (existingLocation != null)
                    {
                        existingLocation.Address = location.Address;
                        existingLocation.LastUpdate = DateTime.UtcNow;
                        existingLocation.Latitude = location.Latitude;
                        existingLocation.Longitude = location.Longitude;
                        existingLocation.Name = location.Name;
                        existingLocation.LocationFlag = location.LocationFlags;

                        this.dbContext.Location.Update(existingLocation);
                        this.dbContext.SaveChanges();
                        return Details(eventInstanceId, tableOfContentId);
                    }
                }

                return NotFound();
            }
            else
            {
                return Forbid();
            }
        }

        [HttpPut("{eventInstanceId}/teams/{teamId}/tocs/{tableOfContentsId}")]
        public IActionResult UnlockToCForTeam(Guid eventInstanceId, Guid teamId, Guid tableOfContentsId, string unlockReason)
        {
            if (unlockReason != "GcUnlock" && unlockReason != "Skip")
            {
                return BadRequest();
            }

            if (this.dbContext.isUserStaffForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                var existingAccess = this.dbContext.TeamToCAccess.FirstOrDefault(p => p.TableOfContentsEntry == tableOfContentsId && p.Team == teamId);

                if (existingAccess == null)
                {
                    // Assign team to an instance before granting them access, if needed.
                    var freeInstance = this.dbContext.ToCInstance.OrderBy(i => i.LastUpdated).Where(p => p.TableOfContentsEntry == tableOfContentsId && !p.NeedsReset && p.CurrentTeam == null).FirstOrDefault();

                    if (freeInstance != null) 
                    {
                        freeInstance.CurrentTeam = teamId;
                        freeInstance.LastUpdated = DateTime.UtcNow;
                        this.dbContext.ToCInstance.Update(freeInstance);
                        this.hubContext.Clients.Group("ADMIN_"+eventInstanceId.ToString()).SendAsync("admin_instance",tableOfContentsId);
                    }

                    TeamToCAccess newAccess = new TeamToCAccess()
                    {
                        TableOfContentsEntry = tableOfContentsId,
                        Team = teamId,
                        UnlockReason = unlockReason,
                        UnlockTime = DateTime.UtcNow
                    };

                    this.dbContext.TeamToCAccess.Add(newAccess);
                    this.dbContext.SaveChanges();

                    this.hubContext.Clients.Group(teamId.ToString()).SendAsync("toc",teamId.ToString());
                    this.cache.Remove("Grid_" + eventInstanceId.ToString());

                    if (this.puzzleEventHandler != null)
                    {
                        List<Guid> unlockedClues = new List<Guid>();
                        unlockedClues.Add(tableOfContentsId);
                        this.puzzleEventHandler.HandleUnlockedPuzzlesChanged(eventInstanceId, teamId, unlockedClues, null);
                    }

                    return AllPuzzles(eventInstanceId);
                }
                else
                {
                    return BadRequest();
                }
            }
            else
            {
                return Forbid();
            }
        }

        [HttpDelete("{eventInstanceId}/teams/{teamId}/tocs/{tableOfContentId}")]
        public IActionResult RemoveToCUnlockForTeam(Guid eventInstanceId, Guid teamId, Guid tableOfContentId)
        {
            if (this.dbContext.isUserStaffForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                var existingAccess = this.dbContext.TeamToCAccess.FirstOrDefault(p => p.TableOfContentsEntry == tableOfContentId && p.Team == teamId);

                if (existingAccess != null)
                {
                    this.dbContext.TeamToCAccess.Remove(existingAccess);
                    this.dbContext.SaveChanges();
                    
                    this.hubContext.Clients.Group(teamId.ToString()).SendAsync("toc",teamId.ToString());
                    this.puzzleEventHandler.HandleUnlockedPuzzlesChanged(eventInstanceId, teamId, null, new[] {tableOfContentId});

                    this.cache.Remove("Grid_" + eventInstanceId.ToString());

                    return AllPuzzles(eventInstanceId);
                }
                else
                {
                    return NotFound();
                }
            }

            return Forbid();
        }
    }
}
