using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.Database.SprocTypes
{
    public class GridData
    {
        /*
                SELECT Submittable.SubmittableId,
                       Submittable.Title,
                       Access.UnlockTime,
                       Access.UnlockReason,
                       Team.Name,       
                       Team.ShortName,
                       Team.Color,
                       Team.IsTestTeam,
                       EarliestCorrectSubmission.SubmissionTime,
                       Team.TeamId
                       */

        [Key]
        public Guid SubmittableId { get; set; }

        public string Title { get; set; }

        public DateTime UnlockTime { get; set; }

        public string UnlockReason { get; set; }

        public string Name { get; set; }

        public string ShortName { get; set; }

        public int Color { get; set; }

        public bool? IsTestTeam { get; set; }

        public DateTime? SubmissionTime { get; set; }

        [Key]
        public Guid? TeamId { get; set; }
    }
}
