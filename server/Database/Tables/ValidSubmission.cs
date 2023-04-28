using System;
using System.ComponentModel.DataAnnotations;

namespace GameControl.Server.Database.Tables
{
    public class ValidSubmission
    {
        [Key]
        public Guid SubmissionId { get; set; }

        public string Submission { get; set; }

        public Guid SubmittableId { get; set; }

        public DateTime SubmissionTime { get; set; }

        public string AnswerResponse { get; set; }

        public bool IsCorrectAnswer { get; set; }

        public bool IsHidden { get; set; }

        public Guid TeamId { get; set; }

        public Guid? AnswerId { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public Guid? AppliesToTeam { get; set; }

        public Guid? AdditionalContent { get; set; }
    }
}
