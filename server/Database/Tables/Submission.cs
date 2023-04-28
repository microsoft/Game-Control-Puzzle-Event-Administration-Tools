using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GameControl.Server.Database.Tables
{
    public class Submission
    {
        [Key]
        public Guid SubmissionId { get; set; }

        public Guid Team { get; set; }

        public Guid Submittable { get; set; }

        [Column("Submission")]
        public string SubmissionText { get; set; }

        public DateTime SubmissionTime { get; set; }

        public string SubmissionSource { get; set; }

        public Guid? Participation { get; set; }
    }
}
