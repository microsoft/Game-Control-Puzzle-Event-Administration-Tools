using System;
using System.ComponentModel.DataAnnotations;

namespace GameControl.Server.Database.Tables
{
    public class ParticipationToCRating
    {
        [Key]
        public Guid Participation { get; set; }

        [Key]
        public Guid TableOfContentsEntry { get; set; }

        public int Rating { get; set; }

        public string Comments { get; set; }

        public DateTime LastUpdated { get; set; }
    }
}
