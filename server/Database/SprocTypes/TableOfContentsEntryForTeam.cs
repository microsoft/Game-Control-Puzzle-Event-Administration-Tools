using System;
using System.ComponentModel.DataAnnotations;

namespace GameControl.Server.Database.SprocTypes
{
    public class TableOfContentsEntryForTeam
    {
        [Key]
        public Guid TableOfContentId { get; set; }

        public string SubmittableTitle { get; set; }

        public string SubmittableType { get; set; }

        public DateTime SubmittableLastUpdate { get; set; }

        public Guid SubmittableId { get; set; }

        public int SortOrder { get; set; }

        public Boolean TakeOver { get; set; }

        public DateTime UnlockTime { get; set; }

        public DateTime? SubmissionTime { get; set; }

        public int AnswerCount { get; set; }
    }
}
