using System;

namespace GameControl.Server.RequestTypes.Staff
{
    public class AnswerTemplate
    {
        public Guid? AnswerId { get; set; }

        public string AnswerText { get; set; }

        public string AnswerResponse { get; set; }

        public bool IsCorrectAnswer { get; set; }

        public bool IsHidden { get; set; }

        public bool IsTeamSpecific { get; set; }

        public Guid? TeamId { get; set; }
    }
}
