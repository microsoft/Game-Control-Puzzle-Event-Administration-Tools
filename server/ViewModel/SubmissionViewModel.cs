using GameControl.Server.Database.Tables;
using System;
using System.Collections.Generic;

namespace GameControl.Server.ViewModel
{
    public class UnlockedInfo
    {
        public Guid TableOfContentId { get; set; }

        public string Title { get; set; }
    }

    public class SubmissionViewModel
    {
        public SubmissionViewModel()
        {
            this.UnlockedTocs = new List<UnlockedInfo>();
            this.UnlockedAchievements = new List<AchievementViewModel>();
        }

        public SubmissionViewModel(ValidSubmission dbSubmission, bool hideSubmission = false)
        {
            this.SubmissionId = dbSubmission.SubmissionId;
            this.AnswerId = dbSubmission.AnswerId;
            this.SubmittableId = dbSubmission.SubmittableId;
            this.Submission = dbSubmission.IsHidden && hideSubmission ? "" : dbSubmission.Submission;
            this.AnswerResponse = dbSubmission.AnswerResponse;
            this.IsCorrectAnswer = dbSubmission.IsCorrectAnswer;
            this.IsHidden = dbSubmission.IsHidden;
            this.SubmissionTime = dbSubmission.SubmissionTime;
            this.SubmitterDisplayName = dbSubmission.FirstName + ' ' + dbSubmission.LastName;
            this.UnlockedTocs = new List<UnlockedInfo>();
            this.UnlockedAchievements = new List<AchievementViewModel>();
            this.AdditionalContentId = dbSubmission.AdditionalContent;
        }

        public Guid SubmissionId { get; set; }

        public Guid? AnswerId { get; set; }

        public Guid SubmittableId { get; set; }

        public string Submission { get; set; }

        public string AnswerResponse { get; set; }

        public string SubmitterDisplayName { get; set; }

        public DateTime SubmissionTime { get; set; }

        public bool IsCorrectAnswer { get; set; }

        public bool IsHidden { get; set; }

        public List<UnlockedInfo> UnlockedTocs { get; set; }

        public IEnumerable<AchievementViewModel> UnlockedAchievements { get; set; }

        internal Guid? AdditionalContentId { get; set; }

        public ContentViewModel AdditionalContent { get; set; }
    }
}
