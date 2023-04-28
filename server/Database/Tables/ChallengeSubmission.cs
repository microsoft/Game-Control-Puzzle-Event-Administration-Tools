using System;
using System.ComponentModel.DataAnnotations;

namespace GameControl.Server.Database.Tables
{
    public class ChallengeSubmission
    {
        [Key]
        public Guid ChallengeSubmissionId { get; set; }

        public Guid Challenge { get; set; }

        public Guid Participant { get; set; }

        public DateTime SubmissionDate { get; set; }

        public DateTime LastChanged { get; set; }

        public int State { get; set; }

        public Guid? Approver { get; set; }

        public string ApproverText { get; set; }

        public string SubmissionType { get; set; }

        public string SubmissionNotes { get; set; }

        public string SubmissionTextContent { get; set; }

        public byte[] SubmissionBinaryContent { get; set; }
    }
}
