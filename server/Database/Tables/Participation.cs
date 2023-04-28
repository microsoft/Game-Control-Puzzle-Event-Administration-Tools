using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.Database.Tables
{
    public class Participation
    {
        [Key]
        public Guid ParticipationId { get; set; }

        public Guid Participant { get; set; }

        public Guid EventInstance { get; set; }

        public Guid? Team { get; set; }

        public DateTime LastUpdated { get; set; }

        public bool IsStaff { get; set; }

        public bool IsAdmin { get; set; }
    }
}
