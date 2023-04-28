using GameControl.Server.Database.Tables;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.ViewModel.Player
{
    public class PlayerChallengeSubmissionViewModel
    {
        public PlayerChallengeSubmissionViewModel() { }

        public PlayerChallengeSubmissionViewModel(ChallengeSubmission source)
        {
            this.ChallengeSubmissionId = source.ChallengeSubmissionId;
            this.SubmissionDate = source.SubmissionDate;
            this.State = source.State;
            this.SubmissionType = source.SubmissionType;
            this.SubmissionNotes = source.SubmissionNotes;
            this.SubmissionTextContent = source.SubmissionTextContent;
            this.ApproverText = source.ApproverText;
        }

        public Guid ChallengeSubmissionId { get; set; }

        public DateTime SubmissionDate { get; set; }

        public int State { get; set; }

        public string SubmissionType { get; set; }

        public string SubmissionNotes { get; set; }

        public string SubmissionTextContent { get; set; }

        public string ApproverText { get; set; }
    }
}
