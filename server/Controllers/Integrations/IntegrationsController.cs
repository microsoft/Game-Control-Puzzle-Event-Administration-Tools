using GameControl.Server.Controllers.Player;
using GameControl.Server.Database;
using GameControl.Server.Database.Tables;
using GameControl.Server.RequestTypes;
using GameControl.Server.RequestTypes.Admin;
using GameControl.Server.ViewModel;
using GameControl.Server.ViewModel.Player;
using GameControl.Server.ViewModel.Staff;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

namespace GameControl.Server.Controllers.Integrations
{
    [Route("api/[controller]")]
    public class IntegrationsController : Controller
    {
        private readonly GameControlContext dbContext;
        private readonly PlayerPuzzlesController puzzlesController;
        private readonly StaffTeamsController teamsController;

        public IntegrationsController(GameControlContext dbContext, PlayerPuzzlesController puzzlesController, StaffTeamsController teamsController)
        {
            this.dbContext = dbContext;
            this.puzzlesController = puzzlesController;
            this.teamsController = teamsController;
        }

        [HttpGet("submitAnswer/{teamId}/{tableOfContentsId}")]
        public IActionResult SubmitAnswerForTeam(Guid teamId, Guid tableOfContentsId, string answer, string apiKey)
        {
            var toc = this.dbContext.TableOfContentsEntry.FirstOrDefault(p => p.TableOfContentId == tableOfContentsId);
            if (toc != null && this.dbContext.isApiKeyValid(toc.EventInstance, apiKey))
            {
                if (!String.IsNullOrEmpty(answer))
                {
                    var submission = this.puzzlesController.HandleAnswerSubmission(toc, teamId, null, answer);
                    if (submission != null)
                    {
                        return Ok(new { result = true, isCorrect = submission.IsCorrectAnswer, response = submission.AnswerResponse });
                    }
                }
            }
            return BadRequest();
        }

        [HttpGet("grantPointsForTeam/{teamId}")]
        public IActionResult GrantPointsForTeam(Guid teamId, long? points, string reason, string apiKey)
        {
            var team = this.dbContext.Team.FirstOrDefault(p => p.TeamId == teamId);

            if (team != null && this.dbContext.isApiKeyValid(team.EventInstance, apiKey))
            {
                if (points.HasValue && this.teamsController.GrantPointsForTeam(team.EventInstance, team.TeamId, points.Value, reason ?? "", null))
                {
                    this.dbContext.Entry(team).Reload();
                    return Ok(new { result = true, points = team.Points });
                }
            }

            return BadRequest();
        }

        /*  [HttpGet("state/{eventInstanceId}/all")]
          public IActionResult EventState(Guid eventInstanceId, string apiKey)
          {
              if (this.dbContext.isApiKeyValid(eventInstanceId, apiKey))
              {
                  var allClues = this.dbContext.GetCluesForStaff(eventInstanceId).Select(p => new StaffClueViewModel(p, eventInstanceId)).ToList();
                  var teamsList = this.dbContext.Team.AsNoTracking().Where(p => p.EventInstance == eventInstanceId).ToList();
                  var gridData = this.dbContext.GetDataForTheGrid(eventInstanceId);
                  var cluesData = new Dictionary<Guid, SolveDataViewModel>();

                  foreach (var clue in allClues)
                  {
                      cluesData.Add(clue.TableOfContentId, GetClueStateData(clue.TableOfContentId, eventInstanceId, allClues, teamsList, gridData));
                  }

                  var teamsData = new Dictionary<Guid, object>();
                  foreach (var team in teamsList)
                  {
                      teamsData.Add(team.TeamId, GetTeamStateData(team));
                  }

                  return Ok(new
                  {
                      clues = cluesData,
                      teams = teamsData,
                  });
              }

              return Forbid();
          }*/

        [HttpGet("state/{eventInstanceId}/clues")]
        public IActionResult GetCluesState(Guid eventInstanceId, string apiKey)
        {
            if (this.dbContext.isApiKeyValid(eventInstanceId, apiKey))
            {
                var allClues = this.dbContext.GetCluesForStaff(eventInstanceId).Select(p => new StaffClueViewModel(p, eventInstanceId)).ToList();
                var teamsList = this.dbContext.Team.AsNoTracking().Where(p => p.EventInstance == eventInstanceId).ToList();
                var gridData = this.dbContext.GetDataForTheGrid(eventInstanceId);

                var cluesState = allClues.ToDictionary(t => t.TableOfContentId, t => GetClueStateData(t.TableOfContentId, eventInstanceId, allClues, teamsList, gridData));

                return Ok(cluesState);
            }
            return BadRequest();
        }


        [HttpGet("state/{eventInstanceId}/teams")]
        public IActionResult GetTeamsState(Guid eventInstanceId, string apiKey)
        {
            if (this.dbContext.isApiKeyValid(eventInstanceId, apiKey))
            {
                var allClues = this.dbContext.GetCluesForStaff(eventInstanceId).Select(p => new StaffClueViewModel(p, eventInstanceId)).ToList();
                var gridData = this.dbContext.GetDataForTheGrid(eventInstanceId);

                var teams = this.dbContext.Team.Where(t => t.EventInstance == eventInstanceId);
                var results = teams.ToDictionary(t => t.TeamId, t => GetTeamStateData(t, allClues, gridData));
                
                return Ok(results);
            }
            return BadRequest();
        }

        [HttpGet("state/team/{teamId}")]
        public IActionResult GetTeamState(Guid teamId, string apiKey)
        {
            var team = this.dbContext.Team.FirstOrDefault(p => p.TeamId == teamId);

            if (team != null && this.dbContext.isApiKeyValid(team.EventInstance, apiKey))
            {
                return Ok(GetTeamStateData(team));
            }
            return BadRequest();
        }

        [HttpGet("[action]")]
        public IActionResult Unlocked(Guid teamId, string apiKey)
        {
            var team = this.dbContext.Team.FirstOrDefault(p => p.TeamId == teamId);
            if (team != null && this.dbContext.isApiKeyValid(team.EventInstance, apiKey))
            {
                var tocEntries = this.dbContext.GetCluesForTeamFast(team.EventInstance, teamId);
                var tocViewModels = tocEntries.Select((p) =>
                {
                    PlayerClueViewModel vm = new PlayerClueViewModel(p, Guid.Empty);

                    var submittable = this.dbContext.Submittable.First(p => p.SubmittableId == vm.SubmittableId);
                    vm.Submissions = this.dbContext.GetValidSubmissions(vm.TableOfContentId)
                        .Where(p => p.SubmittableId == vm.SubmittableId && p.TeamId == teamId)
                        .OrderByDescending(p => p.SubmissionTime)
                        .Select(p => new SubmissionViewModel(p))
                        .ToList();

                    vm.IsSolved = vm.Submissions.Any(s => s.IsCorrectAnswer);

                    return vm;
                });

                var apiResult = tocViewModels.Where(vm => !vm.IsSolved).Select(vm => new { Title = vm.SubmittableTitle, Id = vm.TableOfContentId });

                return Ok(apiResult);
            }
            return BadRequest();
        }

        [HttpGet("[action]")]
        public IActionResult Solved(Guid teamId, string apiKey)
        {
            var team = this.dbContext.Team.FirstOrDefault(p => p.TeamId == teamId);
            if (team != null && this.dbContext.isApiKeyValid(team.EventInstance, apiKey))
            {
                var tocEntries = this.dbContext.GetCluesForTeamFast(team.EventInstance, teamId);
                var tocViewModels = tocEntries.Select((p) =>
                {
                    PlayerClueViewModel vm = new PlayerClueViewModel(p, Guid.Empty);

                    var submittable = this.dbContext.Submittable.First(p => p.SubmittableId == vm.SubmittableId);
                    vm.Submissions = this.dbContext.GetValidSubmissions(vm.TableOfContentId)
                        .Where(p => p.SubmittableId == vm.SubmittableId && p.TeamId == teamId)
                        .OrderByDescending(p => p.SubmissionTime)
                        .Select(p => new SubmissionViewModel(p))
                        .ToList();

                    vm.IsSolved = vm.Submissions.Any(s => s.IsCorrectAnswer);

                    return vm;
                });

                var apiResult = tocViewModels.Where(vm => vm.IsSolved).Select(vm => new { Title = vm.SubmittableTitle, Id = vm.TableOfContentId });

                return Ok(apiResult);
            }
            return BadRequest();
        }

        [HttpGet("[action]")]
        public IActionResult Challenges(Guid teamId, string apiKey)
        {
            var team = this.dbContext.Team.FirstOrDefault(p => p.TeamId == teamId);
            if (team != null && this.dbContext.isApiKeyValid(team.EventInstance, apiKey))
            {
                var challenges = this.dbContext.Challenge
                    .Where(p => p.EventInstance == team.EventInstance && (team.IsTestTeam || p.StartTime == null || p.StartTime < DateTime.UtcNow))
                    .OrderByDescending(p => p.LastUpdated)
                    .Select(p => new PlayerChallengeViewModel(p)).ToList();

                foreach (var challenge in challenges)
                {
                    challenge.Submissions = this.dbContext.GetChallengeSubmissionsForTeam(challenge.ChallengeId, teamId)
                        .Select(p => new PlayerChallengeSubmissionViewModel(p));
                }

                var completedChallenges = challenges.Where(c => c.Submissions.Where(s => s.State == 1).Any());

                var shapedData = completedChallenges.Select(c => new { Title = c.Title, Id = c.ChallengeId });
                return Ok(shapedData);
            }
            return BadRequest();
        }

        [HttpPut("syncTeam/{eventInstanceId}")]
        public IActionResult SynchronizeTeam(Guid eventInstanceId, string apiKey, [FromBody] NewTeamTemplate newTeam)
        {
            if (this.dbContext.isApiKeyValid(eventInstanceId, apiKey))
            {
                return this.teamsController.CreateOrUpdateTeamInternal(eventInstanceId, newTeam);
            }

            return Forbid();
        }

        [HttpPut("syncRoster/{eventInstanceId}/team/{teamId}")]
        public IActionResult SynchronizeRoster(Guid eventInstanceId, Guid teamId, string apiKey, [FromBody] PregameUserTemplate[] pregameUsers)
        {
            if (this.dbContext.isApiKeyValid(eventInstanceId, apiKey))
            {
                var team = this.dbContext.Team.FirstOrDefault(p => p.TeamId == teamId && p.EventInstance == eventInstanceId);

                if (team != null)
                {
                    foreach (var pregameUser in pregameUsers)
                    {
                        var existingUser = this.dbContext.Participant.AsEnumerable().FirstOrDefault(p =>
                            string.Format("{0} {1}", p.FirstName, p.LastName).Equals(pregameUser.FirstName, StringComparison.OrdinalIgnoreCase) ||
                            p.FirstName.Equals(pregameUser.FirstName, StringComparison.OrdinalIgnoreCase));

                        if (existingUser == null)
                        {
                            Participant newUser = new Participant
                            {
                                ParticipantId = Guid.NewGuid(),
                                FirstName = pregameUser.FirstName,
                                Email = pregameUser.Email,
                                ContactNumber = pregameUser.ContactNumber,
                                LastChanged = DateTime.UtcNow
                            };

                            this.dbContext.Participant.Add(newUser);
                            this.dbContext.SaveChanges();

                            ParticipantLoginMsa userLogin = new ParticipantLoginMsa
                            {
                                MicrosoftId = pregameUser.Oid,
                                Participant = newUser.ParticipantId,
                                PrincipalName = newUser.Email
                            };

                            Participation newParticipation = new Participation
                            {
                                ParticipationId = Guid.NewGuid(),
                                EventInstance = eventInstanceId,
                                Team = teamId,
                                LastUpdated = DateTime.UtcNow,
                                Participant = newUser.ParticipantId
                            };

                            // Add to database
                            this.dbContext.ParticipantLoginMsa.Add(userLogin);
                            this.dbContext.Participation.Add(newParticipation);
                            this.dbContext.SaveChanges();
                        }
                        else
                        {
                            existingUser.FirstName = pregameUser.FirstName;
                            existingUser.Email = pregameUser.Email;
                            existingUser.ContactNumber = pregameUser.ContactNumber;
                            existingUser.LastChanged = DateTime.UtcNow;
                            this.dbContext.Participant.Update(existingUser);
                            this.dbContext.SaveChanges();

                            // Create MSA login if needed
                            var existingMsa = this.dbContext.ParticipantLoginMsa.FirstOrDefault(p => p.Participant == existingUser.ParticipantId);
                            if (existingMsa == null)
                            {
                                ParticipantLoginMsa userLogin = new ParticipantLoginMsa
                                {
                                    MicrosoftId = pregameUser.Oid,
                                    Participant = existingUser.ParticipantId,
                                    PrincipalName = existingUser.Email
                                };

                                this.dbContext.ParticipantLoginMsa.Add(userLogin);
                                this.dbContext.SaveChanges();
                            }

                            // Check whether the user is already on a team. If not, add them; 
                            // if they've changed teams, update their team membership.
                            Participation existingParticipation = this.dbContext.Participation.FirstOrDefault(p => p.Participant == existingUser.ParticipantId && p.Team == teamId);

                            if (existingParticipation == null)
                            {
                                Participation newParticipation = new Participation
                                {
                                    ParticipationId = Guid.NewGuid(),
                                    EventInstance = eventInstanceId,
                                    Team = teamId,
                                    LastUpdated = DateTime.UtcNow,
                                    Participant = existingUser.ParticipantId
                                };

                                // Save to the database.
                                this.dbContext.Participation.Add(newParticipation);
                                this.dbContext.SaveChanges();
                            }
                            else
                            {
                                if (existingParticipation.Team.HasValue && existingParticipation.Team.Value != teamId)
                                {
                                    // User has changed teams.
                                    existingParticipation.Team = teamId;
                                    existingParticipation.LastUpdated = DateTime.UtcNow;
                                    this.dbContext.Participation.Update(existingParticipation);
                                    this.dbContext.SaveChanges();
                                }
                            }
                        }
                    }

                    return Ok();
                }

                return NotFound();
            }

            return Forbid();
        }

        private object GetClueStateData(Guid clueId, Guid eventInstanceId)
        {
            var allClues = this.dbContext.GetCluesForStaff(eventInstanceId).Select(p => new StaffClueViewModel(p, eventInstanceId)).ToList();
            var teamsList = this.dbContext.Team.AsNoTracking().Where(p => p.EventInstance == eventInstanceId).ToList();
            var gridData = this.dbContext.GetDataForTheGrid(eventInstanceId);

            return GetClueStateData(clueId, eventInstanceId, allClues, teamsList, gridData);
        }

        private object GetClueStateData(Guid clueId, Guid eventInstanceId, IList<StaffClueViewModel> allClues, IList<Database.Tables.Team> teamsList, IEnumerable<Database.SprocTypes.GridData> gridData)
        {
            var clue = allClues.Where(c => c.TableOfContentId == clueId).FirstOrDefault();
            if (clue == null) { return null; }

            var teamsStatus = clue.TeamsStatus as List<SolveDataViewModel>;

            foreach (var team in teamsList)
            {
                var teamProgress = gridData.FirstOrDefault(p => p.TeamId == team.TeamId && p.SubmittableId == clue.SubmittableId);

                if (teamProgress != null)
                {
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

            var teams = teamsStatus.ToDictionary(t => t.TeamId, t => new
            {
                isSkipped = t.IsSkipped,
                isUnlocked = !t.IsSkipped && t.SolveTime == null && t.StartTime != null,
                isSolved = t.SolveTime != null,
                solveTime = t.SolveTime,
                startTime = t.StartTime,
                teamName = t.TeamName
            });
            return new { title = clue.SubmittableTitle, type = clue.SubmittableType, sortOrder = clue.SortOrder, teams };
        }

        private object GetTeamStateData(Database.Tables.Team team)
        {
            var allClues = this.dbContext.GetCluesForStaff(team.EventInstance).Select(p => new StaffClueViewModel(p, team.EventInstance)).ToList();
            var gridData = this.dbContext.GetDataForTheGrid(team.EventInstance);
            return GetTeamStateData(team, allClues, gridData);
        }

        private object GetTeamStateData(Database.Tables.Team team, List<StaffClueViewModel> allClues, IEnumerable<Database.SprocTypes.GridData> gridData)
        {
            var gridDataForTeam = gridData.Where(data => data.TeamId == team.TeamId);

            var mergedData = from clue in allClues
                             join data in gridDataForTeam
                             on clue.SubmittableId equals data.SubmittableId
                             into ClueDataGroup
                             from data in ClueDataGroup.DefaultIfEmpty()
                             select new { clue, data };

            var clues = mergedData.ToDictionary(g => g.clue.TableOfContentId, g =>
            {
                var isSkipped = g.data != null && g.data.UnlockReason.Trim().Equals("Skip", StringComparison.OrdinalIgnoreCase);
                var isUnlocked = !isSkipped && g.data != null && g.data.SubmissionTime == null && g.data.UnlockTime != null;
                var isSolved = g.data != null && g.data.SubmissionTime != null;

                return new
                {
                    title = (isUnlocked || isSolved) ? g.clue.SubmittableTitle : null,
                    isSkipped,
                    isUnlocked,
                    isSolved,
                    solveTime = g.data != null ? g.data.SubmissionTime : null,
                    startTime = g.data != null ? (DateTime?)g.data.UnlockTime : null,
                    sortOrder = g.clue.SortOrder,
                };
            });

            var challenges = this.dbContext.Challenge.AsNoTracking()
                       .Where(p => p.EventInstance == team.EventInstance && (team.IsTestTeam || p.StartTime == null || p.StartTime < DateTime.UtcNow))
                       .OrderByDescending(p => p.LastUpdated)
                       .Select(p => new PlayerChallengeViewModel(p)).ToList();
            var completedChallenges = new List<Guid>();

            foreach (var challenge in challenges)
            {
                var completed = this.dbContext.GetChallengeSubmissionsForTeam(challenge.ChallengeId, team.TeamId)
                    .Where(p => p.State == 1)
                    .Select(p => challenge.ChallengeId)
                    .ToList();
                completedChallenges.AddRange(completed);
            }

            return new
            {
                name = team.Name,
                shortName = team.ShortName,
                color = team.Color,
                points = team.Points,
                clues,
                completedChallenges
            };

        }
    }
}
