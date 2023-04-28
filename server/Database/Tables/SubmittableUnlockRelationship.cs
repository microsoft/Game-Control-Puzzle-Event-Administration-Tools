using System;
using System.ComponentModel.DataAnnotations;

namespace GameControl.Server.Database.Tables
{
    public class SubmittableUnlockRelationship
    {
        public Guid Answer { get; set; }

        public Guid TableOfContentsEntry { get; set; }

        public DateTime LastUpdated { get; set; }

        public Guid? Team { get; set; }
    }
}
