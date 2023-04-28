using Microsoft.AspNetCore.Http;
using System;

namespace GameControl.Server.RequestTypes.Player
{
    public class ChallengeSubmissionTemplate
    {
        public Guid? ChallengeSubmissionId { get; set; }

        public Guid Challenge { get; set; }

        public string SubmissionType { get; set; }

        public string SubmissionNotes { get; set; }

        public string SubmissionTextContent { get; set; }

        public IFormFile SubmissionBinaryContent { get; set; }
    }
}
