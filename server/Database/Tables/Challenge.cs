using System;
using System.ComponentModel.DataAnnotations;

namespace GameControl.Server.Database.Tables
{
    public class Challenge
    {
        [Key]
        public Guid ChallengeId { get; set; }

        public Guid EventInstance { get; set; }

        public string Title { get; set; }

        public string Description { get; set; }

        public DateTime? StartTime { get; set; }

        public DateTime? EndTime { get; set; }

        public DateTime LastUpdated { get; set; }

        public long PointsAwarded { get; set; }
    }
}
