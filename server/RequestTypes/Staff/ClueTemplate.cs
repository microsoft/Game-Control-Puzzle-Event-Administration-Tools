using System;

namespace GameControl.Server.RequestTypes.Staff
{
    public class ClueTemplate
    {
        public Guid? TableOfContentId { get; set; }

        public Guid? SubmittableId { get; set; }

        public string Title { get; set; }

        public string ShortTitle { get; set; }

        public string SubmittableType { get; set; }

        public int SortOrder { get; set; }

        public DateTime? OpenTime { get; set; }

        public DateTime? ClosingTime { get; set; }

        public int? ParTime { get; set; }
    }
}
