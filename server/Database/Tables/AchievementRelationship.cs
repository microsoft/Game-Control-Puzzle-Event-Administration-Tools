using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.Database.Tables
{
    public class AchievementRelationship
    {
        public Guid AchievementId { get; set; }

        public Guid EventInstanceId { get; set; }

        public Guid AnswerId { get; set; }
    }
}
