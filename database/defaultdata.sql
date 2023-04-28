USE [gamecontrol]
GO
INSERT INTO [dbo].[Event] ([EventId], [EventName])
VALUES (
        '88888888-8888-8888-8888-888888888888',
        'Default Event'
    )
GO
INSERT INTO [dbo].[EventInstance] (
        [EventInstanceId],
        [Event],
        [EventType],
        [FriendlyName],
        [StartTime],
        [EndTime]
    )
VALUES (
        '99999999-9999-9999-9999-999999999999',
        '88888888-8888-8888-8888-888888888888',
        'Beta',
        'Default Event Instance',
        1 / 1 / 1900,
        12 / 31 / 2099
    )
GO
INSERT INTO [dbo].[Participant] (
        [ParticipantId],
        [FirstName],
        [LastName],
        [Email],
        [LastChanged],
        [DefaultParticipation],
        [ContactNumber],
        [AdditionalRoles]
    )
VALUES (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'Default',
        'Administrator',
        'admin@example.com',
        1 / 1 / 1900,
        NULL,
        NULL,
        1
    )
GO
INSERT INTO [dbo].[Participation] (
        [ParticipationId],
        [Participant],
        [EventInstance],
        [Team],
        [LastUpdated],
        [IsStaff],
        [IsAdmin]
    )
VALUES (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '99999999-9999-9999-9999-999999999999',
        NULL,
        1 / 1 / 1900,
        1,
        1
    )
GO

INSERT INTO [dbo].[ParticipationLogin] (
        [UserName],
        [HashedSaltedPassword],
        [Salt],
        [Participation],
        [RequiresReset],
        [Token],
        [ResetId]
    )
VALUES (
        '!!!USERNAME!!!',
        !!!PASSWORDHASH!!!,
        !!!PASSWORDSALT!!!,
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        0,
        NULL,
        NULL
    )
GO