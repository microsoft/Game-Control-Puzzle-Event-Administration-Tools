using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.Database.SprocTypes
{
    public class GetAllSubmissionsResult
    {
        [Key]
        public Guid ChallengeSubmissionId { get; set; }

        public Guid Challenge { get; set; }

        public Guid Participant { get; set; }

        public DateTime SubmissionDate { get; set; }

        public DateTime LastChanged { get; set; }

        public int State { get; set; }

        public Guid? Approver { get; set; }

        public string SubmissionType { get; set; }

        public string SubmissionNotes { get; set; }

        public string SubmissionTextContent { get; set; }

        public string ApproverText { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public Guid TeamId { get; set; }

        public string Name { get; set; }

        public bool IsTestTeam { get; set; }
    }
}
