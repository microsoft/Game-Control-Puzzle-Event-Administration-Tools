using System;
using System.ComponentModel.DataAnnotations;

namespace GameControl.Server.Database.SprocTypes
{
    public class RatingForTableOfContentsEntry
    {
        [Key]
        public Guid TableOfContentsEntry { get; set; }

        [Key]
        public Guid Participation { get; set; }

        public int Rating { get; set; }

        public string Comments { get; set; }

        public DateTime LastUpdated { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string Name { get; set; }
    }
}
