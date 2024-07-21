USE [master]
GO
/****** Object:  Database [gamecontrol] ******/
CREATE DATABASE [gamecontrol]
 CONTAINMENT = NONE
 WITH CATALOG_COLLATION = DATABASE_DEFAULT
GO
ALTER DATABASE [gamecontrol] SET COMPATIBILITY_LEVEL = 130
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [gamecontrol].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [gamecontrol] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [gamecontrol] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [gamecontrol] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [gamecontrol] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [gamecontrol] SET ARITHABORT OFF 
GO
ALTER DATABASE [gamecontrol] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [gamecontrol] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [gamecontrol] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [gamecontrol] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [gamecontrol] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [gamecontrol] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [gamecontrol] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [gamecontrol] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [gamecontrol] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [gamecontrol] SET  ENABLE_BROKER 
GO
ALTER DATABASE [gamecontrol] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [gamecontrol] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [gamecontrol] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [gamecontrol] SET ALLOW_SNAPSHOT_ISOLATION ON 
GO
ALTER DATABASE [gamecontrol] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [gamecontrol] SET READ_COMMITTED_SNAPSHOT ON 
GO
ALTER DATABASE [gamecontrol] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [gamecontrol] SET RECOVERY FULL 
GO
ALTER DATABASE [gamecontrol] SET  MULTI_USER 
GO
ALTER DATABASE [gamecontrol] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [gamecontrol] SET DB_CHAINING OFF 
GO
ALTER DATABASE [gamecontrol] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [gamecontrol] SET TARGET_RECOVERY_TIME = 120 SECONDS 
GO
ALTER DATABASE [gamecontrol] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [gamecontrol] SET QUERY_STORE = ON
GO
ALTER DATABASE [gamecontrol] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 100, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [gamecontrol]
GO
USE [gamecontrol]
GO
/****** Object:  Table [dbo].[Pulse] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Pulse](
    [PulseId] [uniqueidentifier] NOT NULL,
    [Team] [uniqueidentifier] NULL,
    [PulseText] [nvarchar](255) NOT NULL,
    [PulseRating] [tinyint] NOT NULL,
    [LastUpdated] [datetime] NOT NULL,
    [TeamPic] [varbinary](max) NULL,
    [Participation] [uniqueidentifier] NULL,
    [Latitude] [decimal](16, 13) NULL,
    [Longitude] [decimal](16, 13) NULL,
 CONSTRAINT [PK_Pulse] PRIMARY KEY CLUSTERED 
(
    [PulseId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Team] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Team](
    [TeamId] [uniqueidentifier] NOT NULL,
    [EventInstance] [uniqueidentifier] NOT NULL,
    [Name] [nvarchar](max) NOT NULL,
    [ShortName] [nvarchar](25) NOT NULL,
    [Color] [int] NOT NULL,
    [LastUpdate] [datetime] NOT NULL,
    [CertificateThumbprint] [char](40) NULL,
    [Passphrase] [nvarchar](100) NOT NULL,
    [Points] [bigint] NULL,
    [IsTestTeam] [bit] NULL,
    [GcNotes] [nvarchar](max) NULL,
 CONSTRAINT [PK_Team] PRIMARY KEY CLUSTERED 
(
    [TeamId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  View [dbo].[TeamAverageRecentPulse] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[TeamAverageRecentPulse]
AS
SELECT     Team, Average
FROM         (SELECT     *, AVG(cast(p.PulseRating AS float)) OVER (PARTITION BY p.Team) AS Average, RANK() OVER (Partition BY Team
                       ORDER BY PulseId) AS Rank2
FROM         (SELECT     Pulse.PulseId AS PulseId, Pulse.PulseRating, Pulse.Team, RANK() OVER (partition BY Team
                       ORDER BY LastUpdated DESC) AS Rank, Team.ShortName
FROM         Pulse INNER JOIN
                      Team ON Pulse.Team = Team.TeamId) AS p
WHERE     p.Rank BETWEEN 1 AND 10) AS q
WHERE     q.Rank2 = 1
GO
/****** Object:  Table [dbo].[Answer] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Answer](
    [AnswerId] [uniqueidentifier] NOT NULL,
    [EventInstance] [uniqueidentifier] NOT NULL,
    [Submittable] [uniqueidentifier] NOT NULL,
    [AnswerText] [nvarchar](255) NOT NULL,
    [AnswerResponse] [nvarchar](max) NOT NULL,
    [IsCorrectAnswer] [bit] NOT NULL,
    [IsHidden] [bit] NOT NULL,
    [AppliesToTeam] [uniqueidentifier] NULL,
    [LastUpdated] [datetime] NOT NULL,
    [AdditionalContent] [uniqueidentifier] NULL,
 CONSTRAINT [PK_Answer] PRIMARY KEY CLUSTERED 
(
    [AnswerId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Participant] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Participant](
    [ParticipantId] [uniqueidentifier] NOT NULL,
    [FirstName] [nvarchar](50) NOT NULL,
    [LastName] [nvarchar](50) NULL,
    [Email] [nvarchar](128) NULL,
    [LastChanged] [datetime] NOT NULL,
    [DefaultParticipation] [uniqueidentifier] NULL,
    [ContactNumber] [nvarchar](25) NULL,
    [AdditionalRoles] [int] NOT NULL,
 CONSTRAINT [PK_Participant] PRIMARY KEY CLUSTERED 
(
    [ParticipantId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Index [UQ_Participant_Email] ******/
CREATE UNIQUE NONCLUSTERED INDEX UQ_Participant_Email
ON Participant(Email)
WHERE Email IS NOT NULL
/****** Object:  Table [dbo].[Participation] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Participation](
    [ParticipationId] [uniqueidentifier] NOT NULL,
    [Participant] [uniqueidentifier] NOT NULL,
    [EventInstance] [uniqueidentifier] NOT NULL,
    [Team] [uniqueidentifier] NULL,
    [LastUpdated] [datetime] NOT NULL,
    [IsStaff] [bit] NOT NULL,
    [IsAdmin] [bit] NOT NULL,
 CONSTRAINT [PK_Participation] PRIMARY KEY CLUSTERED 
(
    [ParticipationId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Submission] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Submission](
    [SubmissionId] [uniqueidentifier] NOT NULL,
    [Team] [uniqueidentifier] NOT NULL,
    [Submittable] [uniqueidentifier] NULL,
    [Submission] [nvarchar](255) NOT NULL,
    [SubmissionTime] [datetime] NOT NULL,
    [SubmissionSource] [nvarchar](128) NOT NULL,
    [Participation] [uniqueidentifier] NULL,
 CONSTRAINT [PK_Submission] PRIMARY KEY CLUSTERED 
(
    [SubmissionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Submittable] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Submittable](
    [SubmittableId] [uniqueidentifier] NOT NULL,
    [SubmittableType] [nchar](10) NOT NULL,
    [Title] [nvarchar](255) NOT NULL,
    [ShortTitle] [nvarchar](50) NOT NULL,
    [LastUpdate] [datetime] NOT NULL,
    [WikiPage] [nvarchar](500) NULL,
 CONSTRAINT [PK_Submittable] PRIMARY KEY CLUSTERED 
(
    [SubmittableId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [dbo].[ValidSubmissions] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[ValidSubmissions]
AS
SELECT
    dbo.Submission.SubmissionId,
    dbo.Submission.Submission,
    dbo.Submittable.SubmittableId,
    dbo.Submission.SubmissionTime,
    dbo.Answer.AnswerResponse,
    ISNULL(dbo.Answer.IsCorrectAnswer, 0) AS IsCorrectAnswer,
    dbo.Team.TeamId,
    dbo.Answer.AnswerId,
    dbo.Participant.FirstName,
    dbo.Participant.LastName, 
    dbo.Answer.AppliesToTeam,
    dbo.Answer.AdditionalContent,
    dbo.Answer.EventInstance,
    ISNULL(dbo.Answer.IsHidden, 0) AS IsHidden
FROM dbo.Submittable
INNER JOIN dbo.Submission ON dbo.Submission.Submittable = dbo.Submittable.SubmittableId
INNER JOIN dbo.Team ON dbo.Team.TeamId = dbo.Submission.Team
LEFT OUTER JOIN dbo.Answer ON dbo.Answer.Submittable = dbo.Submittable.SubmittableId 
            AND dbo.Answer.AnswerText = dbo.Submission.Submission COLLATE Latin1_General_100_CI_AS_SC
            AND dbo.Team.EventInstance = dbo.Answer.EventInstance
            AND (dbo.Answer.AppliesToTeam IS NULL OR dbo.Answer.AppliesToTeam = dbo.Team.TeamId)
LEFT OUTER JOIN dbo.Participation ON dbo.Participation.ParticipationId = dbo.Submission.Participation
LEFT OUTER JOIN dbo.Participant ON dbo.Participant.ParticipantId = dbo.Participation.Participant
GO
/****** Object:  View [dbo].[EarliestCorrectSubmission] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[EarliestCorrectSubmission]
AS
SELECT     p.SubmissionId, p.Submission, p.SubmittableId, p.SubmissionTime, p.AnswerResponse, p.IsCorrectAnswer, p.TeamId, p.AnswerId
FROM         (SELECT     *, RANK() OVER (PARTITION BY TeamId, SubmittableId
                       ORDER BY SubmissionTime ASC, AppliesToTeam DESC) AS Rank
FROM         ValidSubmissions
WHERE     IsCorrectAnswer = 1) AS p
WHERE     p.Rank = 1
GO
/****** Object:  Table [dbo].[Achievement] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Achievement](
    [AchievementId] [uniqueidentifier] NOT NULL,
    [Name] [nvarchar](100) NOT NULL,
    [Description] [nvarchar](255) NOT NULL,
    [Icon] [varbinary](max) NOT NULL,
    [CreatedOn] [datetime] NOT NULL,
    [EventId] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_Achievement] PRIMARY KEY CLUSTERED 
(
    [AchievementId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[AchievementUnlock] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AchievementUnlock](
    [AchievementId] [uniqueidentifier] NOT NULL,
    [TeamId] [uniqueidentifier] NULL,
    [ParticipantId] [uniqueidentifier] NULL,
    [UnlockedOn] [datetime] NOT NULL,
    [UnlockedBy] [uniqueidentifier] NULL
) ON [PRIMARY]
GO
/****** Object:  Index [AchievementUnlock_Team_Achievement_IX] ******/
CREATE UNIQUE CLUSTERED INDEX [AchievementUnlock_Team_Achievement_IX] ON [dbo].[AchievementUnlock]
(
    [AchievementId] ASC,
    [TeamId] ASC,
    [ParticipantId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Call] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Call](
    [CallId] [uniqueidentifier] NOT NULL,
    [Team] [uniqueidentifier] NOT NULL,
    [Participant] [uniqueidentifier] NOT NULL,
    [CallStart] [datetime] NOT NULL,
    [CallEnd] [datetime] NULL,
    [CallType] [char](10) NULL,
    [CallSubType] [char](10) NULL,
    [LastUpdated] [datetime] NOT NULL,
    [ToCEntry] [uniqueidentifier] NULL,
    [Notes] [nvarchar](max) NULL,
    [TeamNotes] [nvarchar](max) NULL,
    [PublicNotes] [nvarchar](max) NULL,
 CONSTRAINT [PK_Call] PRIMARY KEY CLUSTERED 
(
    [CallId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ChallengeSubmission] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ChallengeSubmission](
    [ChallengeSubmissionId] [uniqueidentifier] NOT NULL,
    [Challenge] [uniqueidentifier] NOT NULL,
    [Participant] [uniqueidentifier] NOT NULL,
    [SubmissionDate] [datetime] NOT NULL,
    [LastChanged] [datetime] NOT NULL,
    [State] [int] NOT NULL,
    [Approver] [uniqueidentifier] NULL,
    [SubmissionType] [nvarchar](50) NOT NULL,
    [SubmissionNotes] [nvarchar](max) NOT NULL,
    [SubmissionTextContent] [nvarchar](max) NULL,
    [SubmissionBinaryContent] [varbinary](max) NULL,
    [ApproverText] [nvarchar](max) NULL,
 CONSTRAINT [PK_ChallengeSubmission] PRIMARY KEY CLUSTERED 
(
    [ChallengeSubmissionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[GcMessages] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[GcMessages](
    [MessageId] [uniqueidentifier] NOT NULL,
    [GcParticipation] [uniqueidentifier] NOT NULL,
    [Team] [uniqueidentifier] NOT NULL,
    [MessageText] [nvarchar](max) NOT NULL,
    [LastUpdated] [datetime] NOT NULL,
 CONSTRAINT [PK_GcMessages] PRIMARY KEY CLUSTERED 
(
    [MessageId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PointTransaction] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PointTransaction](
    [AwardId] [int] IDENTITY(1,1) NOT NULL,
    [EventInstance] [uniqueidentifier] NOT NULL,
    [Team] [uniqueidentifier] NOT NULL,
    [PointValue] [bigint] NOT NULL,
    [Reason] [nvarchar](max) NOT NULL,
    [Participation] [uniqueidentifier] NULL,
    [LastUpdated] [datetime] NOT NULL,
    [UniqueId] [uniqueidentifier] NULL,
 CONSTRAINT [PK_PointTransaction] PRIMARY KEY CLUSTERED 
(
    [AwardId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TableOfContentsEntry] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TableOfContentsEntry](
    [TableOfContentId] [uniqueidentifier] NOT NULL,
    [SortOrder] [int] NOT NULL,
    [Submittable] [uniqueidentifier] NULL,
    [EventInstance] [uniqueidentifier] NOT NULL,
    [GloballyAvailable] [bit] NOT NULL,
    [OpenTime] [datetime] NULL,
    [ClosingTime] [datetime] NULL,
    [ParSolveTime] [int] NULL,
 CONSTRAINT [PK_TableOfContentsEntry] PRIMARY KEY CLUSTERED 
(
    [TableOfContentId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TeamToCAccess] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TeamToCAccess](
    [Team] [uniqueidentifier] NOT NULL,
    [TableOfContentsEntry] [uniqueidentifier] NOT NULL,
    [UnlockTime] [datetime] NOT NULL,
    [UnlockReason] [nchar](10) NOT NULL,
    [UnlockSubmission] [uniqueidentifier] NULL,
 CONSTRAINT [PK_TeamToCAccess] PRIMARY KEY CLUSTERED 
(
    [Team] ASC,
    [TableOfContentsEntry] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ApiKey] ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[ApiKey](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[EventInstance] [uniqueidentifier] NOT NULL,
	[KeyValue] [nvarchar](64) NOT NULL,
	[IsRevoked] [bit] NOT NULL,
	[Name] [nvarchar](64) NOT NULL,
	[LastUpdated] [datetime] NOT NULL,
 CONSTRAINT [PK_ApiKey] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

/****** Object:  Table [dbo].[TeamAdditionalData] ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[TeamAdditionalData](
	[Team] [uniqueidentifier] NOT NULL,
	[DataKey] [nvarchar](100) NOT NULL,
	[DataValue] [nvarchar](max) NOT NULL,
	[LastUpdated] [datetime] NOT NULL,
 CONSTRAINT [PK_TeamAdditionalData] PRIMARY KEY CLUSTERED 
(
	[Team] ASC,
	[DataKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[TeamAdditionalData]  WITH CHECK ADD  CONSTRAINT [FK_TeamAdditionalData_Team] FOREIGN KEY([Team])
REFERENCES [dbo].[Team] ([TeamId])
GO

ALTER TABLE [dbo].[TeamAdditionalData] CHECK CONSTRAINT [FK_TeamAdditionalData_Team]
GO

/****** Object:  View [dbo].[AggregatedContent] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[AggregatedContent]
AS
SELECT        
    Pulse.PulseId AS Id, 
    Team.Name + ' (' + Participant.FirstName + ')' AS TeamName, 
    Team.TeamId AS TeamId, 
    Team.Color AS TeamColor, 
    'Pulse' AS AggregatedContentType, 
    Pulse.LastUpdated AS LastUpdated, 
    Pulse.PulseRating AS NumericValue, 
    Pulse.PulseText AS EpicWords, 
    CASE
        WHEN Pulse.TeamPic IS NULL
        THEN 0
        ELSE 1
    END AS HasAdditionalImage, 
    Team.EventInstance AS EventInstance
FROM Pulse 
INNER JOIN Participation ON Participation.ParticipationId = Pulse.Participation 
INNER JOIN Participant ON Participant.ParticipantId = Participation.Participant 
INNER JOIN Team ON Team.TeamId = Participation.Team
WHERE Pulse.LastUpdated > DATEADD(hh,-48,GETUTCDATE())
UNION
SELECT
    ValidSubmissions.SubmissionId AS Id, 
    Team.Name AS TeamName, 
    Team.TeamId AS TeamId, 
    Team.Color AS TeamColor, 
    'Submission' AS AggregatedContentType, 
    ValidSubmissions.SubmissionTime AS LastUpdated, 
    CASE 
        WHEN ValidSubmissions.IsCorrectAnswer = 0 AND AnswerResponse IS NOT NULL 
        THEN 2 
        ELSE IsCorrectAnswer 
    END AS NumericValue, 
    ValidSubmissions.Submission + ' (' + Submittable.Title + ')' AS EpicWords, 
    0 AS HasAdditionalImage, 
    Team.EventInstance AS EventInstance
FROM ValidSubmissions 
INNER JOIN Team ON Team.TeamId = ValidSubmissions.TeamId
inner join Submittable on ValidSubmissions.SubmittableId = Submittable.SubmittableId
WHERE        
    ValidSubmissions.FirstName IS NULL
    AND ValidSubmissions.SubmissionTime > DATEADD(hh,-48,GETUTCDATE())
UNION
SELECT        
    ValidSubmissions.SubmissionId AS Id, 
    Team.Name + ' (' + ValidSubmissions.FirstName + ') ' AS TeamName, 
    Team.TeamId AS TeamId, 
    Team.Color AS TeamColor, 
    'Submission' AS AggregatedContentType, 
    ValidSubmissions.SubmissionTime AS LastUpdated, 
    CASE 
        WHEN ValidSubmissions.IsCorrectAnswer = 0 AND AnswerResponse IS NOT NULL 
        THEN 2 
        ELSE IsCorrectAnswer 
    END AS NumericValue, 
    ValidSubmissions.Submission + ' (' + Submittable.Title + ')' AS EpicWords, 
    0 AS HasAdditionalImage, 
    Team.EventInstance AS EventInstance
FROM ValidSubmissions 
INNER JOIN Team ON Team.TeamId = ValidSubmissions.TeamId
inner join Submittable on ValidSubmissions.SubmittableId = Submittable.SubmittableId
WHERE        
    ValidSubmissions.FirstName IS NOT NULL
    AND ValidSubmissions.SubmissionTime > DATEADD(hh,-48,GETUTCDATE())
UNION
SELECT        
    TeamToCAccess.TableOfContentsEntry AS Id, 
    Team.Name AS TeamName, 
    Team.TeamId AS TeamId, 
    Team.Color AS TeamColor, 
    TeamToCAccess.UnlockReason AS AggregatedContentType, 
    TeamToCAccess.UnlockTime AS LastUpdated, 
    NULL AS NumericValue, 
    Submittable.Title AS EpicWords, 
    0 AS HasAdditionalImage, 
    Team.EventInstance AS EventInstance
FROM TeamToCAccess 
INNER JOIN Team ON Team.TeamId = TeamToCAccess.Team 
INNER JOIN TableOfContentsEntry ON TableOfContentsEntry.TableOfContentId = TeamToCAccess.TableOfContentsEntry 
INNER JOIN Submittable ON Submittable.SubmittableId = TableOfContentsEntry.Submittable
WHERE TeamToCAccess.UnlockTime > DATEADD(hh,-48,GETUTCDATE())
UNION
SELECT        
    Call.CallId AS Id, 
    Team.Name AS TeamName, 
    Team.TeamId AS TeamId, 
    Team.Color AS TeamColor, 
    'CallStarted' AS AggregatedContentType, 
    Call.CallStart AS LastUpdated, 
    CASE
        WHEN Call.CallType = 'TeamFree' THEN 1
        WHEN Call.CallType = 'TeamHelp' THEN 2
        ELSE 0
    END AS NumericValue,
    Participant.FirstName + ' ' + Participant.LastName AS EpicWords, 
    0 AS HasAdditionalImage, 
    Team.EventInstance AS EventInstance
FROM Call 
INNER JOIN Team ON Team.TeamId = Call.Team 
INNER JOIN Participant ON Participant.ParticipantId = Call.Participant
WHERE
    Call.CallEnd IS NULL 
    AND Call.CallStart > DATEADD(hh,-48,GETUTCDATE())
UNION
SELECT        
    Call.CallId AS Id, 
    Team.Name AS TeamName, 
    Team.TeamId AS TeamId, 
    Team.Color AS TeamColor, 
    'CallEnded' AS AggregatedContentType, 
    Call.CallEnd AS LastUpdated, 
    CASE
        WHEN Call.CallType = 'TeamFree' THEN 1
        WHEN Call.CallType = 'TeamHelp' THEN 2
        ELSE 0
    END AS NumericValue,
    Participant.FirstName + ' ' + Participant.LastName AS EpicWords, 
    0 AS HasAdditionalImage, 
    Team.EventInstance AS EventInstance
FROM Call 
INNER JOIN Team ON Team.TeamId = Call.Team 
INNER JOIN Participant ON Participant.ParticipantId = Call.Participant
WHERE        
    Call.CallEnd IS NOT NULL 
    AND Call.CallEnd > DATEADD(hh,-48,GETUTCDATE())
UNION
SELECT     
    AchievementUnlock.AchievementId AS Id, 
    Team.Name AS TeamName, 
    Team.TeamId AS TeamId, 
    Team.Color AS TeamColor, 
    'AchievementUnlock' AS AggregatedContentType, 
    UnlockedOn AS LastUpdated, 
    NULL AS NumericValue, 
    Achievement.Name AS EpicWords, 
    0 AS HasAdditionalImage, 
    Team.EventInstance AS EventInstance
FROM AchievementUnlock 
INNER JOIN Achievement ON Achievement.AchievementId = AchievementUnlock.AchievementId 
INNER JOIN Team ON Team.TeamId = AchievementUnlock.TeamId
WHERE AchievementUnlock.UnlockedOn > DATEADD(hh,-48,GETUTCDATE())
UNION
SELECT        
    UniqueId AS Id, 
    Team.Name AS TeamName, 
    Team.TeamId AS TeamId, 
    Team.Color AS TeamColor, 
    'PointsAward' AS AggregatedContentType, 
    LastUpdated AS LastUpdated, 
    PointTransaction.PointValue AS NumericValue, 
    Reason AS EpicWords, 
    0 AS HasAdditionalImage, 
    Team.EventInstance AS EventInstance
FROM PointTransaction 
INNER JOIN Team ON PointTransaction.Team = Team.TeamId
UNION
SELECT        
    MessageId AS Id, 
    Team.Name AS TeamName, 
    Team.TeamId AS TeamId, 
    Team.Color AS TeamColor, 
    'GcMessage' AS AggregatedContentType, 
    LastUpdated AS LastUpdated, 
    NULL AS NumericValue,
    MessageText AS EpicWords, 
    0 AS HasAdditionalImage, 
    Team.EventInstance AS EventInstance
FROM GcMessages 
INNER JOIN Team ON GcMessages.Team = Team.TeamId
WHERE GcMessages.LastUpdated > DATEADD(hh,-48,GETUTCDATE())
UNION
SELECT 
    ChallengeSubmissionId AS Id, 
    Team.Name as TeamName, 
    Team.TeamId AS TeamId, 
    Team.Color AS TeamColor, 
    'ChallengeSubmission' AS AggregatedContentType, 
    LastChanged as LastUpdated, 
    NULL AS NumericValue, 
    CASE
        WHEN ChallengeSubmission.SubmissionTextContent IS NULL
        THEN ChallengeSubmission.SubmissionNotes
        ELSE ChallengeSubmission.SubmissionTextContent + ' (' + ChallengeSubmission.SubmissionNotes + ')'
    END AS EpicWords, 
    CASE
        WHEN ChallengeSubmission.SubmissionBinaryContent IS NULL
        THEN 0
        ELSE 1
    END AS HasAdditionalImage, 
    Team.EventInstance AS EventInstance
FROM ChallengeSubmission
          INNER JOIN Participation on Participation.ParticipationId = ChallengeSubmission.Participant
          INNER JOIN Team on Participation.Team = Team.TeamId
WHERE ChallengeSubmission.LastChanged > DATEADD(hh,-48,GETUTCDATE())
GO
/****** Object:  Table [dbo].[AchievementRelationship] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AchievementRelationship](
    [AchievementId] [uniqueidentifier] NOT NULL,
    [EventInstanceId] [uniqueidentifier] NOT NULL,
    [AnswerId] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_AchievementRelationship_1] PRIMARY KEY CLUSTERED 
(
    [AchievementId] ASC,
    [EventInstanceId] ASC,
    [AnswerId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[AdditionalContent] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AdditionalContent](
	[ContentId] [uniqueidentifier] NOT NULL,
	[ContentType] [nchar](10) NOT NULL,
	[Name] [nvarchar](255) NOT NULL,
	[ShortName] [nvarchar](50) NULL,
	[FileName] [nvarchar](255) NULL,
	[RawData] [varbinary](max) NULL,
	[LastUpdate] [datetime] NOT NULL,
	[EncryptionKey] [varbinary](max) NULL,
	[ContentText] [nvarchar](max) NULL,
    [UnlockedByAchievement] [uniqueidentifier] NULL,
 CONSTRAINT [PK_AdditionalContent] PRIMARY KEY CLUSTERED 
(
	[ContentId] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[AdditionalContentType] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AdditionalContentType](
    [ContentTypeId] [nchar](10) NOT NULL,
 CONSTRAINT [PK_AdditionalContentType] PRIMARY KEY CLUSTERED 
(
    [ContentTypeId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Challenge] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Challenge](
    [ChallengeId] [uniqueidentifier] NOT NULL,
    [EventInstance] [uniqueidentifier] NOT NULL,
    [Title] [nvarchar](max) NOT NULL,
    [Description] [nvarchar](max) NULL,
    [PointsAwarded] [bigint] NOT NULL,
    [StartTime] [datetime] NULL,
    [EndTime] [datetime] NULL,
    [LastUpdated] [datetime] NOT NULL,
 CONSTRAINT [PK_Challenge] PRIMARY KEY CLUSTERED 
(
    [ChallengeId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Event] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Event](
    [EventId] [uniqueidentifier] NOT NULL,
    [EventName] [nvarchar](100) NOT NULL,
 CONSTRAINT [PK_Event] PRIMARY KEY CLUSTERED 
(
    [EventId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[EventInstance] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EventInstance](
    [EventInstanceId] [uniqueidentifier] NOT NULL,
    [Event] [uniqueidentifier] NOT NULL,
    [EventType] [char](25) NOT NULL,
    [FriendlyName] [nvarchar](max) NULL,
    [StartTime] [datetime] NOT NULL,
    [EndTime] [datetime] NOT NULL,
 CONSTRAINT [PK_EventInstance] PRIMARY KEY CLUSTERED 
(
    [EventInstanceId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[ApiKey]  WITH CHECK ADD  CONSTRAINT [FK_ApiKey_EventInstance] FOREIGN KEY([EventInstance])
REFERENCES [dbo].[EventInstance] ([EventInstanceId])
GO

ALTER TABLE [dbo].[ApiKey] CHECK CONSTRAINT [FK_ApiKey_EventInstance]
GO

/****** Object:  Table [dbo].[EventType] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EventType](
    [EventTypeId] [char](25) NOT NULL,
 CONSTRAINT [PK_EventType] PRIMARY KEY CLUSTERED 
(
    [EventTypeId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Hold] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Hold](
    [HoldId] [uniqueidentifier] NOT NULL,
    [Team] [uniqueidentifier] NOT NULL,
    [StartParticipant] [uniqueidentifier] NOT NULL,
    [HoldStart] [datetime] NOT NULL,
    [EndParticipant] [uniqueidentifier] NULL,
    [HoldEnd] [datetime] NULL,
 CONSTRAINT [PK_Hold] PRIMARY KEY CLUSTERED 
(
    [HoldId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Location] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Location](
    [LocationId] [uniqueidentifier] NOT NULL,
    [Name] [nvarchar](max) NOT NULL,
    [Address] [nvarchar](max) NOT NULL,
    [Latitude] [decimal](16, 13) NOT NULL,
    [Longitude] [decimal](16, 13) NOT NULL,
    [LastUpdate] [datetime] NOT NULL,
    [LocationFlag] [int] NOT NULL,
 CONSTRAINT [PK_Location] PRIMARY KEY CLUSTERED 
(
    [LocationId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ParticipantLoginMsa] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ParticipantLoginMsa](
    [MicrosoftId] [uniqueidentifier] NOT NULL,
    [Participant] [uniqueidentifier] NOT NULL,
    [PrincipalName] [nvarchar](255) NOT NULL,
PRIMARY KEY CLUSTERED 
(
    [MicrosoftId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ParticipationLogin] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ParticipationLogin](
    [UserName] [nvarchar](50) NOT NULL,
    [HashedSaltedPassword] [varbinary](255) NOT NULL,
    [Salt] [varbinary](255) NOT NULL,
    [Participation] [uniqueidentifier] NOT NULL,
    [RequiresReset] [bit] NOT NULL,
    [Token] [nvarchar](max) NULL,
    [ResetId] [uniqueidentifier] NULL,
 CONSTRAINT [PK_ParticipationLogin] PRIMARY KEY CLUSTERED 
(
    [UserName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ParticipationToCRating] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ParticipationToCRating](
    [Participation] [uniqueidentifier] NOT NULL,
    [TableOfContentsEntry] [uniqueidentifier] NOT NULL,
    [Rating] [int] NOT NULL,
    [Comments] [nvarchar](max) NULL,
    [LastUpdated] [datetime] NULL,
 CONSTRAINT [PK_ParticipationToCRating] PRIMARY KEY CLUSTERED 
(
    [Participation] ASC,
    [TableOfContentsEntry] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ProximityUnlockRelationship] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ProximityUnlockRelationship](
    [ProximityId] [int] IDENTITY(1,1) NOT NULL,
    [MinLatitude] [decimal](16, 13) NOT NULL,
    [MinLongitude] [decimal](16, 13) NOT NULL,
    [MaxLatitude] [decimal](16, 13) NOT NULL,
    [MaxLongitude] [decimal](16, 13) NOT NULL,
    [ToC] [uniqueidentifier] NOT NULL,
    [LastUpdate] [datetime] NOT NULL,
    [Team] [uniqueidentifier] NULL,
    [ValidFrom] [datetime] NULL,
    [ValidTo] [datetime] NULL,
    [PrerequisiteToC] [uniqueidentifier] NULL,
 CONSTRAINT [PK_ProximityUnlockRelationship] PRIMARY KEY CLUSTERED 
(
    [ProximityId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PushUrls] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PushUrls](
    [DeviceId] [nvarchar](64) NOT NULL,
    [PushUrl] [nvarchar](500) NOT NULL,
    [TeamId] [uniqueidentifier] NOT NULL,
    [CreationDate] [datetime] NOT NULL,
    [LastUpdate] [datetime] NOT NULL,
 CONSTRAINT [PK_PushUrls] PRIMARY KEY CLUSTERED 
(
    [DeviceId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Settings] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Settings](
    [SettingId] [int] IDENTITY(1,1) NOT NULL,
    [EventInstanceId] [uniqueidentifier] NOT NULL,
    [Name] [nvarchar](255) NOT NULL,
    [SettingType] [char](10) NOT NULL,
    [StringValue] [nvarchar](max) NULL,
    [BinaryValue] [varbinary](max) NULL,
    [LastUpdated] [datetime] NOT NULL,
 CONSTRAINT [PK_Settings] PRIMARY KEY CLUSTERED 
(
    [SettingId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SettingType] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SettingType](
    [SettingType] [char](10) NOT NULL,
 CONSTRAINT [PK_SettingType] PRIMARY KEY CLUSTERED 
(
    [SettingType] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SqmData] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SqmData](
    [SqmId] [uniqueidentifier] NOT NULL,
    [Team] [uniqueidentifier] NULL,
    [Data] [nvarchar](max) NOT NULL,
    [LastUpdated] [datetime] NOT NULL,
    [TimeCollected] [datetime] NOT NULL,
    [Participation] [uniqueidentifier] NULL,
 CONSTRAINT [PK_SqmData] PRIMARY KEY CLUSTERED 
(
    [SqmId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SubmittableType] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SubmittableType](
    [SubmittableTypeId] [nchar](10) NOT NULL,
 CONSTRAINT [PK_SubmittableType] PRIMARY KEY CLUSTERED 
(
    [SubmittableTypeId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SubmittableUnlockRelationship] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SubmittableUnlockRelationship](
    [Answer] [uniqueidentifier] NOT NULL,
    [TableOfContentsEntry] [uniqueidentifier] NOT NULL,
    [LastUpdated] [datetime] NOT NULL,
    [Team] [uniqueidentifier] NULL,
 CONSTRAINT [PK_SubmittableUnlockRelationship] PRIMARY KEY CLUSTERED 
(
    [Answer] ASC,
    [TableOfContentsEntry] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TeamLocation] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TeamLocation](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [Team] [uniqueidentifier] NULL,
    [TimeCollected] [datetime] NULL,
    [LastUpdated] [datetime] NOT NULL,
    [Latitude] [decimal](16, 13) NOT NULL,
    [Longitude] [decimal](16, 13) NOT NULL,
    [ErrorRadius] [float] NULL,
    [SensorId] [uniqueidentifier] NULL,
    [SensorTypeId] [uniqueidentifier] NULL,
    [SensorName] [nvarchar](255) NULL,
    [Participation] [uniqueidentifier] NULL,
 CONSTRAINT [PK_TeamLocation] PRIMARY KEY CLUSTERED 
(
    [Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TeamLocationCache] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TeamLocationCache](
    [Team] [uniqueidentifier] NULL,
    [TimeCollected] [datetime] NULL,
    [Latitude] [decimal](16, 13) NOT NULL,
    [Longitude] [decimal](16, 13) NOT NULL,
    [ErrorRadius] [float] NULL,
    [SensorId] [uniqueidentifier] NULL,
    [SensorTypeId] [uniqueidentifier] NULL,
    [SensorName] [nvarchar](255) NULL,
    [Participation] [uniqueidentifier] NULL
) ON [PRIMARY]
GO
/****** Object:  Index [TeamLocation_Team_Participation_IX] ******/
CREATE UNIQUE CLUSTERED INDEX [TeamLocation_Team_Participation_IX] ON [dbo].[TeamLocationCache]
(
    [Team] ASC,
    [Participation] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ToCContent] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ToCContent](
    [Id] [uniqueidentifier] NOT NULL,
    [TableOfContentsEntry] [uniqueidentifier] NOT NULL,
    [LastUpdated] [datetime] NOT NULL,
    [Location] [uniqueidentifier] NULL,
    [AdditionalContent] [uniqueidentifier] NULL,
 CONSTRAINT [PK_TableofContentsContent] PRIMARY KEY CLUSTERED 
(
    [Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ToCInstance] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ToCInstance](
    [ToCInstanceId] [uniqueidentifier] NOT NULL,
    [TableOfContentsEntry] [uniqueidentifier] NOT NULL,
    [PrimaryStaff] [uniqueidentifier] NULL,
    [CurrentTeam] [uniqueidentifier] NULL,
    [FriendlyName] [nvarchar](max) NULL,
    [Notes] [nvarchar](max) NULL,
    [LastUpdated] [datetime] NOT NULL,
    [NeedsReset] [bit] NOT NULL,
 CONSTRAINT [PK_ToCInstance] PRIMARY KEY CLUSTERED 
(
    [ToCInstanceId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UnlockReason] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UnlockReason](
    [UnlockReasonId] [nchar](10) NOT NULL,
 CONSTRAINT [PK_UnlockReason] PRIMARY KEY CLUSTERED 
(
    [UnlockReasonId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Answer] ******/
CREATE UNIQUE NONCLUSTERED INDEX [IX_Answer] ON [dbo].[Answer]
(
    [Submittable] ASC,
    [AnswerText] ASC,
    [EventInstance] ASC,
    [AppliesToTeam] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Answer_AnswerText] ******/
CREATE NONCLUSTERED INDEX [IX_Answer_AnswerText] ON [dbo].[Answer]
(
    [AnswerText] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_ANSWER_EVENTINSTANCE] ******/
CREATE NONCLUSTERED INDEX [IX_ANSWER_EVENTINSTANCE] ON [dbo].[Answer]
(
    [EventInstance] ASC,
    [IsCorrectAnswer] ASC
)
INCLUDE([Submittable],[AnswerText],[AppliesToTeam]) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [nci_wi_Call_D5FB438CFC2D11AFB7E2BE684FAB5F7D] ******/
CREATE NONCLUSTERED INDEX [nci_wi_Call_D5FB438CFC2D11AFB7E2BE684FAB5F7D] ON [dbo].[Call]
(
    [Team] ASC,
    [CallEnd] ASC
)
INCLUDE([Participant]) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [nci_wi_GcMessages_CDEDBD635FAFCA8B8059580CBF17BB26] ******/
CREATE NONCLUSTERED INDEX [nci_wi_GcMessages_CDEDBD635FAFCA8B8059580CBF17BB26] ON [dbo].[GcMessages]
(
    [Team] ASC
)
INCLUDE([GcParticipation],[LastUpdated],[MessageText]) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [nci_wi_Participation_91B334A501635BAB349F6203B5DD53DE] ******/
CREATE NONCLUSTERED INDEX [nci_wi_Participation_91B334A501635BAB349F6203B5DD53DE] ON [dbo].[Participation]
(
    [Team] ASC
)
INCLUDE([Participant]) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Coordinates] ******/
CREATE NONCLUSTERED INDEX [IX_Coordinates] ON [dbo].[ProximityUnlockRelationship]
(
    [MaxLatitude] ASC,
    [MaxLongitude] ASC,
    [MinLatitude] ASC,
    [MinLongitude] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [nci_wi_Pulse_05E84DE3A913D3DD1826ABE8F8A3A875] ******/
CREATE NONCLUSTERED INDEX [nci_wi_Pulse_05E84DE3A913D3DD1826ABE8F8A3A875] ON [dbo].[Pulse]
(
    [Team] ASC
)
INCLUDE([LastUpdated],[PulseRating]) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [nci_wi_Pulse_4514FAAC884FD8FAE3FE64C492CDBF81] ******/
CREATE NONCLUSTERED INDEX [nci_wi_Pulse_4514FAAC884FD8FAE3FE64C492CDBF81] ON [dbo].[Pulse]
(
    [Participation] ASC
)
INCLUDE([LastUpdated],[PulseRating],[PulseText],[TeamPic]) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_SettingsName] ******/
CREATE UNIQUE NONCLUSTERED INDEX [IX_SettingsName] ON [dbo].[Settings]
(
    [Name] ASC,
    [EventInstanceId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [nci_wi_Submission_3727D249720C9A74C01244772FB3E0F0] ******/
CREATE NONCLUSTERED INDEX [nci_wi_Submission_3727D249720C9A74C01244772FB3E0F0] ON [dbo].[Submission]
(
    [Team] ASC,
    [SubmissionTime] ASC
)
INCLUDE([Participation],[Submission],[Submittable]) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [nci_wi_Submission_F2EB472AA5441CB8B146] ******/
CREATE NONCLUSTERED INDEX [nci_wi_Submission_F2EB472AA5441CB8B146] ON [dbo].[Submission]
(
    [Submittable] ASC,
    [Team] ASC
)
INCLUDE([Participation],[Submission],[SubmissionId],[SubmissionTime]) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Team] ******/
CREATE NONCLUSTERED INDEX [IX_Team] ON [dbo].[Team]
(
    [ShortName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[AchievementUnlock] ADD  CONSTRAINT [DF_AchievementUnlock_UnlockedOn]  DEFAULT (getutcdate()) FOR [UnlockedOn]
GO
ALTER TABLE [dbo].[AdditionalContent] ADD  CONSTRAINT [DF_AdditionalContent_LastUpdate]  DEFAULT (getutcdate()) FOR [LastUpdate]
GO
ALTER TABLE [dbo].[Answer] ADD  CONSTRAINT [DF_Answer_LastUpdated]  DEFAULT (getutcdate()) FOR [LastUpdated]
GO
ALTER TABLE [dbo].[Answer] ADD  CONSTRAINT [DF_Answer_IsHidden]  DEFAULT ((0)) FOR [IsHidden]
GO
ALTER TABLE [dbo].[Call] ADD  CONSTRAINT [DF_Call_CallId]  DEFAULT (newid()) FOR [CallId]
GO
ALTER TABLE [dbo].[Call] ADD  CONSTRAINT [DF_Call_LastUpdated]  DEFAULT (getutcdate()) FOR [LastUpdated]
GO
ALTER TABLE [dbo].[Challenge] ADD  CONSTRAINT [DF_Challenge_ChallengeId]  DEFAULT (newid()) FOR [ChallengeId]
GO
ALTER TABLE [dbo].[Challenge] ADD  CONSTRAINT [DF_Challenge_LastUpdated]  DEFAULT (getutcdate()) FOR [LastUpdated]
GO
ALTER TABLE [dbo].[Challenge] ADD  CONSTRAINT [DF_Challenge_PointsAwarded]  DEFAULT (0) FOR [PointsAwarded]
GO
ALTER TABLE [dbo].[GcMessages] ADD  CONSTRAINT [DF_GcMessages_MessageId]  DEFAULT (newid()) FOR [MessageId]
GO
ALTER TABLE [dbo].[GcMessages] ADD  CONSTRAINT [DF_GcMessages_LastUpdated]  DEFAULT (getutcdate()) FOR [LastUpdated]
GO
ALTER TABLE [dbo].[Hold] ADD  CONSTRAINT [DF_Hold_HoldId]  DEFAULT (newid()) FOR [HoldId]
GO
ALTER TABLE [dbo].[Location] ADD  CONSTRAINT [DF_Location_LastUpdate]  DEFAULT (getutcdate()) FOR [LastUpdate]
GO
ALTER TABLE [dbo].[Location] ADD  DEFAULT ((0)) FOR [LocationFlag]
GO
ALTER TABLE [dbo].[Participant] ADD  CONSTRAINT [DF_Participant_ParticipantId]  DEFAULT (newid()) FOR [ParticipantId]
GO
ALTER TABLE [dbo].[Participant] ADD  CONSTRAINT [DF_Participant_LastChanged]  DEFAULT (getutcdate()) FOR [LastChanged]
GO
ALTER TABLE [dbo].[Participant] ADD  DEFAULT ((0)) FOR [AdditionalRoles]
GO
ALTER TABLE [dbo].[Participation] ADD  CONSTRAINT [DF_Participation_ParticipationId]  DEFAULT (newid()) FOR [ParticipationId]
GO
ALTER TABLE [dbo].[Participation] ADD  CONSTRAINT [DF_Participation_LastUpdated]  DEFAULT (getutcdate()) FOR [LastUpdated]
GO
ALTER TABLE [dbo].[Participation] ADD  CONSTRAINT [DF_Participation_IsAdmin]  DEFAULT ((0)) FOR [IsAdmin]
GO
ALTER TABLE [dbo].[ParticipationLogin] ADD  CONSTRAINT [DF_ParticipationLogin_RequiresReset]  DEFAULT ((0)) FOR [RequiresReset]
GO
ALTER TABLE [dbo].[ParticipationToCRating] ADD  CONSTRAINT [DF_ParticipationToCRating_LastUpdated]  DEFAULT (getdate()) FOR [LastUpdated]
GO
ALTER TABLE [dbo].[PointTransaction] ADD  CONSTRAINT [DF_PointTransaction_LastUpdated]  DEFAULT (getutcdate()) FOR [LastUpdated]
GO
ALTER TABLE [dbo].[PointTransaction] ADD  CONSTRAINT [DF_PointTransaction_UniqueId]  DEFAULT (newid()) FOR [UniqueId]
GO
ALTER TABLE [dbo].[ProximityUnlockRelationship] ADD  CONSTRAINT [DF_ProximityUnlockRelationship_LastUpdate]  DEFAULT (getutcdate()) FOR [LastUpdate]
GO
ALTER TABLE [dbo].[Pulse] ADD  CONSTRAINT [DF_Pulse_LastUpdated]  DEFAULT (getutcdate()) FOR [LastUpdated]
GO
ALTER TABLE [dbo].[Settings] ADD  CONSTRAINT [DF_Settings_LastUpdated]  DEFAULT (getutcdate()) FOR [LastUpdated]
GO
ALTER TABLE [dbo].[SqmData] ADD  CONSTRAINT [DF_SqmData_SqmId]  DEFAULT (newid()) FOR [SqmId]
GO
ALTER TABLE [dbo].[SqmData] ADD  CONSTRAINT [DF_SqmData_LastUpdated]  DEFAULT (getutcdate()) FOR [LastUpdated]
GO
ALTER TABLE [dbo].[SqmData] ADD  CONSTRAINT [DF_SqmData_TimeCollected]  DEFAULT (getutcdate()) FOR [TimeCollected]
GO
ALTER TABLE [dbo].[SubmittableUnlockRelationship] ADD  CONSTRAINT [DF_SubmittableUnlockRelationship_LastUpdated]  DEFAULT (getutcdate()) FOR [LastUpdated]
GO
ALTER TABLE [dbo].[Team] ADD  CONSTRAINT [DF_Team_LastUpdate]  DEFAULT (getutcdate()) FOR [LastUpdate]
GO
ALTER TABLE [dbo].[Team] ADD  CONSTRAINT [DF_Team_Points]  DEFAULT ((0)) FOR [Points]
GO
ALTER TABLE [dbo].[Team] ADD  CONSTRAINT [DF_Team_IsTestTeam]  DEFAULT ((0)) FOR [IsTestTeam]
GO
ALTER TABLE [dbo].[TeamLocation] ADD  CONSTRAINT [DF_TeamLocation_LastUpdated]  DEFAULT (getutcdate()) FOR [LastUpdated]
GO
ALTER TABLE [dbo].[TeamToCAccess] ADD  CONSTRAINT [DF_TeamToCAccess_UnlockTime]  DEFAULT (getutcdate()) FOR [UnlockTime]
GO
ALTER TABLE [dbo].[ToCContent] ADD  CONSTRAINT [DF_TableofContentsContent_LastUpdated]  DEFAULT (getutcdate()) FOR [LastUpdated]
GO
ALTER TABLE [dbo].[ToCInstance] ADD  CONSTRAINT [DF_ToCInstance_ToCInstanceId]  DEFAULT (newid()) FOR [ToCInstanceId]
GO
ALTER TABLE [dbo].[ToCInstance] ADD  CONSTRAINT [NeedsReset_Default_Value]  DEFAULT ((0)) FOR [NeedsReset]
GO
ALTER TABLE [dbo].[Achievement]  WITH CHECK ADD  CONSTRAINT [FK_Achievement_Event] FOREIGN KEY([EventId])
REFERENCES [dbo].[Event] ([EventId])
GO
ALTER TABLE [dbo].[Achievement] CHECK CONSTRAINT [FK_Achievement_Event]
GO
ALTER TABLE [dbo].[AchievementRelationship]  WITH CHECK ADD  CONSTRAINT [FK_AchievementRelationship_Achievement] FOREIGN KEY([AchievementId])
REFERENCES [dbo].[Achievement] ([AchievementId])
GO
ALTER TABLE [dbo].[AchievementRelationship] CHECK CONSTRAINT [FK_AchievementRelationship_Achievement]
GO
ALTER TABLE [dbo].[AchievementRelationship]  WITH CHECK ADD  CONSTRAINT [FK_AchievementRelationship_Answer] FOREIGN KEY([AnswerId])
REFERENCES [dbo].[Answer] ([AnswerId])
GO
ALTER TABLE [dbo].[AchievementRelationship] CHECK CONSTRAINT [FK_AchievementRelationship_Answer]
GO
ALTER TABLE [dbo].[AchievementRelationship]  WITH CHECK ADD  CONSTRAINT [FK_AchievementRelationship_EventInstance] FOREIGN KEY([EventInstanceId])
REFERENCES [dbo].[EventInstance] ([EventInstanceId])
GO
ALTER TABLE [dbo].[AchievementRelationship] CHECK CONSTRAINT [FK_AchievementRelationship_EventInstance]
GO
ALTER TABLE [dbo].[AchievementUnlock]  WITH CHECK ADD  CONSTRAINT [FK_AchievementUnlock_Achievement] FOREIGN KEY([AchievementId])
REFERENCES [dbo].[Achievement] ([AchievementId])
GO
ALTER TABLE [dbo].[AchievementUnlock] CHECK CONSTRAINT [FK_AchievementUnlock_Achievement]
GO
ALTER TABLE [dbo].[AchievementUnlock]  WITH CHECK ADD  CONSTRAINT [FK_AchievementUnlock_Participant] FOREIGN KEY([ParticipantId])
REFERENCES [dbo].[Participant] ([ParticipantId])
GO
ALTER TABLE [dbo].[AchievementUnlock] CHECK CONSTRAINT [FK_AchievementUnlock_Participant]
GO
ALTER TABLE [dbo].[AchievementUnlock]  WITH CHECK ADD  CONSTRAINT [FK_AchievementUnlock_Team] FOREIGN KEY([TeamId])
REFERENCES [dbo].[Team] ([TeamId])
GO
ALTER TABLE [dbo].[AchievementUnlock] CHECK CONSTRAINT [FK_AchievementUnlock_Team]
GO
ALTER TABLE [dbo].[AdditionalContent]  WITH CHECK ADD  CONSTRAINT [FK_AdditionalContent_AdditionalContentType] FOREIGN KEY([ContentType])
REFERENCES [dbo].[AdditionalContentType] ([ContentTypeId])
GO
ALTER TABLE [dbo].[AdditionalContent] CHECK CONSTRAINT [FK_AdditionalContent_AdditionalContentType]
GO
ALTER TABLE [dbo].[Answer]  WITH CHECK ADD FOREIGN KEY([AdditionalContent])
REFERENCES [dbo].[AdditionalContent] ([ContentId])
GO
ALTER TABLE [dbo].[Answer]  WITH CHECK ADD  CONSTRAINT [FK_Answer_EventInstance] FOREIGN KEY([EventInstance])
REFERENCES [dbo].[EventInstance] ([EventInstanceId])
GO
ALTER TABLE [dbo].[Answer] CHECK CONSTRAINT [FK_Answer_EventInstance]
GO
ALTER TABLE [dbo].[Answer]  WITH CHECK ADD  CONSTRAINT [FK_Answer_Submittable] FOREIGN KEY([Submittable])
REFERENCES [dbo].[Submittable] ([SubmittableId])
GO
ALTER TABLE [dbo].[Answer] CHECK CONSTRAINT [FK_Answer_Submittable]
GO
ALTER TABLE [dbo].[Call]  WITH CHECK ADD  CONSTRAINT [FK_Call_Participant] FOREIGN KEY([Participant])
REFERENCES [dbo].[Participant] ([ParticipantId])
GO
ALTER TABLE [dbo].[Call] CHECK CONSTRAINT [FK_Call_Participant]
GO
ALTER TABLE [dbo].[Call]  WITH CHECK ADD  CONSTRAINT [FK_Call_TableOfContentsEntry] FOREIGN KEY([ToCEntry])
REFERENCES [dbo].[TableOfContentsEntry] ([TableOfContentId])
GO
ALTER TABLE [dbo].[Call] CHECK CONSTRAINT [FK_Call_TableOfContentsEntry]
GO
ALTER TABLE [dbo].[Call]  WITH CHECK ADD  CONSTRAINT [FK_Call_Team] FOREIGN KEY([Team])
REFERENCES [dbo].[Team] ([TeamId])
GO
ALTER TABLE [dbo].[Call] CHECK CONSTRAINT [FK_Call_Team]
GO
ALTER TABLE [dbo].[Challenge]  WITH CHECK ADD  CONSTRAINT [FK_Challenge_EventInstance] FOREIGN KEY([EventInstance])
REFERENCES [dbo].[EventInstance] ([EventInstanceId])
GO
ALTER TABLE [dbo].[Challenge] CHECK CONSTRAINT [FK_Challenge_EventInstance]
GO
ALTER TABLE [dbo].[ChallengeSubmission]  WITH CHECK ADD  CONSTRAINT [FK_ChallengeSubmission_Challenge] FOREIGN KEY([Challenge])
REFERENCES [dbo].[Challenge] ([ChallengeId])
GO
ALTER TABLE [dbo].[ChallengeSubmission] CHECK CONSTRAINT [FK_ChallengeSubmission_Challenge]
GO
ALTER TABLE [dbo].[ChallengeSubmission]  WITH CHECK ADD  CONSTRAINT [FK_ChallengeSubmission_Participation] FOREIGN KEY([Participant])
REFERENCES [dbo].[Participation] ([ParticipationId])
GO
ALTER TABLE [dbo].[ChallengeSubmission] CHECK CONSTRAINT [FK_ChallengeSubmission_Participation]
GO
ALTER TABLE [dbo].[ChallengeSubmission]  WITH CHECK ADD  CONSTRAINT [FK_ChallengeSubmission_Participation1] FOREIGN KEY([Approver])
REFERENCES [dbo].[Participation] ([ParticipationId])
GO
ALTER TABLE [dbo].[ChallengeSubmission] CHECK CONSTRAINT [FK_ChallengeSubmission_Participation1]
GO
ALTER TABLE [dbo].[EventInstance]  WITH CHECK ADD  CONSTRAINT [FK_EventInstance_Event] FOREIGN KEY([Event])
REFERENCES [dbo].[Event] ([EventId])
GO
ALTER TABLE [dbo].[EventInstance] CHECK CONSTRAINT [FK_EventInstance_Event]
GO
ALTER TABLE [dbo].[EventInstance]  WITH CHECK ADD  CONSTRAINT [FK_EventInstance_EventType] FOREIGN KEY([EventType])
REFERENCES [dbo].[EventType] ([EventTypeId])
GO
ALTER TABLE [dbo].[EventInstance] CHECK CONSTRAINT [FK_EventInstance_EventType]
GO
ALTER TABLE [dbo].[GcMessages]  WITH CHECK ADD  CONSTRAINT [FK_GcMessages_Participation] FOREIGN KEY([GcParticipation])
REFERENCES [dbo].[Participation] ([ParticipationId])
GO
ALTER TABLE [dbo].[GcMessages] CHECK CONSTRAINT [FK_GcMessages_Participation]
GO
ALTER TABLE [dbo].[GcMessages]  WITH CHECK ADD  CONSTRAINT [FK_GcMessages_Team] FOREIGN KEY([Team])
REFERENCES [dbo].[Team] ([TeamId])
GO
ALTER TABLE [dbo].[GcMessages] CHECK CONSTRAINT [FK_GcMessages_Team]
GO
ALTER TABLE [dbo].[Hold]  WITH CHECK ADD  CONSTRAINT [FK_Hold_Participant] FOREIGN KEY([StartParticipant])
REFERENCES [dbo].[Participant] ([ParticipantId])
GO
ALTER TABLE [dbo].[Hold] CHECK CONSTRAINT [FK_Hold_Participant]
GO
ALTER TABLE [dbo].[Hold]  WITH CHECK ADD  CONSTRAINT [FK_Hold_Participant1] FOREIGN KEY([EndParticipant])
REFERENCES [dbo].[Participant] ([ParticipantId])
GO
ALTER TABLE [dbo].[Hold] CHECK CONSTRAINT [FK_Hold_Participant1]
GO
ALTER TABLE [dbo].[Hold]  WITH CHECK ADD  CONSTRAINT [FK_Hold_Team] FOREIGN KEY([Team])
REFERENCES [dbo].[Team] ([TeamId])
GO
ALTER TABLE [dbo].[Hold] CHECK CONSTRAINT [FK_Hold_Team]
GO
ALTER TABLE [dbo].[Participant]  WITH CHECK ADD  CONSTRAINT [FK_Participant_Participation] FOREIGN KEY([DefaultParticipation])
REFERENCES [dbo].[Participation] ([ParticipationId])
GO
ALTER TABLE [dbo].[Participant] CHECK CONSTRAINT [FK_Participant_Participation]
GO
ALTER TABLE [dbo].[ParticipantLoginMsa]  WITH CHECK ADD  CONSTRAINT [FK_ParticipationLoginMsa_Participant] FOREIGN KEY([Participant])
REFERENCES [dbo].[Participant] ([ParticipantId])
GO
ALTER TABLE [dbo].[ParticipantLoginMsa] CHECK CONSTRAINT [FK_ParticipationLoginMsa_Participant]
GO
ALTER TABLE [dbo].[Participation]  WITH CHECK ADD  CONSTRAINT [FK_Participation_EventInstance] FOREIGN KEY([EventInstance])
REFERENCES [dbo].[EventInstance] ([EventInstanceId])
GO
ALTER TABLE [dbo].[Participation] CHECK CONSTRAINT [FK_Participation_EventInstance]
GO
ALTER TABLE [dbo].[Participation]  WITH CHECK ADD  CONSTRAINT [FK_Participation_Participant] FOREIGN KEY([Participant])
REFERENCES [dbo].[Participant] ([ParticipantId])
GO
ALTER TABLE [dbo].[Participation] CHECK CONSTRAINT [FK_Participation_Participant]
GO
ALTER TABLE [dbo].[Participation]  WITH CHECK ADD  CONSTRAINT [FK_Participation_Team] FOREIGN KEY([Team])
REFERENCES [dbo].[Team] ([TeamId])
GO
ALTER TABLE [dbo].[Participation] CHECK CONSTRAINT [FK_Participation_Team]
GO
ALTER TABLE [dbo].[ParticipationLogin]  WITH CHECK ADD  CONSTRAINT [FK_ParticipationLogin_Participation] FOREIGN KEY([Participation])
REFERENCES [dbo].[Participation] ([ParticipationId])
GO
ALTER TABLE [dbo].[ParticipationLogin] CHECK CONSTRAINT [FK_ParticipationLogin_Participation]
GO
ALTER TABLE [dbo].[ParticipationToCRating]  WITH CHECK ADD  CONSTRAINT [FK_ParticipationToCRating_Participation] FOREIGN KEY([Participation])
REFERENCES [dbo].[Participation] ([ParticipationId])
GO
ALTER TABLE [dbo].[ParticipationToCRating] CHECK CONSTRAINT [FK_ParticipationToCRating_Participation]
GO
ALTER TABLE [dbo].[ParticipationToCRating]  WITH CHECK ADD  CONSTRAINT [FK_ParticipationToCRating_TableOfContentsEntry] FOREIGN KEY([TableOfContentsEntry])
REFERENCES [dbo].[TableOfContentsEntry] ([TableOfContentId])
GO
ALTER TABLE [dbo].[ParticipationToCRating] CHECK CONSTRAINT [FK_ParticipationToCRating_TableOfContentsEntry]
GO
ALTER TABLE [dbo].[PointTransaction]  WITH CHECK ADD  CONSTRAINT [FK_PointTransaction_EventInstance] FOREIGN KEY([EventInstance])
REFERENCES [dbo].[EventInstance] ([EventInstanceId])
GO
ALTER TABLE [dbo].[PointTransaction] CHECK CONSTRAINT [FK_PointTransaction_EventInstance]
GO
ALTER TABLE [dbo].[PointTransaction]  WITH CHECK ADD  CONSTRAINT [FK_PointTransaction_Participation] FOREIGN KEY([Participation])
REFERENCES [dbo].[Participation] ([ParticipationId])
GO
ALTER TABLE [dbo].[PointTransaction] CHECK CONSTRAINT [FK_PointTransaction_Participation]
GO
ALTER TABLE [dbo].[PointTransaction]  WITH CHECK ADD  CONSTRAINT [FK_PointTransaction_Team] FOREIGN KEY([Team])
REFERENCES [dbo].[Team] ([TeamId])
GO
ALTER TABLE [dbo].[PointTransaction] CHECK CONSTRAINT [FK_PointTransaction_Team]
GO
ALTER TABLE [dbo].[ProximityUnlockRelationship]  WITH CHECK ADD  CONSTRAINT [FK_ProximityUnlockRelationship_TableOfContentsEntry] FOREIGN KEY([ToC])
REFERENCES [dbo].[TableOfContentsEntry] ([TableOfContentId])
GO
ALTER TABLE [dbo].[ProximityUnlockRelationship] CHECK CONSTRAINT [FK_ProximityUnlockRelationship_TableOfContentsEntry]
GO
ALTER TABLE [dbo].[ProximityUnlockRelationship]  WITH CHECK ADD  CONSTRAINT [FK_ProximityUnlockRelationship_TableOfContentsEntry1] FOREIGN KEY([PrerequisiteToC])
REFERENCES [dbo].[TableOfContentsEntry] ([TableOfContentId])
GO
ALTER TABLE [dbo].[ProximityUnlockRelationship] CHECK CONSTRAINT [FK_ProximityUnlockRelationship_TableOfContentsEntry1]
GO
ALTER TABLE [dbo].[ProximityUnlockRelationship]  WITH CHECK ADD  CONSTRAINT [FK_ProximityUnlockRelationship_Team] FOREIGN KEY([Team])
REFERENCES [dbo].[Team] ([TeamId])
GO
ALTER TABLE [dbo].[ProximityUnlockRelationship] CHECK CONSTRAINT [FK_ProximityUnlockRelationship_Team]
GO
ALTER TABLE [dbo].[Pulse]  WITH CHECK ADD  CONSTRAINT [FK_Pulse_Participation] FOREIGN KEY([Participation])
REFERENCES [dbo].[Participation] ([ParticipationId])
GO
ALTER TABLE [dbo].[Pulse] CHECK CONSTRAINT [FK_Pulse_Participation]
GO
ALTER TABLE [dbo].[Pulse]  WITH CHECK ADD  CONSTRAINT [FK_Pulse_Team] FOREIGN KEY([Team])
REFERENCES [dbo].[Team] ([TeamId])
GO
ALTER TABLE [dbo].[Pulse] CHECK CONSTRAINT [FK_Pulse_Team]
GO
ALTER TABLE [dbo].[PushUrls]  WITH CHECK ADD  CONSTRAINT [FK_PushUrls_Team] FOREIGN KEY([TeamId])
REFERENCES [dbo].[Team] ([TeamId])
GO
ALTER TABLE [dbo].[PushUrls] CHECK CONSTRAINT [FK_PushUrls_Team]
GO
ALTER TABLE [dbo].[Settings]  WITH CHECK ADD  CONSTRAINT [FK_Settings_EventInstance] FOREIGN KEY([EventInstanceId])
REFERENCES [dbo].[EventInstance] ([EventInstanceId])
GO
ALTER TABLE [dbo].[Settings] CHECK CONSTRAINT [FK_Settings_EventInstance]
GO
ALTER TABLE [dbo].[Settings]  WITH CHECK ADD  CONSTRAINT [FK_Settings_SettingType] FOREIGN KEY([SettingType])
REFERENCES [dbo].[SettingType] ([SettingType])
GO
ALTER TABLE [dbo].[Settings] CHECK CONSTRAINT [FK_Settings_SettingType]
GO
ALTER TABLE [dbo].[SqmData]  WITH CHECK ADD  CONSTRAINT [FK_SqmData_Participation] FOREIGN KEY([Participation])
REFERENCES [dbo].[Participation] ([ParticipationId])
GO
ALTER TABLE [dbo].[SqmData] CHECK CONSTRAINT [FK_SqmData_Participation]
GO
ALTER TABLE [dbo].[SqmData]  WITH CHECK ADD  CONSTRAINT [FK_SqmData_Team] FOREIGN KEY([Team])
REFERENCES [dbo].[Team] ([TeamId])
GO
ALTER TABLE [dbo].[SqmData] CHECK CONSTRAINT [FK_SqmData_Team]
GO
ALTER TABLE [dbo].[Submission]  WITH CHECK ADD  CONSTRAINT [FK_Submission_Participation] FOREIGN KEY([Participation])
REFERENCES [dbo].[Participation] ([ParticipationId])
GO
ALTER TABLE [dbo].[Submission] CHECK CONSTRAINT [FK_Submission_Participation]
GO
ALTER TABLE [dbo].[Submission]  WITH CHECK ADD  CONSTRAINT [FK_Submission_Submittable] FOREIGN KEY([Submittable])
REFERENCES [dbo].[Submittable] ([SubmittableId])
GO
ALTER TABLE [dbo].[Submission] CHECK CONSTRAINT [FK_Submission_Submittable]
GO
ALTER TABLE [dbo].[Submission]  WITH CHECK ADD  CONSTRAINT [FK_Submission_Team] FOREIGN KEY([Team])
REFERENCES [dbo].[Team] ([TeamId])
GO
ALTER TABLE [dbo].[Submission] CHECK CONSTRAINT [FK_Submission_Team]
GO
ALTER TABLE [dbo].[Submittable]  WITH CHECK ADD  CONSTRAINT [FK_Submittable_SubmittableType] FOREIGN KEY([SubmittableType])
REFERENCES [dbo].[SubmittableType] ([SubmittableTypeId])
GO
ALTER TABLE [dbo].[Submittable] CHECK CONSTRAINT [FK_Submittable_SubmittableType]
GO
ALTER TABLE [dbo].[SubmittableUnlockRelationship]  WITH CHECK ADD  CONSTRAINT [FK_SubmittableUnlockRelationship_Submittable] FOREIGN KEY([Answer])
REFERENCES [dbo].[Answer] ([AnswerId])
GO
ALTER TABLE [dbo].[SubmittableUnlockRelationship] CHECK CONSTRAINT [FK_SubmittableUnlockRelationship_Submittable]
GO
ALTER TABLE [dbo].[SubmittableUnlockRelationship]  WITH CHECK ADD  CONSTRAINT [FK_SubmittableUnlockRelationship_TableOfContentsEntry] FOREIGN KEY([TableOfContentsEntry])
REFERENCES [dbo].[TableOfContentsEntry] ([TableOfContentId])
GO
ALTER TABLE [dbo].[SubmittableUnlockRelationship] CHECK CONSTRAINT [FK_SubmittableUnlockRelationship_TableOfContentsEntry]
GO
ALTER TABLE [dbo].[SubmittableUnlockRelationship]  WITH CHECK ADD  CONSTRAINT [FK_SubmittableUnlockRelationship_Team] FOREIGN KEY([Team])
REFERENCES [dbo].[Team] ([TeamId])
GO
ALTER TABLE [dbo].[SubmittableUnlockRelationship] CHECK CONSTRAINT [FK_SubmittableUnlockRelationship_Team]
GO
ALTER TABLE [dbo].[TableOfContentsEntry]  WITH CHECK ADD  CONSTRAINT [FK_TableOfContentsEntry_EventInstance] FOREIGN KEY([EventInstance])
REFERENCES [dbo].[EventInstance] ([EventInstanceId])
GO
ALTER TABLE [dbo].[TableOfContentsEntry] CHECK CONSTRAINT [FK_TableOfContentsEntry_EventInstance]
GO
ALTER TABLE [dbo].[TableOfContentsEntry]  WITH CHECK ADD  CONSTRAINT [FK_TableOfContentsEntry_Submittable] FOREIGN KEY([Submittable])
REFERENCES [dbo].[Submittable] ([SubmittableId])
GO
ALTER TABLE [dbo].[TableOfContentsEntry] CHECK CONSTRAINT [FK_TableOfContentsEntry_Submittable]
GO
ALTER TABLE [dbo].[Team]  WITH CHECK ADD  CONSTRAINT [FK_Team_EventInstance] FOREIGN KEY([EventInstance])
REFERENCES [dbo].[EventInstance] ([EventInstanceId])
GO
ALTER TABLE [dbo].[Team] CHECK CONSTRAINT [FK_Team_EventInstance]
GO
ALTER TABLE [dbo].[TeamLocation]  WITH CHECK ADD  CONSTRAINT [FK_TeamLocation_Participation] FOREIGN KEY([Participation])
REFERENCES [dbo].[Participation] ([ParticipationId])
GO
ALTER TABLE [dbo].[TeamLocation] CHECK CONSTRAINT [FK_TeamLocation_Participation]
GO
ALTER TABLE [dbo].[TeamLocation]  WITH CHECK ADD  CONSTRAINT [FK_TeamLocation_Team] FOREIGN KEY([Team])
REFERENCES [dbo].[Team] ([TeamId])
GO
ALTER TABLE [dbo].[TeamLocation] CHECK CONSTRAINT [FK_TeamLocation_Team]
GO
ALTER TABLE [dbo].[TeamLocationCache]  WITH CHECK ADD  CONSTRAINT [FK_TeamLocationCache_Participation] FOREIGN KEY([Participation])
REFERENCES [dbo].[Participation] ([ParticipationId])
GO
ALTER TABLE [dbo].[TeamLocationCache] CHECK CONSTRAINT [FK_TeamLocationCache_Participation]
GO
ALTER TABLE [dbo].[TeamLocationCache]  WITH CHECK ADD  CONSTRAINT [FK_TeamLocationCache_Team] FOREIGN KEY([Team])
REFERENCES [dbo].[Team] ([TeamId])
GO
ALTER TABLE [dbo].[TeamLocationCache] CHECK CONSTRAINT [FK_TeamLocationCache_Team]
GO
ALTER TABLE [dbo].[TeamToCAccess]  WITH CHECK ADD FOREIGN KEY([UnlockSubmission])
REFERENCES [dbo].[Submission] ([SubmissionId])
GO
ALTER TABLE [dbo].[TeamToCAccess]  WITH CHECK ADD  CONSTRAINT [FK_TeamToCAccess_TableOfContentsEntry] FOREIGN KEY([TableOfContentsEntry])
REFERENCES [dbo].[TableOfContentsEntry] ([TableOfContentId])
GO
ALTER TABLE [dbo].[TeamToCAccess] CHECK CONSTRAINT [FK_TeamToCAccess_TableOfContentsEntry]
GO
ALTER TABLE [dbo].[TeamToCAccess]  WITH CHECK ADD  CONSTRAINT [FK_TeamToCAccess_Team] FOREIGN KEY([Team])
REFERENCES [dbo].[Team] ([TeamId])
GO
ALTER TABLE [dbo].[TeamToCAccess] CHECK CONSTRAINT [FK_TeamToCAccess_Team]
GO
ALTER TABLE [dbo].[TeamToCAccess]  WITH CHECK ADD  CONSTRAINT [FK_TeamToCAccess_UnlockReason] FOREIGN KEY([UnlockReason])
REFERENCES [dbo].[UnlockReason] ([UnlockReasonId])
GO
ALTER TABLE [dbo].[TeamToCAccess] CHECK CONSTRAINT [FK_TeamToCAccess_UnlockReason]
GO
ALTER TABLE [dbo].[ToCContent]  WITH CHECK ADD  CONSTRAINT [FK_TableofContentsContent_AdditionalContent] FOREIGN KEY([AdditionalContent])
REFERENCES [dbo].[AdditionalContent] ([ContentId])
GO
ALTER TABLE [dbo].[ToCContent] CHECK CONSTRAINT [FK_TableofContentsContent_AdditionalContent]
GO
ALTER TABLE [dbo].[ToCContent]  WITH CHECK ADD  CONSTRAINT [FK_TableofContentsContent_Location] FOREIGN KEY([Location])
REFERENCES [dbo].[Location] ([LocationId])
GO
ALTER TABLE [dbo].[ToCContent] CHECK CONSTRAINT [FK_TableofContentsContent_Location]
GO
ALTER TABLE [dbo].[ToCContent]  WITH CHECK ADD  CONSTRAINT [FK_TableofContentsContent_TableOfContentsEntry] FOREIGN KEY([TableOfContentsEntry])
REFERENCES [dbo].[TableOfContentsEntry] ([TableOfContentId])
GO
ALTER TABLE [dbo].[ToCContent] CHECK CONSTRAINT [FK_TableofContentsContent_TableOfContentsEntry]
GO
ALTER TABLE [dbo].[ToCInstance]  WITH CHECK ADD  CONSTRAINT [FK_ToCInstance_Participation] FOREIGN KEY([PrimaryStaff])
REFERENCES [dbo].[Participation] ([ParticipationId])
GO
ALTER TABLE [dbo].[ToCInstance] CHECK CONSTRAINT [FK_ToCInstance_Participation]
GO
ALTER TABLE [dbo].[ToCInstance]  WITH CHECK ADD  CONSTRAINT [FK_ToCInstance_TableOfContentsEntry] FOREIGN KEY([TableOfContentsEntry])
REFERENCES [dbo].[TableOfContentsEntry] ([TableOfContentId])
GO
ALTER TABLE [dbo].[ToCInstance] CHECK CONSTRAINT [FK_ToCInstance_TableOfContentsEntry]
GO
ALTER TABLE [dbo].[ToCInstance]  WITH CHECK ADD  CONSTRAINT [FK_ToCInstance_Team] FOREIGN KEY([CurrentTeam])
REFERENCES [dbo].[Team] ([TeamId])
GO
ALTER TABLE [dbo].[ToCInstance] CHECK CONSTRAINT [FK_ToCInstance_Team]
GO
ALTER TABLE [dbo].[Pulse]  WITH CHECK ADD  CONSTRAINT [CK_Pulse] CHECK  (([PulseRating]>(0) AND [PulseRating]<(6)))
GO
ALTER TABLE [dbo].[Pulse] CHECK CONSTRAINT [CK_Pulse]
GO
/****** Object:  StoredProcedure [dbo].[Achievement_GetAchievementsForParticipant] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:      Game Control Team
-- Create date: 2011.06.13
-- Description: Returns all achievements that a participant has unlocked.
-- =============================================
CREATE PROCEDURE [dbo].[Achievement_GetAchievementsForParticipant]
    @participantId UNIQUEIDENTIFIER
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;

    SELECT Achievement.*
    FROM Achievement
    INNER JOIN AchievementUnlock ON AchievementUnlock.AchievementId = Achievement.AchievementId
    WHERE AchievementUnlock.ParticipantId = @participantId
END
GO
/****** Object:  StoredProcedure [dbo].[Achievement_GetAchievementsForTeam] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:      Game Control Team
-- Create date: 2011.06.16
-- Description: Returns all achievements that a team has unlocked.
-- =============================================
CREATE PROCEDURE [dbo].[Achievement_GetAchievementsForTeam]
    @teamId UNIQUEIDENTIFIER
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;

    SELECT Achievement.*
    FROM Achievement
    INNER JOIN AchievementUnlock ON AchievementUnlock.AchievementId = Achievement.AchievementId
    WHERE AchievementUnlock.TeamId = @teamId
END
GO
/****** Object:  StoredProcedure [dbo].[Achievement_GetAchievementsUnlockedByAnswer] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:      Game Control Team
-- Create date: 2011.07.05
-- Description: Returns all achievements unlocked by a given answer.
-- =============================================
CREATE PROCEDURE [dbo].[Achievement_GetAchievementsUnlockedByAnswer] 
    @answerId UNIQUEIDENTIFIER
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;

    SELECT Achievement.*
    FROM AchievementRelationship
    INNER JOIN Achievement ON Achievement.AchievementId = AchievementRelationship.AchievementId
    WHERE AchievementRelationship.AnswerId = @answerId
END
GO
/****** Object:  StoredProcedure [dbo].[Achievement_GetAchievementsUnlockedBySubmission] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:      Game Control Team
-- Create date: 2018.07.03
-- Description: Returns all achievements unlocked by a given submission.
-- =============================================
CREATE PROCEDURE [dbo].[Achievement_GetAchievementsUnlockedBySubmission] 
    @submissionId UNIQUEIDENTIFIER
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;

    SELECT Achievement.*
    FROM AchievementUnlock
    INNER JOIN Achievement ON Achievement.AchievementId = AchievementUnlock.AchievementId
    WHERE AchievementUnlock.UnlockedBy = @submissionId
END
GO
/****** Object:  StoredProcedure [dbo].[AchievementRelationship_GetAchievementsToUnlockForAnswer] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:      Game Control Team
-- Create date: 2011.06.28
-- Description: Returns which achievements should be unlocked for a team
--              for submitting a given answer.
-- =============================================
CREATE PROCEDURE [dbo].[AchievementRelationship_GetAchievementsToUnlockForAnswer]
    -- Add the parameters for the stored procedure here
    @teamId UNIQUEIDENTIFIER,
    @answerId UNIQUEIDENTIFIER
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;

    SELECT AchievementRelationship.AchievementId, Achievement.Name
    FROM AchievementRelationship
    LEFT OUTER JOIN AchievementUnlock ON AchievementUnlock.TeamId = @teamId AND AchievementUnlock.AchievementId = AchievementRelationship.AchievementId
    LEFT OUTER JOIN Achievement ON Achievement.AchievementId = AchievementRelationship.AchievementId
    WHERE AnswerId = @answerId AND AchievementUnlock.TeamId IS NULL
    
END
GO
/****** Object:  StoredProcedure [dbo].[AchievementUnlock_AddForTeam] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:      Game Control Team
-- Create date: 2011.06.13
-- Description: Unlocks an achievement for a team.
-- =============================================
CREATE PROCEDURE [dbo].[AchievementUnlock_AddForTeam] 
    @achievementId UNIQUEIDENTIFIER,
    @teamId UNIQUEIDENTIFIER
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT * 
                   FROM AchievementUnlock 
                   WHERE AchievementId = @achievementId AND
                         TeamId = @teamId)
     BEGIN
        INSERT INTO AchievementUnlock
        (AchievementId, TeamId) VALUES
        (@achievementId, @teamId)
    END
END
GO
/****** Object:  StoredProcedure [dbo].[AchievementUnlock_AddForTeamFromSubmission] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:      Game Control Team
-- Create date: 2011.06.13
-- Description: Unlocks an achievement for a team.
-- =============================================
CREATE PROCEDURE [dbo].[AchievementUnlock_AddForTeamFromSubmission] 
    @achievementId UNIQUEIDENTIFIER,
    @teamId UNIQUEIDENTIFIER,
    @submissionId UNIQUEIDENTIFIER
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT * 
                   FROM AchievementUnlock 
                   WHERE AchievementId = @achievementId AND
                         TeamId = @teamId)
     BEGIN
        INSERT INTO AchievementUnlock
        (AchievementId, TeamId, UnlockedBy) VALUES
        (@achievementId, @teamId, @submissionId)
    END
END
GO
/****** Object:  StoredProcedure [dbo].[AchievementUnlock_RevokeForTeam] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:      Game Control Team
-- Create date: 2016.07.31
-- Description: Revokes an achievement for a team.
-- =============================================
CREATE PROCEDURE [dbo].[AchievementUnlock_RevokeForTeam] 
    @achievementId UNIQUEIDENTIFIER,
    @teamId UNIQUEIDENTIFIER
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;

    IF EXISTS (SELECT * 
                   FROM AchievementUnlock 
                   WHERE AchievementId = @achievementId AND
                         TeamId = @teamId)
     BEGIN
        DELETE FROM AchievementUnlock
        WHERE AchievementId = @achievementId AND TeamId = @teamId
    END
END
GO
/****** Object:  StoredProcedure [dbo].[AddSubmission] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[AddSubmission]
    @submissionId [uniqueidentifier],
    @teamId [uniqueidentifier],
    @submittableId [uniqueidentifier],
    @submission [nvarchar](max),
    @submissionTime [datetime],
    @submissionSource [nvarchar](128),
    @participationId UNIQUEIDENTIFIER = NULL
WITH EXECUTE AS CALLER
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;

    INSERT INTO Submission
        (SubmissionId, Team, Submittable, Submission, SubmissionTime, SubmissionSource, Participation) VALUES
        (@submissionId, @teamId, @submittableId, @submission,
         ISNULL(@submissionTime, GETUTCDATE()), @submissionSource, @participationId)
         
    SELECT TOP(1) ValidSubmissions.*
    FROM ValidSubmissions
    WHERE ValidSubmissions.SubmissionId = @submissionId
    ORDER BY AppliesToTeam DESC 
END
GO
/****** Object:  StoredProcedure [dbo].[AddTableOfContentsEntryAccess] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[AddTableOfContentsEntryAccess]
    @teamId [uniqueidentifier],
    @tableOfContentsEntryId [uniqueidentifier],
    @unlockReason [nchar](10)
WITH EXECUTE AS CALLER
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;

    INSERT INTO TeamToCAccess (Team, TableOfContentsEntry, UnlockReason)
    SELECT @teamId, @tableOfContentsEntryId, @unlockReason
    WHERE NOT EXISTS (
        SELECT 1 FROM
        TeamToCAccess
        WHERE TeamToCAccess.Team = @teamId AND
              TeamToCAccess.TableOfContentsEntry = @tableOfContentsEntryId)           
END
GO
/****** Object:  StoredProcedure [dbo].[Admin_AchievementRelationship_AddAchievementToAnswer] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:      Game Control Team
-- Create date: 2011.07.22
-- Description: Adds an achievement to an answer
-- =============================================
CREATE PROCEDURE [dbo].[Admin_AchievementRelationship_AddAchievementToAnswer]
    @eventInstanceId UNIQUEIDENTIFIER,
    @achievementId UNIQUEIDENTIFIER,
    @answerId UNIQUEIDENTIFIER

AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;

    INSERT INTO AchievementRelationship
    (AchievementId, EventInstanceId, AnswerId) VALUES
    (@achievementId, @eventInstanceId, @answerId)
END
GO
/****** Object:  StoredProcedure [dbo].[Admin_AchievementRelationship_RemoveAchievementFromAnswer] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:      Game Control Team
-- Create date: 2011.07.22
-- Description: Removes an achievement from an answer.
-- =============================================
CREATE PROCEDURE [dbo].[Admin_AchievementRelationship_RemoveAchievementFromAnswer]
    @eventInstanceId UNIQUEIDENTIFIER,
    @achievementId UNIQUEIDENTIFIER,
    @answerId UNIQUEIDENTIFIER
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;

    DELETE FROM AchievementRelationship
    WHERE @eventInstanceId = EventInstanceId AND
          @achievementId = AchievementId AND
          @answerId = AnswerId
END
GO
/****** Object:  StoredProcedure [dbo].[Admin_ParticipationLogin_CreateParticipationLogin] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:      Game Control Team
-- Create date: 2011.06.22
-- Description: Creates a login for a given participant.
-- =============================================
CREATE PROCEDURE [dbo].[Admin_ParticipationLogin_CreateParticipationLogin]
    @participantId UNIQUEIDENTIFIER,
    @userName NVARCHAR(50),
    @hashedSaltedPassword VARBINARY(255),
    @salt VARBINARY(255),
    @isStaff BIT,
    @teamId UNIQUEIDENTIFIER = NULL,
    @eventInstanceId UNIQUEIDENTIFIER
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;

    DECLARE @participationId UNIQUEIDENTIFIER
    SET @participationId = NEWID();

    INSERT INTO Participation
    (ParticipationId, Participant, EventInstance, Team, IsStaff)
    VALUES
    (@participationId, @participantId, @eventInstanceId, @teamId, @isStaff)

    INSERT INTO ParticipationLogin
    (UserName, HashedSaltedPassword, Salt, Participation)
    VALUES
    (@userName, @hashedSaltedPassword, @salt, @participationId)
END
GO
/****** Object:  StoredProcedure [dbo].[Admin_ParticipationLogin_GetLoginsByParticipantId] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:      Game Control Team
-- Create date: 2011.07.19
-- Description: Returns the logins for a user given their
--              participation ID.
-- =============================================
CREATE PROCEDURE [dbo].[Admin_ParticipationLogin_GetLoginsByParticipantId]
    -- Add the parameters for the stored procedure here
    @participantId UNIQUEIDENTIFIER
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;

    SELECT ParticipationLogin.UserName,
           ParticipationLogin.RequiresReset,
           Participation.ParticipationId,
           Participation.LastUpdated,
           Participation.IsStaff,
           Participation.IsAdmin,
           Participant.FirstName,
           Participant.LastName
    FROM ParticipationLogin
    INNER JOIN Participation ON ParticipationLogin.Participation = Participation.ParticipationId
    INNER JOIN Participant ON Participant.ParticipantId = Participation.Participant
    WHERE Participation.Participant = @participantId
END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/****** Object:  StoredProcedure [dbo].[GetToCsUnlockedBySubmission] ******/
CREATE PROCEDURE [dbo].[GetToCsUnlockedBySubmission]
	@submissionId UNIQUEIDENTIFIER
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

    -- Insert statements for procedure here
	SELECT
		TableOfContentsEntry.TableOfContentId,
		Submittable.Title
	FROM TeamToCAccess
	INNER JOIN TableOfContentsEntry on TableOfContentsEntry.TableOfContentId = TeamToCAccess.TableOfContentsEntry
	INNER JOIN Submittable on Submittable.SubmittableId = TableOfContentsEntry.Submittable
	WHERE TeamToCAccess.UnlockSubmission = @submissionId
END
/****** Object:  StoredProcedure [dbo].[Admin_ParticipationLogin_SetResetBit] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:      Game Control Team
-- Create date: 2011.07.20
-- Description: Sets the password requires reset bit on a user's login.
-- =============================================
CREATE PROCEDURE [dbo].[Admin_ParticipationLogin_SetResetBit]
    @userName NVARCHAR(50)
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;

    UPDATE ParticipationLogin
    SET RequiresReset = 1
    WHERE ParticipationLogin.UserName = @userName   
END
GO
/****** Object:  StoredProcedure [dbo].[Answer_GetToCUnlocksForAllAnswers] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[Answer_GetToCUnlocksForAllAnswers]
    @eventInstanceId [uniqueidentifier]
WITH EXECUTE AS CALLER
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;

    SELECT Answer.AnswerId,
           Answer.AnswerResponse,
           Answer.AnswerText,
           Answer.IsCorrectAnswer,
           Answer.AppliesToTeam,
           Answer.AdditionalContent,
           Answer.Submittable as SourceSubmittable,
           TableOfContentsEntry.TableOfContentId,
           Submittable.Title,
           Submittable.ShortTitle,
           Submittable.SubmittableType,
           Submittable.LastUpdate,
           Submittable.SubmittableId,
           TableOfContentsEntry.SortOrder
    FROM Answer
    LEFT JOIN SubmittableUnlockRelationship ON SubmittableUnlockRelationship.Answer = Answer.AnswerId
    LEFT JOIN TableOfContentsEntry ON TableOfContentsEntry.TableOfContentId = SubmittableUnlockRelationship.TableOfContentsEntry
    LEFT JOIN Submittable ON Submittable.SubmittableId = TableOfContentsEntry.Submittable   
    WHERE Answer.EventInstance = @eventInstanceId
END
GO
/****** Object:  StoredProcedure [dbo].[Call_GetCallsForEventInstance] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[Call_GetCallsForEventInstance]
    @eventInstanceId UNIQUEIDENTIFIER
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;

    SELECT
        [Call].CallId,
        [Call].Team,
        Team.ShortName,
        Team.Color,
        [Call].Participant,
        Participant.FirstName,
        Participant.LastName,
        [Call].CallStart,
        [Call].CallEnd,
        [Call].CallType,
        [Call].CallSubType,
        [Call].ToCEntry,
        [Call].Notes,
        [Call].TeamNotes,
        [Call].PublicNotes,
        [Call].LastUpdated
    FROM [Call]
    INNER JOIN Team ON Team.TeamId = [Call].Team
    INNER JOIN Participant ON Participant.ParticipantId = [Call].Participant
    WHERE Team.EventInstance = @eventInstanceId
    ORDER BY CallStart DESC
END
GO
/****** Object:  StoredProcedure [dbo].[Call_GetCallsForTeam] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[Call_GetCallsForTeam]
    @teamId UNIQUEIDENTIFIER
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;

    SELECT
        [Call].CallId,
        [Call].Team,
        Team.ShortName,
        Team.Color,
        [Call].Participant,
        Participant.FirstName,
        Participant.LastName,
        [Call].CallStart,
        [Call].CallEnd,
        [Call].CallType,
        [Call].CallSubType,
        [Call].ToCEntry,
        [Call].Notes
    FROM [Call]
    INNER JOIN Team ON Team.TeamId = [Call].Team
    INNER JOIN Participant ON Participant.ParticipantId = [Call].Participant
    WHERE Team.TeamId = @teamId
    ORDER BY CallStart DESC
END
GO
/****** Object:  StoredProcedure [dbo].[ChallengeSubmission_GetAllSubmissions] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:      Game Control Team
-- Create date: 2018.07.27
-- Description: Gets all challenge submissions
-- =============================================
CREATE PROCEDURE [dbo].[ChallengeSubmission_GetAllSubmissions] 
    @eventInstanceId UNIQUEIDENTIFIER
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;

SELECT ChallengeSubmission.ChallengeSubmissionId,
       ChallengeSubmission.Challenge,
       ChallengeSubmission.Participant,
       ChallengeSubmission.SubmissionDate,
       ChallengeSubmission.LastChanged,
       ChallengeSubmission.State,
       ChallengeSubmission.Approver,
       ChallengeSubmission.SubmissionType,
       ChallengeSubmission.SubmissionNotes,
       ChallengeSubmission.SubmissionTextContent,
       ChallengeSubmission.ApproverText,
       Participant.FirstName,
       Participant.LastName,
       Team.TeamId,
       Team.Name,
       Team.IsTestTeam
FROM ChallengeSubmission
INNER JOIN Challenge ON Challenge.ChallengeId = ChallengeSubmission.Challenge
INNER JOIN Participation ON Participation.ParticipationId = ChallengeSubmission.Participant
INNER JOIN Participant ON Participant.ParticipantId = Participation.Participant
INNER JOIN Team ON Team.TeamId = Participation.Team
WHERE Challenge.EventInstance = @eventInstanceId 
END
GO
/****** Object:  StoredProcedure [dbo].[ChallengeSubmission_GetForTeam] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:      Game Control Team
-- Create date: 2018.07.22
-- Description: Gets all challenge submissions for a given challenge and team
-- =============================================
CREATE PROCEDURE [dbo].[ChallengeSubmission_GetForTeam] 
    @challengeId UNIQUEIDENTIFIER,
    @teamId UNIQUEIDENTIFIER
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;

    SELECT ChallengeSubmission.*
    FROM ChallengeSubmission
    INNER JOIN Participation on Participation.ParticipationId = ChallengeSubmission.Participant
    WHERE ChallengeSubmission.Challenge = @challengeId AND Participation.Team = @teamId
END
GO
/****** Object:  StoredProcedure [dbo].[EndHold] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[EndHold]
    @holdId [uniqueidentifier],
    @enderId [uniqueidentifier],
    @endTime [datetime]
WITH EXECUTE AS CALLER
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;

    UPDATE Hold
    SET Hold.EndParticipant = @enderId,
        HoldEnd = @endTime
    WHERE Hold.HoldId = @holdId AND HoldEnd IS NULL
END
GO
/****** Object:  StoredProcedure [dbo].[GcMessages_GetMessagesForEventInstance] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:      Game Control Team
-- Create date: 2018.07.28
-- Description: Gets messages from GC for the event
-- =============================================
CREATE PROCEDURE [dbo].[GcMessages_GetMessagesForEventInstance] 
    @eventInstanceId UNIQUEIDENTIFIER
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;

    SELECT GcMessages.*
    FROM GcMessages
    INNER JOIN Team on Team.TeamId = GcMessages.Team
    WHERE Team.EventInstance = @eventInstanceId
    Order by GcMessages.LastUpdated DESC
END
GO
/****** Object:  StoredProcedure [dbo].[GetActiveCalls] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[GetActiveCalls]
WITH EXECUTE AS CALLER
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;

    SELECT
        [Call].CallId,
        [Call].Team,
        Team.ShortName,
        Team.Color,
        [Call].Participant,
        Participant.FirstName,
        Participant.LastName,
        [Call].CallStart,
        [Call].CallType,
        [Call].CallSubType,
        [Call].ToCEntry,
        [Call].Notes
    FROM [Call]
    INNER JOIN Team ON Team.TeamId = [Call].Team
    INNER JOIN Participant ON Participant.ParticipantId = [Call].Participant
    WHERE CallEnd IS NULL
    ORDER BY CallStart DESC
END
GO
/****** Object:  StoredProcedure [dbo].[GetAllHoldsForTeam] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[GetAllHoldsForTeam]
    @teamId [uniqueidentifier]
WITH EXECUTE AS CALLER
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;

    SELECT Hold.HoldId,
           Hold.Team,
           Hold.StartParticipant,
           Starter.FirstName AS StarterFirstName,
           Starter.LastName AS StarterLastName,
           Hold.HoldStart,
           Hold.EndParticipant,
           Ender.FirstName AS EnderFirstName,
           Ender.LastName AS EnderLastName,
           Hold.HoldEnd       
    FROM Hold
    INNER JOIN Participant AS Starter ON Starter.ParticipantId = Hold.StartParticipant
    LEFT JOIN Participant AS Ender ON Ender.ParticipantId = Hold.EndParticipant
    WHERE Hold.Team = @teamId
    ORDER BY Hold.HoldStart DESC
END
GO
/****** Object:  StoredProcedure [dbo].[GetDataForTheGrid] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[GetDataForTheGrid]
    @eventInstanceId UNIQUEIDENTIFIER
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;

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
	LEFT JOIN (SELECT 
				p.SubmissionId,
				p.Submission, 
				p.SubmittableId,
				p.SubmissionTime,
				p.AnswerResponse,
				p.IsCorrectAnswer,
				p.TeamId,
				p.AnswerId
	           FROM (
				SELECT *,
	                   RANK() OVER (
					     PARTITION BY TeamId, SubmittableId
                         ORDER BY SubmissionTime ASC, AppliesToTeam DESC
				       ) AS Rank
                FROM  ValidSubmissions
                WHERE IsCorrectAnswer = 1 AND EventInstance=@eventInstanceId) AS p
              WHERE     p.Rank = 1) as EarliestCorrectSubmission ON EarliestCorrectSubmission.SubmittableId = Submittable.SubmittableId
									   AND EarliestCorrectSubmission.TeamId = Team.TeamId
    WHERE Team.EventInstance = @eventInstanceId
 	ORDER BY Team.Name, TableOfContentsEntry.SortOrder
END
GO
-- =============================================
-- Author:      Game Control Team
-- Create date: 2021.03.06
-- Description: Function for getting valid submissions from all
--  teams scoped to a specific eventInstanceId.
-- =============================================
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE FUNCTION [GetValidSubmissions] (@eventInstance [uniqueidentifier])
RETURNS TABLE AS
RETURN (
    SELECT
        dbo.Submission.SubmissionId,
        dbo.Submission.Submission,
        dbo.Submittable.SubmittableId,
        dbo.Submission.SubmissionTime,
        dbo.Answer.AnswerResponse,
        ISNULL(dbo.Answer.IsCorrectAnswer, 0) AS IsCorrectAnswer,
        dbo.Submission.Team as TeamId,
        dbo.Answer.AnswerId,
        dbo.Submission.Participation,
        dbo.Participant.FirstName,
        dbo.Participant.LastName,
        dbo.Answer.AppliesToTeam,
        dbo.Answer.AdditionalContent,
        dbo.Answer.EventInstance,
        ISNULL(dbo.Answer.IsHidden, 0) AS IsHidden
    FROM Submission
    INNER JOIN Submittable on Submittable.SubmittableId = Submission.Submittable
    INNER JOIN Team on Submission.Team = Team.TeamId AND Team.EventInstance = @eventInstance
    LEFT OUTER JOIN Participation on Participation.ParticipationId = Submission.Participation AND Participation.EventInstance = @eventInstance
    LEFT OUTER JOIN Participant on Participant.ParticipantId = Participation.Participant
    LEFT OUTER JOIN dbo.Answer ON
        Answer.EventInstance = @eventInstance
        AND dbo.Answer.Submittable = dbo.Submittable.SubmittableId
        AND dbo.Answer.AnswerText = dbo.Submission.Submission COLLATE Latin1_General_100_CI_AS_SC
        AND (dbo.Answer.AppliesToTeam IS NULL OR dbo.Answer.AppliesToTeam = dbo.Submission.Team)
)
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:      Game Control Team
-- Create date: 2021.03.06
-- Description: Function for aggregating content for the
--  activity feed scoped to an Event Instance.
-- =============================================
CREATE FUNCTION [GetAggregatedContent] (@eventInstance [uniqueidentifier])
RETURNS TABLE AS
RETURN (
        /* Get all team Pulses */
        SELECT
            Pulse.PulseId AS Id,
            Team.Name + ' (' + Participant.FirstName + ')' AS TeamName,
            Team.TeamId AS TeamId,
            Team.Color AS TeamColor,
            'Pulse' AS AggregatedContentType,
            Pulse.LastUpdated AS LastUpdated,
            Pulse.PulseRating AS NumericValue,
            Pulse.PulseText AS Description,
            CASE 
                WHEN Pulse.TeamPic IS NULL 
                THEN 0
                ELSE 1 
            END AS HasAdditionalImage,
            Team.EventInstance AS EventInstance
        FROM Pulse
        INNER JOIN Participation ON Participation.ParticipationId = Pulse.Participation
        INNER JOIN Participant ON Participant.ParticipantId = Participation.Participant
        INNER JOIN Team ON Team.TeamId = Participation.Team
        WHERE Team.EventInstance = @eventInstance

        /* Get submissions */    
        UNION ALL
        SELECT
            GetValidSubmissions.SubmissionId AS Id,
            CASE
                WHEN Participant.FirstName IS NULL
                THEN Team.Name
                ELSE Team.Name + ' (' + Participant.FirstName + ') '
            END AS TeamName,
            Team.TeamId AS TeamId,
            Team.Color AS TeamColor,
            'Submission' AS AggregatedContentType,
            GetValidSubmissions.SubmissionTime AS LastUpdated,
            CASE
                WHEN GetValidSubmissions.IsCorrectAnswer = 0 AND AnswerResponse IS NOT NULL 
                THEN 2
                ELSE IsCorrectAnswer
            END AS NumericValue,
            CASE
                WHEN GetValidSubmissions.IsHidden = 1
                    THEN '(' + Submittable.Title + ')'
                    ELSE GetValidSubmissions.Submission + ' (' + Submittable.Title + ')'
            END AS Description,
            0 AS HasAdditionalImage,
            Team.EventInstance AS EventInstance
        FROM GetValidSubmissions(@eventInstance)
        INNER JOIN Team ON Team.TeamId = GetValidSubmissions.TeamId
        INNER JOIN Submittable ON GetValidSubmissions.SubmittableId = Submittable.SubmittableId
        LEFT OUTER JOIN Participation ON Participation.ParticipationId = GetValidSubmissions.Participation
        LEFT OUTER JOIN Participant ON Participant.ParticipantId = Participation.Participant
        WHERE Team.EventInstance = @eventInstance

        /* Get puzzle unlocks */
        UNION ALL
        SELECT
            TeamToCAccess.TableOfContentsEntry AS Id,
            Team.Name AS TeamName,
            Team.TeamId AS TeamId,
            Team.Color AS TeamColor,
            TeamToCAccess.UnlockReason AS AggregatedContentType,
            TeamToCAccess.UnlockTime AS LastUpdated,
            NULL AS NumericValue,
            Submittable.Title AS Description,
            0 AS HasAdditionalImage, 
            Team.EventInstance AS EventInstance
        FROM TeamToCAccess 
        INNER JOIN Team ON Team.TeamId = TeamToCAccess.Team
        INNER JOIN TableOfContentsEntry ON TableOfContentsEntry.TableOfContentId = TeamToCAccess.TableOfContentsEntry
        INNER JOIN Submittable ON Submittable.SubmittableId = TableOfContentsEntry.Submittable
        WHERE Team.EventInstance = @eventInstance

        /* Get support calls that have started */
        UNION ALL
        SELECT
            Call.CallId AS Id,
            Team.Name AS TeamName,
            Team.TeamId AS TeamId,
            Team.Color AS TeamColor,
            'CallStarted' AS AggregatedContentType,
            Call.CallStart AS LastUpdated,
            CASE
                WHEN Call.CallType = 'TeamFree'
                THEN 1
                WHEN Call.CallType = 'TeamHelp'
                THEN 2
                ELSE 0
            END AS NumericValue, 
            Participant.FirstName + ' ' + Participant.LastName AS Description,
            0 AS HasAdditionalImage,
            Team.EventInstance AS EventInstance
        FROM Call
        INNER JOIN Team ON Team.TeamId = Call.Team
        INNER JOIN Participant ON Participant.ParticipantId = Call.Participant
        WHERE Call.CallEnd IS NULL AND Team.EventInstance = @eventInstance

        /* Get support calls that have ended - NOTE that this causes issues where it uses the same ID as call start */
        UNION ALL
        SELECT
            Call.CallId AS Id,
            Team.Name AS TeamName,
            Team.TeamId AS TeamId,
            Team.Color AS TeamColor,
            'CallEnded' AS AggregatedContentType,
            Call.CallEnd AS LastUpdated,
            CASE
                WHEN Call.CallType = 'TeamFree'
                THEN 1 
                WHEN Call.CallType = 'TeamHelp'
                THEN 2
                ELSE 0 
            END AS NumericValue, 
            Participant.FirstName + ' ' + Participant.LastName AS Description,
            0 AS HasAdditionalImage,
            Team.EventInstance AS EventInstance
        FROM Call
        INNER JOIN Team ON Team.TeamId = Call.Team
        INNER JOIN Participant ON Participant.ParticipantId = Call.Participant
        WHERE Call.CallEnd IS NOT NULL AND Team.EventInstance = @eventInstance

        /* Get achievements unlocked by teams */
        UNION ALL
        SELECT
            AchievementUnlock.AchievementId AS Id,
            Team.Name AS TeamName,
            Team.TeamId AS TeamId,
            Team.Color AS TeamColor,
            'AchievementUnlock' AS AggregatedContentType,
            UnlockedOn AS LastUpdated,
            NULL AS NumericValue,
            Achievement.Name AS Description,
            0 AS HasAdditionalImage,
            Team.EventInstance AS EventInstance
        FROM AchievementUnlock
        INNER JOIN Achievement ON Achievement.AchievementId = AchievementUnlock.AchievementId
        INNER JOIN Team ON Team.TeamId = AchievementUnlock.TeamId
        WHERE Team.EventInstance = @eventInstance

        /* Get points awarded to a team */
        UNION ALL
        SELECT
            UniqueId AS Id,
            Team.Name AS TeamName,
            Team.TeamId AS TeamId,
            Team.Color AS TeamColor,
            'PointsAward' AS AggregatedContentType,
            LastUpdated AS LastUpdated,
            PointTransaction.PointValue AS NumericValue,
            Reason AS Description,
            0 AS HasAdditionalImage,
            Team.EventInstance AS EventInstance
        FROM PointTransaction
        INNER JOIN Team ON PointTransaction.Team = Team.TeamId
        WHERE Team.EventInstance = @eventInstance

        /* Get messages sent to teams */
        UNION ALL
        SELECT
            MessageId AS Id,
            Team.Name AS TeamName,
            Team.TeamId AS TeamId,
            Team.Color AS TeamColor,
            'GcMessage' AS AggregatedContentType,
            LastUpdated AS LastUpdated,
            NULL AS NumericValue,
            MessageText AS Description, 0 AS HasAdditionalImage,
            Team.EventInstance AS EventInstance
        FROM GcMessages
        INNER JOIN Team ON GcMessages.Team = Team.TeamId
        WHERE Team.EventInstance = @eventInstance

        /* Get submissions for challenges */
        UNION ALL
        SELECT
            ChallengeSubmissionId AS Id,
            Team.Name AS TeamName,
            Team.TeamId AS TeamId,
            Team.Color AS TeamColor,
            'ChallengeSubmission' AS AggregatedContentType,
            LastChanged AS LastUpdated,
            NULL AS NumericValue,
            CASE
                WHEN ChallengeSubmission.SubmissionTextContent IS NULL 
                THEN ChallengeSubmission.SubmissionNotes
                ELSE ChallengeSubmission.SubmissionTextContent + ' (' + ChallengeSubmission.SubmissionNotes + ')'
            END AS Description,
            CASE
                WHEN ChallengeSubmission.SubmissionBinaryContent IS NULL
                THEN 0
                ELSE 1
            END AS HasAdditionalImage,
            Team.EventInstance AS EventInstance
        FROM ChallengeSubmission
        INNER JOIN Participation ON Participation.ParticipationId = ChallengeSubmission.Participant
        INNER JOIN Team ON Participation.Team = Team.TeamId
        WHERE Team.EventInstance = @eventInstance
)
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/****** Object:  StoredProcedure [dbo].[GetAggregatedContentPaged] ******/
CREATE PROCEDURE [dbo].[GetAggregatedContentPaged]
    @eventInstanceId [uniqueidentifier],
    @startPage [int],
    @resultsPerPage [int],
    @totalResults [int] OUTPUT
WITH EXECUTE AS CALLER
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;

DECLARE @betweenMin int,
        @betweenMax int

set @betweenMin = (@startPage * @resultsPerPage) + 1
set @betweenMax = ((@startPage * @resultsPerPage) + @resultsPerPage)

SELECT *
FROM (
    SELECT [GetAggregatedContent].*,
            ROW_NUMBER() OVER (ORDER BY [GetAggregatedContent].LastUpdated DESC) AS RowNum
    FROM [GetAggregatedContent](@eventInstanceId)
) AS Paged
WHERE RowNum BETWEEN @betweenMin AND @betweenMax


SELECT @totalResults = ISNULL(COUNT(*), 0)
FROM [GetAggregatedContent](@eventInstanceId)

END

GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:      Game Control Team
-- Create date: 2021.03.06
-- Description: Procedure for getting activity feed data for a team.
--  Teams see less data than staff as they should not know if they were
--  skipped or see GC calls.
-- =============================================
CREATE PROCEDURE [dbo].[GetAggregatedContentPagedForTeam]
    @eventInstanceId [uniqueidentifier],
    @teamId [uniqueidentifier],
    @startPage [int],
    @resultsPerPage [int],
    @totalResults [int] OUTPUT
WITH EXECUTE AS CALLER
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;

DECLARE @betweenMin int,
        @betweenMax int

set @betweenMin = (@startPage * @resultsPerPage) + 1
set @betweenMax = ((@startPage * @resultsPerPage) + @resultsPerPage)

SELECT *
FROM (
    SELECT [GetAggregatedContent].*,
            ROW_NUMBER() OVER (ORDER BY [GetAggregatedContent].LastUpdated DESC) AS RowNum
    FROM [GetAggregatedContent](@eventInstanceId)
    WHERE [GetAggregatedContent].AggregatedContentType <> 'CallStarted' AND
          [GetAggregatedContent].AggregatedContentType <> 'CallEnded' AND
          [GetAggregatedContent].AggregatedContentType <> 'Skip' AND
          [GetAggregatedContent].TeamId = @teamId
) AS Paged
WHERE RowNum BETWEEN @betweenMin AND @betweenMax


SELECT @totalResults = ISNULL(COUNT(*), 0)
FROM [GetAggregatedContent](@eventInstanceId)
WHERE [GetAggregatedContent].AggregatedContentType <> 'CallStarted' AND
        [GetAggregatedContent].AggregatedContentType <> 'CallEnded' AND
        [GetAggregatedContent].AggregatedContentType <> 'Skip' AND
        [GetAggregatedContent].TeamId = @teamId

END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[GetAllTableOfContentsEntries]
	@eventInstance [uniqueidentifier]
WITH EXECUTE AS CALLER
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	SELECT TableOfContentsEntry.TableOfContentId,
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
	FROM TableOfContentsEntry
	INNER JOIN Submittable ON Submittable.SubmittableId = TableOfContentsEntry.Submittable
	WHERE TableOfContentsEntry.EventInstance = @eventInstance
	ORDER BY SortOrder
END
/****** Object:  StoredProcedure [dbo].[GetTableOfContentsEntriesForTeam] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[GetTableOfContentsEntriesForTeam]
    @teamId [uniqueidentifier]
WITH EXECUTE AS CALLER
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;

    WITH AnswerCount (SubmittableId, EventInstance, LastUpdated, AnswerCount) AS
    (
        SELECT Submittable AS SubmittableId, 
               EventInstance,
               MAX(LastUpdated),
               Count(*) AS AnswerCount 
        FROM Answer 
        GROUP BY Submittable, EventInstance
    )
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
    INNER JOIN TeamTocAccess ON TeamTocAccess.TableOfContentsEntry = TableOfContentsEntry.TableOfContentId AND TeamToCAccess.UnlockReason <> 'Skip'
    INNER JOIN Submittable ON Submittable.SubmittableId = TableOfContentsEntry.Submittable
    LEFT JOIN AnswerCount ON AnswerCount.SubmittableId = Submittable.SubmittableId AND 
                             AnswerCount.EventInstance = TableOfContentsEntry.EventInstance
    LEFT JOIN EarliestCorrectSubmission ON EarliestCorrectSubmission.TeamId = TeamToCAccess.Team AND
              EarliestCorrectSubmission.SubmittableId = Submittable.SubmittableId
    WHERE TeamTocAccess.Team = @teamId
    ORDER BY TableOfContentsEntry.SortOrder

END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[GetTableOfContentsEntriesForTeam_Optimized]
	@teamId [uniqueidentifier],
        @eventInstanceId [uniqueidentifier]
WITH EXECUTE AS CALLER
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	WITH AnswerCount (SubmittableId, EventInstance, LastUpdated, AnswerCount) AS
	(
		SELECT Submittable AS SubmittableId, 
		       EventInstance,
		       MAX(LastUpdated),
			   Count(*) AS AnswerCount 
		FROM Answer 
		GROUP BY Submittable, EventInstance
	)
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
	INNER JOIN TeamTocAccess ON TeamTocAccess.TableOfContentsEntry = TableOfContentsEntry.TableOfContentId AND TeamToCAccess.UnlockReason <> 'Skip'
	INNER JOIN Submittable ON Submittable.SubmittableId = TableOfContentsEntry.Submittable
	LEFT JOIN AnswerCount ON AnswerCount.SubmittableId = Submittable.SubmittableId AND 
	                         AnswerCount.EventInstance = TableOfContentsEntry.EventInstance
	LEFT JOIN (
            SELECT
	        p.SubmissionId,
	        p.Submission,
	        p.SubmittableId,
	        p.SubmissionTime,
	        p.AnswerResponse,
	        p.IsCorrectAnswer,
	        p.TeamId,
	        p.AnswerId
            FROM
	        (SELECT *, 
	                RANK() OVER (
                            PARTITION BY TeamId, SubmittableId
                            ORDER BY SubmissionTime ASC, AppliesToTeam DESC) AS Rank
	         FROM GetValidSubmissions(@eventInstanceId)
	         WHERE IsCorrectAnswer = 1) AS p
            WHERE p.Rank = 1) AS EarliestCorrectSubmission ON EarliestCorrectSubmission.TeamId = TeamToCAccess.Team AND
			  EarliestCorrectSubmission.SubmittableId = Submittable.SubmittableId
	WHERE TeamTocAccess.Team = @teamId
	ORDER BY TableOfContentsEntry.SortOrder
END


/****** Object:  StoredProcedure [dbo].[GetToCsUnlockedByAnswer] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[GetToCsUnlockedByAnswer]
    @answerId [uniqueidentifier]
WITH EXECUTE AS CALLER
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;

    SELECT TableOfContentsEntry.TableOfContentId,
           Submittable.Title,
           Submittable.ShortTitle,
           Submittable.SubmittableType,
           Submittable.LastUpdate,
           Submittable.SubmittableId,
           TableOfContentsEntry.SortOrder
    FROM Answer
    INNER JOIN SubmittableUnlockRelationship ON SubmittableUnlockRelationship.Answer = Answer.AnswerId
    INNER JOIN TableOfContentsEntry ON TableOfContentsEntry.TableOfContentId = SubmittableUnlockRelationship.TableOfContentsEntry
    INNER JOIN Submittable ON Submittable.SubmittableId = TableOfContentsEntry.Submittable  
    WHERE Answer.AnswerId = @answerId   
END
GO
/****** Object:  StoredProcedure [dbo].[Participation_GetAllParticipants] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:      Game Control Team
-- Create date: 2015.07.21
-- Description: Returns a view of all participants and the events
--              that they have participated in.
-- =============================================
CREATE PROCEDURE [dbo].[Participation_GetAllParticipants] 
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;

    select 
        Participant.ParticipantId,
        Participant.FirstName,
        Participant.LastName,
        Participant.Email,
        Participant.ContactNumber,
        Participation.EventInstance as EventInstanceId,
        EventInstance.Event as EventId,
        EventInstance.FriendlyName as EventFriendlyName,
        ParticipationLogin.UserName,
        Participation.IsStaff,
        Participation.IsAdmin,
        Team.Name as TeamName,
        ParticipationLogin.RequiresReset
    from Participant
left join Participation on Participation.Participant = Participant.ParticipantId
left join EventInstance on EventInstance.EventInstanceId = Participation.EventInstance
left join ParticipationLogin on ParticipationLogin.Participation = Participation.ParticipationId
left join Team on Team.EventInstance = EventInstance.EventInstanceId and Participation.Team = Team.TeamId
order by Participant.FirstName, EventInstance.StartTime desc
END
GO
/****** Object:  StoredProcedure [dbo].[ParticipationLogon_UpdateParticipationLogon] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:      Game Control Team
-- Create date: 2011.07.04
-- Description: Updates a user's password
-- =============================================
CREATE PROCEDURE [dbo].[ParticipationLogon_UpdateParticipationLogon]
    @userName NVARCHAR(50),
    @newPassword VARBINARY(255),
    @newSalt VARBINARY(255) 
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;

    UPDATE ParticipationLogin
    SET HashedSaltedPassword = @newPassword,
        Salt = @newSalt,
        RequiresReset = 0
    WHERE ParticipationLogin.UserName = @userName
END
GO
/****** Object:  StoredProcedure [dbo].[ParticipationToCRating_GetRatingsForTableOfContentsEntry] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[ParticipationToCRating_GetRatingsForTableOfContentsEntry]
    @tableOfContentId [uniqueidentifier]
WITH EXECUTE AS CALLER
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        ParticipationToCRating.TableOfContentsEntry,
        ParticipationToCRating.Participation,
        ParticipationToCRating.Rating,
        ParticipationToCRating.Comments,
        ParticipationToCRating.LastUpdated,
        Participant.FirstName,
        Participant.LastName,
        Team.Name
    FROM ParticipationToCRating
    INNER JOIN Participation on Participation.ParticipationId = ParticipationToCRating.Participation
    INNER JOIN Participant on Participant.ParticipantId = Participation.Participant
    LEFT OUTER JOIN Team on Team.TeamId = Participation.Team
    WHERE ParticipationToCRating.TableOfContentsEntry = @tableOfContentId
END
GO
/****** Object:  StoredProcedure [dbo].[PointsTransaction_AwardPoints] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:      Game Control Team
-- Create date: 2011.07.03
-- Description: Awards a team points.
-- =============================================
CREATE PROCEDURE [dbo].[PointsTransaction_AwardPoints]
    -- Add the parameters for the stored procedure here
    @eventInstance UNIQUEIDENTIFIER,
    @team UNIQUEIDENTIFIER,
    @points BIGINT,
    @reason NVARCHAR(MAX),
    @participation UNIQUEIDENTIFIER
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;

    -- Insert statements for procedure here
    INSERT INTO PointTransaction
    (EventInstance, Team, PointValue, Reason, Participation)
    VALUES
    (@eventInstance, @team, @points, @reason, @participation)

    DECLARE @currentPoints BIGINT
    
    SELECT @currentPoints = ISNULL(Team.Points, 0)
    FROM Team
    WHERE Team.TeamId = @team
    
    SET @currentPoints = @currentPoints + @points;
    
    UPDATE Team
    SET Team.Points = @currentPoints
    WHERE Team.TeamId = @team
END
GO
/****** Object:  StoredProcedure [dbo].[GetAdditionalContentForTeam] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[GetAdditionalContentForTeam]
	@teamId [uniqueidentifier]
WITH EXECUTE AS CALLER
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	SELECT
		ToCContent.Id as AssociationId,
		TableOfContentsEntry.TableOfContentId,
		TableOfContentsEntry.Submittable,
		TableOfContentsEntry.SortOrder,
		TeamToCAccess.UnlockReason,
		TeamToCAccess.UnlockTime,
		AdditionalContent.ContentId,
		AdditionalContent.ContentType,
		AdditionalContent.Name as ContentName,
		AdditionalContent.ShortName,
		AdditionalContent.FileName,
		AdditionalContent.RawData,
		AdditionalContent.LastUpdate as ContentLastUpdated,
		AdditionalContent.EncryptionKey,
		AdditionalContent.ContentText,
        AdditionalContent.UnlockedByAchievement,
		Location.LocationId,
		Location.Name AS LocationName,
		Location.LastUpdate as LocationLastUpdated,
		Location.Address AS LocationAddress,
		Location.Latitude AS LocationLatitude,
		Location.Longitude AS LocationLongitude,
		Location.LocationFlag as LocationFlag
	FROM ToCContent
	LEFT JOIN Location ON Location.LocationId = ToCContent.Location
	LEFT JOIN AdditionalContent ON AdditionalContent.ContentId = ToCContent.AdditionalContent
	INNER JOIN TableOfContentsEntry ON TableOfContentsEntry.TableOfContentId = ToCContent.TableOfContentsEntry
	INNER JOIN TeamToCAccess on TeamToCAccess.TableOfContentsEntry = ToCContent.TableOfContentsEntry AND TeamToCAccess.Team = @teamId
	ORDER BY TocContent.LastUpdated
END
/****** Object:  StoredProcedure [dbo].[Rx_GetAdditionalContentForTableOfContentEntry] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[Rx_GetAdditionalContentForTableOfContentEntry]
    @tableOfContentsEntryId [uniqueidentifier]
WITH EXECUTE AS CALLER
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;

    SELECT
        ToCContent.Id as AssociationId,
        AdditionalContent.ContentId,
        AdditionalContent.ContentType,
        AdditionalContent.Name as ContentName,
        AdditionalContent.ShortName,
        AdditionalContent.FileName,
        AdditionalContent.RawData,
        AdditionalContent.LastUpdate as ContentLastUpdated,
        AdditionalContent.EncryptionKey,
        AdditionalContent.ContentText,
        AdditionalContent.UnlockedByAchievement,
        Location.LocationId,
        Location.Name AS LocationName,
        Location.LastUpdate as LocationLastUpdated,
        Location.Address AS LocationAddress,
        Location.Latitude AS LocationLatitude,
        Location.Longitude AS LocationLongitude,
        Location.LocationFlag as LocationFlag
    FROM ToCContent
    LEFT JOIN Location ON Location.LocationId = ToCContent.Location
    LEFT JOIN AdditionalContent ON AdditionalContent.ContentId = ToCContent.AdditionalContent
    WHERE ToCContent.TableOfContentsEntry = @tableOfContentsEntryId
    ORDER BY TocContent.LastUpdated
END
GO
/****** Object:  StoredProcedure [dbo].[Rx_GetTableOfContentsEntriesToUnlock] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[Rx_GetTableOfContentsEntriesToUnlock]
    @teamId [uniqueidentifier],
    @answerId [uniqueidentifier]
WITH EXECUTE AS CALLER
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;

    SELECT SubmittableUnlockRelationship.*
    FROM SubmittableUnlockRelationship
    INNER JOIN Answer ON Answer.AnswerId = SubmittableUnlockRelationship.Answer
    LEFT JOIN TeamToCAccess ON TeamToCAccess.TableOfContentsEntry = SubmittableUnlockRelationship.TableOfContentsEntry AND 
                               TeamToCAccess.Team = @teamId
    WHERE Answer.AnswerId = @answerId AND                           
          TeamToCAccess.TableOfContentsEntry IS NULL
END
GO
/****** Object:  StoredProcedure [dbo].[TableOfContentsEntry_AddRating] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[TableOfContentsEntry_AddRating]
    @tocId [uniqueidentifier],
    @participationId [uniqueidentifier],
    @rating [int],
    @comment [nvarchar](max)
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;

    -- Insert statements for procedure here
    INSERT INTO ParticipationToCRating
    (Participation, TableOfContentsEntry, Rating, Comments)
    values
    (@participationId, @tocId, @rating, @comment)
END
GO
/****** Object:  StoredProcedure [dbo].[Team_GetRosterForTeam] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:      Game Control Team
-- Create Date: 2020.10.20
-- Description: Get the roster for a team
-- =============================================
CREATE PROCEDURE [dbo].[Team_GetRosterForTeam]
    @teamId UNIQUEIDENTIFIER
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON

    -- Insert statements for procedure here
    SELECT
        ParticipantId,
        ContactNumber,
        Email,
        FirstName,
        LastName
    FROM
        Participation
    INNER JOIN Participant on Participant.ParticipantId = Participation.Participant
    WHERE Participation.Team = @teamId
END
GO
/****** Object:  StoredProcedure [dbo].[ToCInstance_GetInstancesForEventInstance] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[ToCInstance_GetInstancesForEventInstance]
    @eventInstanceId UNIQUEIDENTIFIER
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;

    SELECT
        [ToCInstance].ToCInstanceId,
        [ToCInstance].TableOfContentsEntry,
        [ToCInstance].PrimaryStaff,
        [ToCInstance].CurrentTeam,
        [ToCInstance].FriendlyName,
        [ToCInstance].Notes,
        [ToCInstance].LastUpdated,
        [ToCInstance].NeedsReset
    FROM [ToCInstance]
    INNER JOIN TableOfContentsEntry on TableOfContentsEntry.TableOfContentId = ToCInstance.TableOfContentsEntry
    WHERE TableOfContentsEntry.EventInstance = @eventInstanceId
END
GO
/****** Object:  StoredProcedure [dbo].[UpdateTeamLocation] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[UpdateTeamLocation]
    @teamId [uniqueidentifier],
    @timeCollected [datetime],
    @latitude [decimal](16, 13),
    @longitude [decimal](16, 13),
    @errorRadius [float] = NULL,
    @sensorId [uniqueidentifier] = NULL,
    @sensorTypeId [uniqueidentifier] = NULL,
    @sensorName [nvarchar](255) = NULL
WITH EXECUTE AS CALLER
AS
BEGIN
    -- Cache the most recent update for quick lookups.
    UPDATE TeamLocationCache
    SET TimeCollected = @timeCollected,
        Latitude = @latitude,
        Longitude = @longitude,
        ErrorRadius = @errorRadius,
        SensorId = @sensorId,
        SensorTypeId = @sensorTypeId,
        SensorName = @sensorName
    WHERE Team = @teamId

    IF @@ROWCOUNT = 0
        INSERT INTO TeamLocationCache
            (Team, TimeCollected, Latitude, Longitude, ErrorRadius, SensorId, SensorTypeId, SensorName) VALUES
            (@teamId, @timeCollected, @latitude, @longitude, @errorRadius, @sensorId, @sensorTypeId, @sensorName)

    INSERT INTO TeamLocation
        (Team, TimeCollected, Latitude, Longitude, ErrorRadius, SensorId, SensorTypeId, SensorName) VALUES
        (@teamId, @timeCollected, @latitude, @longitude, @errorRadius, @sensorId, @sensorTypeId, @sensorName)
END
GO
USE [master]
GO
ALTER DATABASE [gamecontrol] SET  READ_WRITE 
GO

USE [gamecontrol]
GO
INSERT [dbo].[AdditionalContentType] ([ContentTypeId]) VALUES (N'Audio     ')
INSERT [dbo].[AdditionalContentType] ([ContentTypeId]) VALUES (N'Executable')
INSERT [dbo].[AdditionalContentType] ([ContentTypeId]) VALUES (N'File      ')
INSERT [dbo].[AdditionalContentType] ([ContentTypeId]) VALUES (N'Hyperlink ')
INSERT [dbo].[AdditionalContentType] ([ContentTypeId]) VALUES (N'Image     ')
INSERT [dbo].[AdditionalContentType] ([ContentTypeId]) VALUES (N'PlainText ')
INSERT [dbo].[AdditionalContentType] ([ContentTypeId]) VALUES (N'Property  ')
INSERT [dbo].[AdditionalContentType] ([ContentTypeId]) VALUES (N'RichText  ')
INSERT [dbo].[AdditionalContentType] ([ContentTypeId]) VALUES (N'Video     ')
INSERT [dbo].[AdditionalContentType] ([ContentTypeId]) VALUES (N'YoutubeUrl')
GO
INSERT [dbo].[EventType] ([EventTypeId]) VALUES (N'Beta                     ')
INSERT [dbo].[EventType] ([EventTypeId]) VALUES (N'RC                       ')
INSERT [dbo].[EventType] ([EventTypeId]) VALUES (N'RTM                      ')
GO
INSERT [dbo].[SettingType] ([SettingType]) VALUES (N'String    ')
INSERT [dbo].[SettingType] ([SettingType]) VALUES (N'UserString')
GO
INSERT [dbo].[SubmittableType] ([SubmittableTypeId]) VALUES (N'LocUnlock ')
INSERT [dbo].[SubmittableType] ([SubmittableTypeId]) VALUES (N'Plot      ')
INSERT [dbo].[SubmittableType] ([SubmittableTypeId]) VALUES (N'Puzzle    ')
INSERT [dbo].[SubmittableType] ([SubmittableTypeId]) VALUES (N'Tool      ')
GO
INSERT [dbo].[UnlockReason] ([UnlockReasonId]) VALUES (N'Answer    ')
INSERT [dbo].[UnlockReason] ([UnlockReasonId]) VALUES (N'GcUnlock  ')
INSERT [dbo].[UnlockReason] ([UnlockReasonId]) VALUES (N'Proximity ')
INSERT [dbo].[UnlockReason] ([UnlockReasonId]) VALUES (N'Points    ')
INSERT [dbo].[UnlockReason] ([UnlockReasonId]) VALUES (N'Skip      ')
GO
