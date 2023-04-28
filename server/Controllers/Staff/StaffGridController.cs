using GameControl.Server.Database;
using GameControl.Server.ViewModel.Staff;
using LazyCache;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

namespace GameControl.Server.Controllers.Staff
{
    [Authorize]
    [Route("api/staff/grid")]
    public class StaffGridController : ControllerBase
    {
        private readonly GameControlContext dbContext;

        private readonly IAppCache cache;

        public StaffGridController(GameControlContext dbContext, IAppCache cache)
        {
            this.dbContext = dbContext;
            this.cache = cache;
        }

        [HttpGet("{eventInstanceId}")]
        public IActionResult Grid(Guid eventInstanceId)
        {
            if (this.dbContext.isUserStaffForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                var cachedModel = cache.GetOrAdd("Grid_" + eventInstanceId.ToString(), cacheEntry =>
                {
                    cacheEntry.AbsoluteExpiration = DateTimeOffset.Now.AddSeconds(3);

                    GridViewModel model = new GridViewModel();
                    model.CompletedClues = new List<Guid>();

                    #region Fetch Team Info
                    var calls = this.dbContext.GetCallsForEventInstance(eventInstanceId);
                    var teams = this.dbContext.Team
                        .AsNoTracking()
                        .Where(p => p.EventInstance == eventInstanceId)
                        .OrderBy(p => p.IsTestTeam)
                        .ThenBy(p => p.Name)
                        .Select(p => new StaffTeamGridViewModel()
                        {
                            TeamId = p.TeamId,
                            Name = p.Name,
                            Color = p.Color,
                            IsTestTeam = p.IsTestTeam,
                            GcNotes = p.GcNotes,
                            teamGridData = new List<GridCellViewModel>(),
                        }).ToList();
                    
                    foreach (var team in teams)
                    {
                        team.CallHistory = calls.Where(call => call.Team == team.TeamId).Select(call => new CallViewModel(call));
                    }

                    model.Teams = teams;
                    #endregion

                    model.Clues = this.dbContext.GetCluesForStaff(eventInstanceId).Select(p => new StaffClueViewModel(p, eventInstanceId)).ToList();
                    var clueInstances = this.dbContext.GetClueInstancesForEvent(eventInstanceId).ToList();

                    DateTime? predictedEnd = null;
                    Dictionary<Guid /*TeamId*/, Dictionary<Guid /*ClueId*/, GridCellViewModel>> theGrid = GetTeamPredictGrid(eventInstanceId, teams, out predictedEnd);
                    model.LatestEndTime = predictedEnd;

                    foreach (var team in model.Teams)
                    {
                        var gridDataForTeam = new List<GridCellViewModel>();

                        foreach (var clue in model.Clues)
                        {
                            if (!theGrid.ContainsKey(team.TeamId))
                            {
                                theGrid.Add(team.TeamId, new Dictionary<Guid, GridCellViewModel>());
                            }

                            if (theGrid[team.TeamId].ContainsKey(clue.SubmittableId))
                            {
                                theGrid[team.TeamId][clue.SubmittableId].TeamId = team.TeamId;
                                theGrid[team.TeamId][clue.SubmittableId].ClueId = clue.SubmittableId;
                                theGrid[team.TeamId][clue.SubmittableId].TableOfContentId = clue.TableOfContentId;
                                gridDataForTeam.Add(theGrid[team.TeamId][clue.SubmittableId]);
                            }
                            else
                            {
                                gridDataForTeam.Add(new GridCellViewModel()
                                {
                                    TeamId = team.TeamId,
                                    ClueId = clue.SubmittableId,
                                    TableOfContentId = clue.TableOfContentId
                                });
                            }
                        }

                        team.teamGridData = gridDataForTeam;
                    }

                    foreach (var clue in model.Clues)
                    {
                        List<Guid> completedTeamIds = new List<Guid>();
                        TimeSpan runningSolveTime = new TimeSpan();
                        int numTeams = 0;
                        int testCount = 0;

                        clue.Instances = clueInstances.Where(p => p.TableOfContentsEntry == clue.TableOfContentId).Select(p => new PuzzleInstanceViewModel(p)).ToList();

                        foreach (var team in model.Teams)
                        {
                            if (theGrid.ContainsKey(team.TeamId) && theGrid[team.TeamId].ContainsKey(clue.SubmittableId) &&
                                (theGrid[team.TeamId][clue.SubmittableId].SolveTime.HasValue || theGrid[team.TeamId][clue.SubmittableId].IsSkipped))
                            {
                                if (!team.IsTestTeam)
                                {
                                    completedTeamIds.Add(team.TeamId);
                                }

                                if (theGrid[team.TeamId][clue.SubmittableId].SolveTime.HasValue && theGrid[team.TeamId][clue.SubmittableId].StartTime.HasValue)
                                {
                                    if (!team.IsTestTeam)
                                    {
                                        runningSolveTime += (theGrid[team.TeamId][clue.SubmittableId].SolveTime.Value - theGrid[team.TeamId][clue.SubmittableId].StartTime.Value);
                                    }
                                    else
                                    {
                                        testCount++;
                                    }

                                    numTeams++;
                                }
                            }
                        }

                        if (completedTeamIds.Count == model.Teams.Where(p => !p.IsTestTeam).Count())
                        {
                            model.CompletedClues.Add(clue.TableOfContentId);
                        }

                        if (numTeams - testCount > 0)
                        {
                            clue.AverageSolveTime = (int)(runningSolveTime.TotalMinutes / (numTeams - testCount));
                        }
                    }

                    return model;
                });


                return Ok(cachedModel);
            }
            else
            {
                return Forbid();
            }

        }

        [HttpGet("{eventInstanceId}/unlocks")]
        public IActionResult GetUnlockData(Guid eventInstanceId)
        {
            if (this.dbContext.isUserStaffForEvent(ParticipantIdFromClaim, eventInstanceId))
            {
                return Ok(GetFullUnlockMap(eventInstanceId));
            }

            return Forbid();
        }

        public Dictionary<Guid /*Teamid*/, Dictionary<Guid /*ClueId*/, GridCellViewModel>> GetTeamPredictGrid(Guid eventInstanceId, IEnumerable<StaffTeamGridViewModel> teams, out DateTime? LatestEndTime)
        {
            Dictionary<Guid /*Teamid*/, Dictionary<Guid /*ClueId*/, GridCellViewModel>> theGrid = new Dictionary<Guid, Dictionary<Guid, GridCellViewModel>>();
            Dictionary<Guid, List<Guid>> currentActivePuzzlesForTeam = new Dictionary<Guid, List<Guid>>();
            Dictionary<Guid, Tuple<double, int>> puzzleSolveTimes = new Dictionary<Guid, Tuple<double, int>>();
            var allAnswers = this.dbContext.Answer.AsNoTracking().ToList();
            var allPuzzles = this.dbContext.GetCluesForStaff(eventInstanceId).Select(p => new StaffClueViewModel(p, eventInstanceId)).ToList();
            LatestEndTime = null;

            #region Get solved and current solve data
            // Get data for the grid returns a list of puzzles and teams that are either in progress or solved.
            var currentTeamData = this.dbContext.GetDataForTheGrid(eventInstanceId).ToList();
            foreach (var teamData in currentTeamData)
            {
                #region Save puzzle solve times for current average solve
                // Maintain a local table of solve times so we can compute the current running average
                if (teamData.SubmissionTime.HasValue && (!teamData.IsTestTeam ?? false))
                {
                    if (!puzzleSolveTimes.ContainsKey(teamData.SubmittableId))
                    {
                        puzzleSolveTimes[teamData.SubmittableId] = new Tuple<double, int>((teamData.SubmissionTime.Value - teamData.UnlockTime).TotalMinutes, 1);
                    }
                    else
                    {
                        puzzleSolveTimes[teamData.SubmittableId] = new Tuple<double, int>(puzzleSolveTimes[teamData.SubmittableId].Item1 + (teamData.SubmissionTime.Value - teamData.UnlockTime).TotalMinutes, puzzleSolveTimes[teamData.SubmittableId].Item2 + 1);
                    }
                }
                #endregion

                if (!theGrid.ContainsKey(teamData.TeamId.Value))
                {
                    theGrid.Add(teamData.TeamId.Value, new Dictionary<Guid, GridCellViewModel>());
                }

                if (theGrid[teamData.TeamId.Value].ContainsKey(teamData.SubmittableId))
                {
                    theGrid[teamData.TeamId.Value].Remove(teamData.SubmittableId);
                }
   
                theGrid[teamData.TeamId.Value].Add(teamData.SubmittableId, new GridCellViewModel()
                {
                    ClueId = teamData.SubmittableId,
                    StartTime = teamData.UnlockTime,
                    SolveTime = teamData.SubmissionTime,
                    IsSkipped = teamData.UnlockReason.Trim().Equals("Skip", StringComparison.InvariantCultureIgnoreCase),
                    HasNoAnswer = allAnswers.Where(p => p.Submittable == teamData.SubmittableId).Count() == 0
                });

                if (!teamData.SubmissionTime.HasValue && !teamData.UnlockReason.Trim().Equals("Skip", StringComparison.InvariantCultureIgnoreCase))
                {
                    // Save any puzzles a team has unlocked that they are currently solving, we will iterate through these
                    // later to determine what puzzles they can unlock.
                    if (!currentActivePuzzlesForTeam.ContainsKey(teamData.TeamId.Value))
                    {
                        currentActivePuzzlesForTeam.Add(teamData.TeamId.Value, new List<Guid>());
                    }

                    currentActivePuzzlesForTeam[teamData.TeamId.Value].Add(teamData.SubmittableId);
                }
            }
            #endregion

            #region Determine team paths through the rest of the event.
            // Build full map of what unlocks what.
            var unlockMap = this.GetFullUnlockMap(eventInstanceId);

            while (currentActivePuzzlesForTeam.Count > 0)
            {
                Dictionary<Guid, List<Guid>> nextCluesOfInterest = new Dictionary<Guid, List<Guid>>();
                foreach (var team in teams)
                {
                    if (currentActivePuzzlesForTeam.ContainsKey(team.TeamId))
                    {
                        foreach (var activepuzzle in currentActivePuzzlesForTeam[team.TeamId])
                        {
                            GridCellViewModel activePuzzleGridCell = theGrid[team.TeamId][activepuzzle];
                            DateTime activePuzzleStartTime = activePuzzleGridCell.StartTime ?? activePuzzleGridCell.PredictedStart.Value; // if startTime is null, predictedStart should have a value.

                            #region Calculate Expected Solve Time

                            var puzzle = allPuzzles.FirstOrDefault(p => p.SubmittableId == activepuzzle);
                            TimeSpan expectedSolveTimeForActivePuzzle = puzzle != null && puzzle.ParSolveTime.HasValue ? TimeSpan.FromMinutes(puzzle.ParSolveTime.Value) : TimeSpan.FromMinutes(60);

                            if (puzzleSolveTimes.ContainsKey(activepuzzle))
                            {
                                expectedSolveTimeForActivePuzzle = TimeSpan.FromMinutes(puzzleSolveTimes[activepuzzle].Item1 / puzzleSolveTimes[activepuzzle].Item2);
                            }

                            #endregion

                            if (activePuzzleGridCell.StartTime.HasValue && !activePuzzleGridCell.PredictedEnd.HasValue)
                            {
                                // This probably would make sense earlier, but we should have the data here. If a puzzle
                                // is currently unlocked for a team and unsolved, we want to add a predicted solve time 
                                // based on the current average solve time.
                                activePuzzleGridCell.PredictedEnd = activePuzzleGridCell.StartTime + expectedSolveTimeForActivePuzzle;
                            }

                            if (unlockMap.ContainsKey(activepuzzle))
                            {
                                List<Guid> puzzleIdsUnlockedByCurrentPuzzle = null;

                                if (unlockMap[activepuzzle].ContainsKey(team.TeamId))
                                {
                                    // There's a team specific unlock, we'll use that over 'global' unlocks.
                                    puzzleIdsUnlockedByCurrentPuzzle = unlockMap[activepuzzle][team.TeamId];
                                }
                                else if (unlockMap[activepuzzle].ContainsKey(Guid.Empty))
                                {
                                    puzzleIdsUnlockedByCurrentPuzzle = unlockMap[activepuzzle][Guid.Empty];
                                }

                                if (puzzleIdsUnlockedByCurrentPuzzle != null)
                                {
                                    activePuzzleGridCell.UnlockedClues = puzzleIdsUnlockedByCurrentPuzzle;

                                    foreach (var unlockedPuzzle in puzzleIdsUnlockedByCurrentPuzzle)
                                    {
                                        if (!theGrid[team.TeamId].ContainsKey(unlockedPuzzle))
                                        {
                                            DateTime predictedStart = activePuzzleStartTime + expectedSolveTimeForActivePuzzle;
                                            if (predictedStart < DateTime.UtcNow)
                                            {
                                                predictedStart = DateTime.UtcNow;
                                            }

                                            // The team has not seen this puzzle yet, we will add a cell with the time prediction
                                            theGrid[team.TeamId].Add(unlockedPuzzle, new GridCellViewModel()
                                            {
                                                ClueId = unlockedPuzzle,
                                                PredictedStart = predictedStart
                                            });

                                            // For now predict that all puzzles take a set amount of time.
                                            DateTime predecitedEnd = predictedStart + TimeSpan.FromMinutes(60);
                                            var unlockedPuzzleToc = allPuzzles.FirstOrDefault(p => p.SubmittableId == unlockedPuzzle);

                                            if (puzzleSolveTimes.ContainsKey(unlockedPuzzle))
                                            {
                                                if (unlockedPuzzleToc != null && unlockedPuzzleToc.ParSolveTime.HasValue)
                                                {
                                                    predecitedEnd = predictedStart + TimeSpan.FromMinutes(unlockedPuzzleToc.ParSolveTime.Value);
                                                }
                                                else
                                                {
                                                    predecitedEnd = predictedStart + TimeSpan.FromMinutes(puzzleSolveTimes[unlockedPuzzle].Item1 / puzzleSolveTimes[unlockedPuzzle].Item2);
                                                }
                                            }
                                            else if (allAnswers.Where(p => p.Submittable == unlockedPuzzle).Count() == 0)
                                            {
                                                theGrid[team.TeamId][unlockedPuzzle].HasNoAnswer = true;
                                                predecitedEnd = predictedStart;
                                            }

                                            theGrid[team.TeamId][unlockedPuzzle].PredictedEnd = predecitedEnd;
                                            if (!LatestEndTime.HasValue || LatestEndTime < predecitedEnd)
                                            {
                                                LatestEndTime = predecitedEnd;
                                            }

                                            if (!nextCluesOfInterest.ContainsKey(team.TeamId))
                                            {
                                                nextCluesOfInterest[team.TeamId] = new List<Guid>();
                                            }

                                            nextCluesOfInterest[team.TeamId].Add(unlockedPuzzle);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                currentActivePuzzlesForTeam = nextCluesOfInterest;
            }
            #endregion

            return theGrid;
        }

        public Dictionary<Guid /* submittable */, Dictionary<Guid /* team */, List<Guid> /*submittables */>> GetFullUnlockMap(Guid eventInstance)
        {
            Dictionary<Guid /* submittable */, Dictionary<Guid /* team */, List<Guid> /*submittables */>> unlockMap = new Dictionary<Guid, Dictionary<Guid, List<Guid>>>();
            var allUnlocks = this.dbContext.GetToCsUnlocksForAllAnswers(eventInstance);
            foreach (var unlock in allUnlocks)
            {
                if (!unlockMap.ContainsKey(unlock.SourceSubmittable))
                {
                    unlockMap.Add(unlock.SourceSubmittable, new Dictionary<Guid, List<Guid>>());
                }

                if (unlock.AppliesToTeam.HasValue && unlock.SubmittableId.HasValue)
                {
                    if (!unlockMap[unlock.SourceSubmittable].ContainsKey(unlock.AppliesToTeam.Value))
                    {
                        unlockMap[unlock.SourceSubmittable][unlock.AppliesToTeam.Value] = new List<Guid>();
                    }

                    unlockMap[unlock.SourceSubmittable][unlock.AppliesToTeam.Value].Add(unlock.SubmittableId.Value);
                }
                else if (unlock.SubmittableId.HasValue)
                {
                    if (!unlockMap[unlock.SourceSubmittable].ContainsKey(Guid.Empty))
                    {
                        unlockMap[unlock.SourceSubmittable][Guid.Empty] = new List<Guid>();
                    }

                    unlockMap[unlock.SourceSubmittable][Guid.Empty].Add(unlock.SubmittableId.Value);
                }
            }

            return unlockMap;
        }
    }
}
