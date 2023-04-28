using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.Database.Tables
{
    public class TeamToCAccess
    {
        public Guid Team { get; set; }

        public Guid TableOfContentsEntry { get; set; }

        public DateTime UnlockTime { get; set; }

        public string UnlockReason { get; set; }

        public Guid? UnlockSubmission { get; set; }
    }
}
