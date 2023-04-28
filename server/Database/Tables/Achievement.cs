using System;
using System.ComponentModel.DataAnnotations;

namespace GameControl.Server.Database.Tables
{
    public class Achievement
    {
        [Key]
        public Guid AchievementId { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public byte[] Icon { get; set; }

        public DateTime CreatedOn { get; set; }

        public Guid EventId { get; set; }
    }
}

