using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.Database.SprocTypes
{
    public class ParticipationsForAdmin
    {
        public Guid ParticipantId { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string Email { get; set; }

        public string ContactNumber { get; set; }

        public Guid EventInstanceId { get; set; }

        public Guid EventId { get; set; }

        public string UserName { get; set; }

        public Boolean IsStaff { get; set; }

        public Boolean IsAdmin { get; set; }

        public string TeamName { get; set; }

        public Boolean RequiresReset { get; set; }
    }
}
