using System;
using System.ComponentModel.DataAnnotations;

namespace GameControl.Server.Database.Tables
{
    public class ToCInstance
    {
        [Key]
        public Guid ToCInstanceId { get; set; }

        public Guid TableOfContentsEntry { get; set; }

        public Guid? PrimaryStaff { get; set; }

        public Guid? CurrentTeam { get; set; }

        public string FriendlyName { get; set; }

        public string Notes { get; set; }

        public bool NeedsReset { get; set; }

        public DateTime LastUpdated { get; set; }
    }
}
