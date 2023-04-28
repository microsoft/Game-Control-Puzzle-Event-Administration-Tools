using System;
using System.ComponentModel.DataAnnotations;

namespace GameControl.Server.Database.Tables
{
    public class Answer
    {
        [Key]
        public Guid AnswerId { get; set; }

        public Guid EventInstance { get; set; }

        public Guid Submittable { get; set; }

        public string AnswerText { get; set; }

        public string AnswerResponse { get; set; }

        public Boolean IsCorrectAnswer { get; set; }

        public Guid? AppliesToTeam { get; set; }

        public DateTime LastUpdated { get; set; }

        public Guid? AdditionalContent { get; set; }

        public bool IsHidden { get; set; }
    }
}
