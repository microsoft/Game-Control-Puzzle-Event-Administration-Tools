using System;
using System.ComponentModel.DataAnnotations;

namespace GameControl.Server.Database.Tables
{
    public class TableOfContentsEntry
    {
        [Key]
        public Guid TableOfContentId { get; set; }

        public int SortOrder { get; set; }

        public Guid Submittable { get; set; }

        public Guid EventInstance { get; set; }

        public Boolean GloballyAvailable { get; set; }

        public Boolean TakeOver { get; set; }

        public DateTime? OpenTime { get; set; }

        public DateTime? ClosingTime { get; set; }

        public int? ParSolveTime { get; set; }
    }
}
