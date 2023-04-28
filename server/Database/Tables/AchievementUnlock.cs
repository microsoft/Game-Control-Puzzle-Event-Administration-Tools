using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.Database.Tables
{
    public class AchievementUnlock
    {
        public Guid AchievementId { get; set; }

        public Guid TeamId { get; set; }

        public Guid ParticipantId { get; set; }

        public DateTime UnlockedOn { get; set; }
    }
}
