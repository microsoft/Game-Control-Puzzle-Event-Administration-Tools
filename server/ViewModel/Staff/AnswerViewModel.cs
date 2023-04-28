using GameControl.Server.Database.SprocTypes;
using GameControl.Server.Database.Tables;
using System;
using System.Collections.Generic;

namespace GameControl.Server.ViewModel.Staff
{
    public class AnswerViewModel
    {
        public AnswerViewModel()
        {
            this.UnlockedClues = new List<TableOfContentsEntrySummary>();
            this.UnlockedAchievements = new List<AchievementViewModel>();
        }

        public AnswerViewModel(Answer dbRow) : this()
        {
            this.AnswerId = dbRow.AnswerId;
            this.AnswerResponse = dbRow.AnswerResponse;
            this.AnswerText = dbRow.AnswerText;
            this.IsCorrectAnswer = dbRow.IsCorrectAnswer;
            this.TeamId = dbRow.AppliesToTeam;
            this.IsHidden = dbRow.IsHidden;
        }

        public Guid AnswerId { get; set; }

        public string AnswerText { get; set; }

        public string AnswerResponse { get; set; }

        public bool IsCorrectAnswer { get; set; }

        public bool IsHidden { get; set; }

        public Guid? TeamId { get; set; }

        public IEnumerable<TableOfContentsEntrySummary> UnlockedClues { get; set; }

        public IEnumerable<AchievementViewModel> UnlockedAchievements { get; set; }

        internal Guid? AdditionalContentId { get; set; }

        public ContentViewModel AdditionalContent { get; set; }
    }
}
