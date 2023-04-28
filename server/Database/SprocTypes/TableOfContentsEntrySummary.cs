using System;
using System.ComponentModel.DataAnnotations;

namespace GameControl.Server.Database.SprocTypes
{
    public class TableOfContentsEntrySummary
    {
        [Key]
        public Guid TableOfContentId { get; set; }

        public string Title { get; set; }

        public string ShortTitle { get; set; }

        public string SubmittableType { get; set; }

        public DateTime LastUpdate { get; set; }

        public Guid SubmittableId { get; set; }

        public int SortOrder { get; set; }
    }
}
