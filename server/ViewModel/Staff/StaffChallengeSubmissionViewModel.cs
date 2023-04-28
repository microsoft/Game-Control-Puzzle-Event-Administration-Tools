using GameControl.Server.Database.SprocTypes;
using GameControl.Server.Database.Tables;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.ViewModel.Staff
{
    public class StaffChallengeSubmissionViewModel
    {
        public StaffChallengeSubmissionViewModel()
        {
        }

        public StaffChallengeSubmissionViewModel(ChallengeSubmission submission)
        {
            this.ApproverId = submission.Approver;
        }

        public StaffChallengeSubmissionViewModel(GetAllSubmissionsResult submission)
        {
            this.ChallengeId = submission.Challenge;
            this.ChallengeSubmissionId = submission.ChallengeSubmissionId;
            this.SubmissionDate = submission.SubmissionDate;
            this.State = submission.State;
            this.SubmissionType = submission.SubmissionType;
            this.SubmissionNotes = submission.SubmissionNotes;
            this.SubmissionTextContent = submission.SubmissionTextContent;
            this.SubmitterDisplayName = string.IsNullOrEmpty(submission.LastName) ?
                string.Format("{0} ({1})", submission.FirstName, submission.Name) :
                string.Format("{0} {1} ({2})", submission.FirstName, submission.LastName, submission.Name);
            this.ApproverNotes = submission.ApproverText;
            this.TeamId = submission.TeamId;
        }

        public Guid ChallengeId { get; set; }

        public Guid ChallengeSubmissionId { get; set; }

        public DateTime SubmissionDate { get; set; }

        public int State { get; set; }

        public string SubmissionType { get; set; }

        public string SubmissionNotes { get; set; }

        public string SubmissionTextContent { get; set; }

        public string SubmitterDisplayName { get; set; }

        public string ApproverNotes { get; set; }

        public Guid? ApproverId { get; set; }

        public string ApproverDisplayName { get; set; }

        public Guid TeamId { get; set; }
    }
}
