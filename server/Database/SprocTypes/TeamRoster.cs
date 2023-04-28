using System;

namespace GameControl.Server.Database.SprocTypes
{
    public class TeamRoster
    {
        public Guid ParticipantId { get; set; }

        public string ContactNumber { get; set; }

        public string Email { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }
    }
}
