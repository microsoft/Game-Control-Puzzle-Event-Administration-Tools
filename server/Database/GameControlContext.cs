using GameControl.Server.Database.SprocTypes;
using GameControl.Server.Database.Tables;
using GameControl.Server.Util;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace GameControl.Server.Database
{
    public class GameControlContext : DbContext
    {
        private readonly int META_ADMIN_FLAG = 0x1;

        public GameControlContext(DbContextOptions<GameControlContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Until https://github.com/aspnet/EntityFrameworkCore/issues/245 is resolved,
            // we need to use sprocs individually rather than mapping them into the core model.
            modelBuilder.Entity<TableOfContentsEntryForTeam>(entity =>
            {
                entity.HasKey(item => item.TableOfContentId);
                entity.Property(item => item.TableOfContentId).ValueGeneratedNever();
            });

            modelBuilder.Entity<TableOfContentsEntryForStaff>(entity =>
            {
                entity.HasKey(item => item.TableOfContentId);
                entity.Property(item => item.TableOfContentId).ValueGeneratedNever();
            });

            modelBuilder.Entity<TableOfContentsEntrySummary>(entity =>
            {
                entity.HasKey(item => item.TableOfContentId);
                entity.Property(item => item.TableOfContentId).ValueGeneratedNever();
            });

            modelBuilder.Entity<SubmittableUnlockRelationship>(entity =>
            {
                entity.HasKey(item => new { item.TableOfContentsEntry, item.Answer });
            });

            modelBuilder.Entity<TeamToCAccess>(entity =>
            {
                entity.HasKey(item => new { item.Team, item.TableOfContentsEntry });
            });

            modelBuilder.Entity<ParticipationToCRating>(entity =>
            {
                entity.HasKey(item => new { item.Participation, item.TableOfContentsEntry });
            });

            modelBuilder.Entity<GridData>(entity =>
            {
                entity.HasKey(item => new { item.SubmittableId, item.TeamId });
            });

            modelBuilder.Entity<ActivityFeedItemViewModel>(entity =>
            {
                entity.HasKey(item => item.Id);
                entity.Property(item => item.Id).ValueGeneratedNever();
            });

            modelBuilder.Entity<TocUnlocksForAnswers>(entity =>
            {
                entity.HasKey(item => item.AnswerId);
            });

            modelBuilder.Entity<RatingForTableOfContentsEntry>(entity =>
            {
                entity.HasKey(item => new { item.TableOfContentsEntry, item.Participation });
            });

            modelBuilder.Entity<AdditionalContentForPuzzle>(entity =>
            {
                entity.HasKey(item => item.AssociationId);
            });

            modelBuilder.Entity<AdditionalContentForTeam>(entity =>
            {
                entity.HasKey(item => item.AssociationId);
            });

            modelBuilder.Entity<GetAllSubmissionsResult>(entity =>
            {
                entity.HasKey(item => item.ChallengeSubmissionId);
            });

            modelBuilder.Entity<CallData>(entity => { entity.HasKey(item => item.CallId); });

            modelBuilder.Entity<TeamRoster>(entity => { entity.HasKey(item => item.ParticipantId); });

            modelBuilder.Entity<SubmissionUnlockData>(entity => { entity.HasKey(item => item.TableOfContentId); });

            modelBuilder.Entity<ValidSubmission>(entity => { entity.HasKey(item => item.SubmissionId); });

            modelBuilder.Entity<TeamAdditionalData>(entity =>
            {
                entity.HasKey(item => new { item.Team, item.DataKey });
            });
        }

        #region Permission Checks

        public bool isUserStaffForEvent(Guid participantId, Guid eventInstanceId)
        {
            var participation = this.Participation.AsNoTracking().FirstOrDefault(p => p.Participant == participantId && p.EventInstance == eventInstanceId);
            return participation?.IsStaff ?? false;
        }

        public bool isUserAdminForEvent(Guid participantId, Guid eventInstanceId)
        {
            var participation = this.Participation.AsNoTracking().FirstOrDefault(p => p.Participant == participantId && p.EventInstance == eventInstanceId);
            return participation?.IsAdmin ?? false;
        }

        public bool isUserMetaAdmin(Guid participantId)
        {
            var participant = this.Participant.AsNoTracking().FirstOrDefault(p => p.ParticipantId == participantId);
            return participant != null && (participant.AdditionalRoles & META_ADMIN_FLAG) > 0;
        }

        public bool isApiKeyValid(Guid eventInstance, string key)
        {
            var apiKey = this.ApiKey.AsNoTracking().FirstOrDefault(p => p.KeyValue.Trim().Equals(key) && p.EventInstance == eventInstance);
            return !apiKey?.IsRevoked ?? false;
        }

        public Guid? getEventInstanceFromApiKey(string key)
        {
            var apiKey = this.ApiKey.AsNoTracking().FirstOrDefault(p => p.KeyValue.Trim().Equals(key));
            if (apiKey != null && !apiKey.IsRevoked)
            {
                return apiKey.EventInstance;
            }
            return null;
        }

        #endregion

        #region Tables
        public DbSet<Achievement> Achievement { get; set; }

        public DbSet<Content> AdditionalContent { get; set; }

        public DbSet<Answer> Answer { get; set; }

        public DbSet<ApiKey> ApiKey { get; set; }

        public DbSet<Call> Call { get; set; }

        public DbSet<Challenge> Challenge { get; set; }

        public DbSet<ChallengeSubmission> ChallengeSubmission { get; set; }

        public DbSet<Event> Event { get; set; }

        public DbSet<EventInstance> EventInstance { get; set; }

        public DbSet<GcMessage> GcMessages { get; set; }

        public DbSet<Location> Location { get; set; }

        public DbSet<Participant> Participant { get; set; }

        public DbSet<ParticipantLoginMsa> ParticipantLoginMsa { get; set; }

        public DbSet<Participation> Participation { get; set; }

        public DbSet<ParticipationLogin> ParticipationLogin { get; set; }

        public DbSet<ParticipationToCRating> ParticipationToCRating { get; set; }

        public DbSet<Pulse> Pulse { get; set; }

        public DbSet<Settings> Settings { get; set; }

        public DbSet<SqmData> SqmData { get; set; }

        public DbSet<Submission> Submission { get; set; }

        public DbSet<Submittable> Submittable { get; set; }

        public DbSet<SubmittableUnlockRelationship> SubmittableUnlockRelationship { get; set; }

        public DbSet<TableOfContentsEntry> TableOfContentsEntry { get; set; }

        public DbSet<Team> Team { get; set; }

        public DbSet<TeamAdditionalData> TeamAdditionalData { get; set; }

        public DbSet<TeamToCAccess> TeamToCAccess { get; set; }
                    
        public DbSet<ToCContent> ToCContent { get; set; }

        public DbSet<ToCInstance> ToCInstance { get; set; }
        #endregion Tables

        #region Functions

        public IEnumerable<ValidSubmission> GetValidSubmissions(Guid eventInstanceId)
        {
            return Set<ValidSubmission>().FromSqlInterpolated($"SELECT * FROM GetValidSubmissions({eventInstanceId})").AsNoTracking();
        }

        #endregion

        #region Sprocs

        public void AddAchievementUnlockForTeam(Guid achievementId, Guid teamId)
        {
            this.Database.ExecuteSqlRaw("[dbo].[AchievementUnlock_AddForTeam] @achievementId = {0}, @teamId = {1}",
                achievementId, teamId);
        }

        public void AddAchievementUnlockForTeamFromSubmission(Guid achievementId, Guid teamId, Guid submissionId)
        {
            this.Database.ExecuteSqlRaw("[dbo].[AchievementUnlock_AddForTeamFromSubmission] @achievementId = {0}, @teamId = {1}, @submissionId = {2}",
                achievementId, teamId, submissionId);
        }

        public void RevokeAchievementUnlockForTeam(Guid achievementId, Guid teamId)
        {
            this.Database.ExecuteSqlRaw("[dbo].[AchievementUnlock_RevokeForTeam] @achievementId = {0}, @teamId = {1}",
                achievementId, teamId);
        }

        public void AddAchievementUnlockToAnswer(Guid eventInstanceId, Guid answerId, Guid achievementId)
        {
            this.Database.ExecuteSqlRaw("[dbo].[Admin_AchievementRelationship_AddAchievementToAnswer] @eventInstanceId = {0}, @answerId = {1}, @achievementId = {2}", eventInstanceId, answerId, achievementId);
        }

        public void DeleteAchievementUnlockFromAnswer(Guid eventInstanceId, Guid answerId, Guid achievementId)
        {
            this.Database.ExecuteSqlRaw("[dbo].[Admin_AchievementRelationship_RemoveAchievementFromAnswer] @eventInstanceId = {0}, @answerId = {1}, @achievementId = {2}", eventInstanceId, answerId, achievementId);
        }

        public IEnumerable<Achievement> GetAchievementsUnlockedBySubmission(Guid submissionId)
        {
            return Set<Achievement>().FromSqlRaw("[dbo].[Achievement_GetAchievementsUnlockedBySubmission] @submissionId = {0}", submissionId).ToList();
        }

        public void UpdatePointsForTeam(Guid eventInstanceId, Guid teamId, Guid? granterParticipation, long points, string reason)
        {
            this.Database.ExecuteSqlRaw("[dbo].[PointsTransaction_AwardPoints] @eventInstance = {0}, @team = {1}, @points = {2}, @reason = {3}, @participation = {4}",
                eventInstanceId, teamId, points, reason, granterParticipation);
        }

        public IEnumerable<AdditionalContentForPuzzle> GetAdditionalContentForClue(Guid tocId)
        {
            return Set<AdditionalContentForPuzzle>().FromSqlRaw("[dbo].[Rx_GetAdditionalContentForTableOfContentEntry] @tableOfContentsEntryId = {0}", tocId).AsNoTracking();
        }

        public IEnumerable<AdditionalContentForTeam> GetAdditionalContentForTeam(Guid teamId)
        {
            return Set<AdditionalContentForTeam>().FromSqlRaw("[dbo].[GetAdditionalContentForTeam] @teamId = {0}", teamId).AsNoTracking();
        }

        public IEnumerable<Achievement> GetAchievementsForTeam(Guid teamId)
        {
            return Set<Achievement>().FromSqlRaw("[dbo].[Achievement_GetAchievementsForTeam] @teamId = {0}", teamId);
        }

        public IEnumerable<GcMessage> GetGcMessages(Guid eventInstanceId)
        {
            return Set<GcMessage>().FromSqlRaw("[dbo].[GcMessages_GetMessagesForEventInstance] @eventInstanceId = {0}", eventInstanceId).ToList();
        }

        public IEnumerable<TableOfContentsEntryForTeam> GetCluesForTeam(Guid teamId)
        {
            /*
                SELECT TableOfContentsEntry.TableOfContentId,
                Submittable.Title AS SubmittableTitle,
                Submittable.SubmittableType,
                Submittable.LastUpdate AS SubmittableLastUpdate,
                Submittable.SubmittableId,
                TableOfContentsEntry.SortOrder,
                TeamTocAccess.UnlockTime,
                EarliestCorrectSubmission.SubmissionTime,
                COALESCE(AnswerCount.AnswerCount, 0) AS AnswerCount
                FROM TableOfContentsEntry
            */
            return Set<TableOfContentsEntryForTeam>().FromSqlRaw("[dbo].[GetTableOfContentsEntriesForTeam] @teamId = {0}", teamId).AsNoTracking();
        }

        public IEnumerable<TableOfContentsEntryForTeam> GetCluesForTeamFast(Guid eventInstanceId, Guid teamId)
        {
            return Set<TableOfContentsEntryForTeam>().FromSqlRaw("[dbo].[GetTableOfContentsEntriesForTeam_Optimized] @eventInstanceId = {0}, @teamId = {1}", eventInstanceId, teamId).AsNoTracking();
        }

        public IEnumerable<GetAllSubmissionsResult> GetAllChallengeSubmissions(Guid eventInstanceId)
        {
            return Set<GetAllSubmissionsResult>().FromSqlRaw("[dbo].[ChallengeSubmission_GetAllSubmissions] @eventInstanceId = {0}", eventInstanceId).ToList();
        }

        public IEnumerable<ChallengeSubmission> GetChallengeSubmissionsForTeam(Guid challengeId, Guid teamId)
        {
            return Set<ChallengeSubmission>().FromSqlRaw("[dbo].[ChallengeSubmission_GetForTeam] @challengeId = {0}, @teamId = {1}", challengeId, teamId).ToList();
        }

        public IEnumerable<TableOfContentsEntryForStaff> GetCluesForStaff(Guid eventInstanceId)
        {
            /*
             *  SELECT TableOfContentsEntry.TableOfContentId,
           Submittable.Title,
           Submittable.ShortTitle,
           Submittable.SubmittableType,
           Submittable.LastUpdate,
           Submittable.SubmittableId,
           Submittable.WikiPage,
           TableOfContentsEntry.SortOrder,
           TableOfContentsEntry.OpenTime,
           TableOfContentsEntry.ClosingTime,
           TableOfContentsEntry.ParSolveTime
           */
            return Set<TableOfContentsEntryForStaff>().FromSqlRaw("[dbo].[GetAllTableOfContentsEntries] @eventInstance = {0}", eventInstanceId).AsNoTracking().ToList();
        }

        public IEnumerable<Achievement> GetAchievementsToUnlockForAnswer(Guid answerId)
        {
            return Set<Achievement>().FromSqlRaw("[dbo].[Achievement_GetAchievementsUnlockedByAnswer] @answerId = {0}", answerId).ToList();
        }

        public IEnumerable<CallData> GetCallsForEventInstance(Guid eventInstanceId)
        {
            return Set<CallData>().FromSqlRaw("[dbo].[Call_GetCallsForEventInstance] @eventInstanceId = {0}", eventInstanceId).AsNoTracking().ToList();
        }

        public IEnumerable<SubmittableUnlockRelationship> GetCluesToUnlockForAnswer(Guid teamId, Guid? answerId)
        {
            /*
                SELECT SubmittableUnlockRelationship.*
                FROM SubmittableUnlockRelationship
                INNER JOIN Answer ON Answer.AnswerId = SubmittableUnlockRelationship.Answer
            --  INNER JOIN TableOfContentsEntry ON TableOfContentsEntry.TableOfContentId = SubmittableUnlockRelationship.TableOfContentsEntry
                LEFT JOIN TeamToCAccess ON TeamToCAccess.TableOfContentsEntry = SubmittableUnlockRelationship.TableOfContentsEntry AND 
                                           TeamToCAccess.Team = @teamId
                WHERE Answer.AnswerId = @answerId AND                           
                      TeamToCAccess.TableOfContentsEntry IS NULL
             */

            return Set<SubmittableUnlockRelationship>().FromSqlRaw("[dbo].[Rx_GetTableOfContentsEntriesToUnlock] @teamId = {0}, @answerId = {1}", teamId, answerId).ToList();
        }

        public IEnumerable<SubmissionUnlockData> GetCluesUnlockedBySubmission(Guid submissionId)
        {
            return Set<SubmissionUnlockData>().FromSqlRaw("[dbo].[GetToCsUnlockedBySubmission] @submissionId = {0}", submissionId).AsNoTracking();
        }

        public IEnumerable<ToCInstance> GetClueInstancesForEvent(Guid eventInstanceId)
        {
            return Set<ToCInstance>().FromSqlRaw("[dbo].[ToCInstance_GetInstancesForEventInstance] @eventInstanceId = {0}", eventInstanceId).AsNoTracking();
        }

        public IEnumerable<GridData> GetDataForTheGrid(Guid eventInstanceId)
        {
            /*
                SELECT Submittable.SubmittableId,
                       Submittable.Title,
                       Access.UnlockTime,
                       Access.UnlockReason,
                       Team.Name,       
                       Team.ShortName,
                       Team.Color,
                       Team.IsTestTeam,
                       EarliestCorrectSubmission.SubmissionTime,
                       Team.TeamId
                FROM TableOfContentsEntry
                INNER JOIN Submittable ON Submittable.SubmittableId = TableOfContentsEntry.Submittable
                INNER JOIN TeamToCAccess AS Access ON Access.TableOfContentsEntry = TableOfContentsEntry.TableOfContentId
                LEFT JOIN Team ON Team.TeamId = Access.Team
                LEFT JOIN EarliestCorrectSubmission ON EarliestCorrectSubmission.SubmittableId = Submittable.SubmittableId
                                                   AND EarliestCorrectSubmission.TeamId = Team.TeamId
                WHERE Team.EventInstance = @eventInstanceId
                ORDER BY Team.Name, TableOfContentsEntry.SortOrder             
            */

            return Set<GridData>().FromSqlRaw("[dbo].[GetDataForTheGrid] @eventInstanceId = {0}", eventInstanceId).AsNoTracking().ToList();
        }

        public IEnumerable<ActivityFeedItemViewModel> GetActivityFeedForStaff(Guid eventInstanceId, int startPage, out int totalResults)
        {
            SqlParameter totalResultsParameter = new SqlParameter("@totalResults", System.Data.SqlDbType.Int)
            {
                Direction = System.Data.ParameterDirection.Output
            };

            var returnValue = Set<ActivityFeedItemViewModel>().FromSqlRaw("[dbo].[GetAggregatedContentPaged] @eventInstance, @startPage, @resultsPerPage, @totalResults OUTPUT",
                new SqlParameter("eventInstance", SqlDbType.UniqueIdentifier)
                {
                    Value = eventInstanceId
                },
                new SqlParameter("startPage", SqlDbType.Int)
                {
                    Value = startPage
                },
                new SqlParameter("resultsPerPage", 50),
                totalResultsParameter).AsNoTracking().ToList();

            totalResults = (int)totalResultsParameter.Value;

            return returnValue;
        }

        public IEnumerable<ActivityFeedItemViewModel> GetActivityFeedForTeam(Guid eventInstanceId, Guid teamId)
        {
            SqlParameter totalResultsParameter = new SqlParameter("@totalResults", System.Data.SqlDbType.Int)
            {
                Direction = System.Data.ParameterDirection.Output
            };

            return Set<ActivityFeedItemViewModel>().FromSqlRaw("[dbo].[GetAggregatedContentPagedForTeam] @eventInstanceId, @teamId, @startPage, @resultsPerPage, @totalResults",
                new SqlParameter("eventInstanceId", SqlDbType.UniqueIdentifier) { Value = eventInstanceId },
                new SqlParameter("teamId", SqlDbType.UniqueIdentifier) { Value = teamId },
                new SqlParameter("startPage", SqlDbType.Int)
                {
                    Value = 0
                },
                new SqlParameter("resultsPerPage", 50),
                totalResultsParameter).AsNoTracking().ToList();
        }

        public IEnumerable<RatingForTableOfContentsEntry> GetRatingsForTableOfContentsEntry(Guid tableOfContentId)
        {
            return Set<RatingForTableOfContentsEntry>().FromSqlRaw("[dbo].[ParticipationToCRating_GetRatingsForTableOfContentsEntry] @tableOfContentId = {0}", tableOfContentId).ToList();
        }

        public IEnumerable<TeamRoster> GetRosterForTeam(Guid teamId)
        {
            return Set<TeamRoster>().FromSqlRaw("[dbo].[Team_GetRosterForTeam] @teamId = {0}", teamId).ToList();
        }

        public IEnumerable<TableOfContentsEntrySummary> GetToCsUnlockedByAnswer(Guid answerId)
        {
            return Set<TableOfContentsEntrySummary>().FromSqlRaw("[dbo].[GetToCsUnlockedByAnswer] @answerId = {0}", answerId).ToList();
        }

        public IEnumerable<Achievement> GetAchievementsUnlockedByAnswer(Guid answerId)
        {
            return Set<Achievement>().FromSqlRaw("[dbo].[Achievement_GetAchievementsUnlockedByAnswer] @answerId = {0}", answerId).ToList();
        }

        public IEnumerable<TocUnlocksForAnswers> GetToCsUnlocksForAllAnswers(Guid eventInstanceId)
        {
            return Set<TocUnlocksForAnswers>().FromSqlRaw("[dbo].[Answer_GetToCUnlocksForAllAnswers] @eventInstanceId = {0}", eventInstanceId).AsNoTracking().ToList();
        }

        public ValidSubmission SubmitAnswer(Guid submittableId, Guid teamId, Guid? participationId, string answer)
        {
            //    PROCEDURE[dbo].[AddSubmission]
            //    @submissionId[uniqueidentifier],
            //    @teamId[uniqueidentifier],
            //    @submittableId[uniqueidentifier],
            //    @submission[nvarchar] (max),
            //    @submissionTime[datetime],
            //    @submissionSource[nvarchar] (128),
            //    @participationId UNIQUEIDENTIFIER = NULL
            
            // NOTE: This is technically already sanitized, but we'll do it again to make sure it's always done before calling into the DB
            string sanitizedAnswer = GameControlUtil.SanitizeString(answer);

            if (!string.IsNullOrEmpty(sanitizedAnswer))
            {
                var submissionResult = this.Set<ValidSubmission>().FromSqlRaw(
                    "[dbo].[AddSubmission] @submissionId = {0}, @teamId = {1}, @submittableId = {2}, @submission = {3}, @submissionTime = {4}, @submissionSource = {5}, @participationId = {6}",
                    Guid.NewGuid(), teamId, submittableId, sanitizedAnswer, DateTime.UtcNow, "GameControlClient", participationId).ToList();

                return submissionResult.FirstOrDefault();
            } else
            {
                throw new InvalidOperationException("Answer cannot be null or empty.");
            }
        }

        public Pulse SubmitPulse(Guid participationId, string pulseText, byte pulseValue, byte[] picData, decimal? latitude, decimal? longitude)
        {
            Pulse newPulse = new Pulse()
            {
                PulseId = Guid.NewGuid(),
                PulseText = pulseText,
                PulseRating = pulseValue,
                LastUpdated = DateTime.UtcNow,
                Participation = participationId,
                Latitude = latitude,
                Longitude = longitude,
                TeamPic = picData
            };

            this.Pulse.Add(newPulse);
            this.SaveChanges();

            return newPulse;
        }

        public void RateTableOfContentsEntry(Guid tableOfContentsId, Guid participationId, int rating, string comment)
        {
            this.Database.ExecuteSqlRaw("[dbo].[TableOfContentsEntry_AddRating] @tocId = {0}, @participationId = {1}, @rating = {2}, @comment = {3}",
                tableOfContentsId, participationId, rating, comment);
        }

        public void UnlockTableOfContentsEntry(Guid teamId, Guid tableOfContentId, String unlockReason)
        {
            this.Database.ExecuteSqlRaw("[dbo].[AddTableOfContentsEntryAccess] @teamId = {0}, @tableOfContentsEntryId = {1}, @unlockReason = {2}",
                teamId, tableOfContentId, unlockReason);
        }

        public void UnlockTableOfContentsEntry(Guid teamId, Guid tableOfContentId, Guid sourceSubmission)
        {
            if (this.TeamToCAccess.FirstOrDefault(p => p.Team == teamId && p.TableOfContentsEntry == tableOfContentId) == null)
            {
                TeamToCAccess newAccess = new Tables.TeamToCAccess()
                {
                    Team = teamId,
                    TableOfContentsEntry = tableOfContentId,
                    UnlockTime = DateTime.UtcNow,
                    UnlockReason = "Answer",
                    UnlockSubmission = sourceSubmission
                };

                this.TeamToCAccess.Add(newAccess);
                this.SaveChanges();
            }
        }

        #endregion
    }
}
