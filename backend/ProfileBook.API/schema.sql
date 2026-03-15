IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
CREATE TABLE [Users] (
    [UserId] int NOT NULL IDENTITY,
    [Username] nvarchar(max) NOT NULL,
    [Email] nvarchar(max) NOT NULL,
    [PasswordHash] nvarchar(max) NOT NULL,
    [Role] nvarchar(max) NOT NULL,
    [ProfileImage] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY ([UserId])
);

CREATE TABLE [Messages] (
    [MessageId] int NOT NULL IDENTITY,
    [MessageContent] nvarchar(max) NOT NULL,
    [TimeStamp] datetime2 NOT NULL,
    [SenderId] int NOT NULL,
    [ReceiverId] int NOT NULL,
    [UserId] int NULL,
    CONSTRAINT [PK_Messages] PRIMARY KEY ([MessageId]),
    CONSTRAINT [FK_Messages_Users_ReceiverId] FOREIGN KEY ([ReceiverId]) REFERENCES [Users] ([UserId]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Messages_Users_SenderId] FOREIGN KEY ([SenderId]) REFERENCES [Users] ([UserId]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Messages_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId])
);

CREATE TABLE [Posts] (
    [PostId] int NOT NULL IDENTITY,
    [Content] nvarchar(max) NOT NULL,
    [PostImage] nvarchar(max) NULL,
    [Status] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UserId] int NOT NULL,
    CONSTRAINT [PK_Posts] PRIMARY KEY ([PostId]),
    CONSTRAINT [FK_Posts_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]) ON DELETE CASCADE
);

CREATE TABLE [Reports] (
    [ReportId] int NOT NULL IDENTITY,
    [Reason] nvarchar(max) NOT NULL,
    [TimeStamp] datetime2 NOT NULL,
    [ReportedUserId] int NOT NULL,
    [ReportingUserId] int NOT NULL,
    CONSTRAINT [PK_Reports] PRIMARY KEY ([ReportId]),
    CONSTRAINT [FK_Reports_Users_ReportedUserId] FOREIGN KEY ([ReportedUserId]) REFERENCES [Users] ([UserId]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Reports_Users_ReportingUserId] FOREIGN KEY ([ReportingUserId]) REFERENCES [Users] ([UserId]) ON DELETE NO ACTION
);

CREATE TABLE [Comments] (
    [CommentId] int NOT NULL IDENTITY,
    [Content] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [PostId] int NOT NULL,
    [UserId] int NOT NULL,
    CONSTRAINT [PK_Comments] PRIMARY KEY ([CommentId]),
    CONSTRAINT [FK_Comments_Posts_PostId] FOREIGN KEY ([PostId]) REFERENCES [Posts] ([PostId]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Comments_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]) ON DELETE NO ACTION
);

CREATE TABLE [Likes] (
    [LikeId] int NOT NULL IDENTITY,
    [CreatedAt] datetime2 NOT NULL,
    [PostId] int NOT NULL,
    [UserId] int NOT NULL,
    CONSTRAINT [PK_Likes] PRIMARY KEY ([LikeId]),
    CONSTRAINT [FK_Likes_Posts_PostId] FOREIGN KEY ([PostId]) REFERENCES [Posts] ([PostId]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Likes_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]) ON DELETE NO ACTION
);

CREATE INDEX [IX_Comments_PostId] ON [Comments] ([PostId]);

CREATE INDEX [IX_Comments_UserId] ON [Comments] ([UserId]);

CREATE INDEX [IX_Likes_PostId] ON [Likes] ([PostId]);

CREATE INDEX [IX_Likes_UserId] ON [Likes] ([UserId]);

CREATE INDEX [IX_Messages_ReceiverId] ON [Messages] ([ReceiverId]);

CREATE INDEX [IX_Messages_SenderId] ON [Messages] ([SenderId]);

CREATE INDEX [IX_Messages_UserId] ON [Messages] ([UserId]);

CREATE INDEX [IX_Posts_UserId] ON [Posts] ([UserId]);

CREATE INDEX [IX_Reports_ReportedUserId] ON [Reports] ([ReportedUserId]);

CREATE INDEX [IX_Reports_ReportingUserId] ON [Reports] ([ReportingUserId]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260312060243_InitialCreate', N'10.0.4');

COMMIT;
GO

BEGIN TRANSACTION;
CREATE TABLE [Groups] (
    [GroupId] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Groups] PRIMARY KEY ([GroupId])
);

CREATE TABLE [GroupMembers] (
    [GroupMemberId] int NOT NULL IDENTITY,
    [GroupId] int NOT NULL,
    [UserId] int NOT NULL,
    [JoinedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_GroupMembers] PRIMARY KEY ([GroupMemberId]),
    CONSTRAINT [FK_GroupMembers_Groups_GroupId] FOREIGN KEY ([GroupId]) REFERENCES [Groups] ([GroupId]) ON DELETE CASCADE,
    CONSTRAINT [FK_GroupMembers_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]) ON DELETE CASCADE
);

CREATE INDEX [IX_GroupMembers_GroupId] ON [GroupMembers] ([GroupId]);

CREATE INDEX [IX_GroupMembers_UserId] ON [GroupMembers] ([UserId]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260313062457_AddGroups', N'10.0.4');

COMMIT;
GO

BEGIN TRANSACTION;
INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260313110041_AddProfileImage', N'10.0.4');

COMMIT;
GO

