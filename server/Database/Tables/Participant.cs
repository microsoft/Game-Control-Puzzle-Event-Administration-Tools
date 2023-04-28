using System;
using System.ComponentModel.DataAnnotations;

namespace GameControl.Server.Database.Tables
{
    public class Participant
    {
        [Key]
        public Guid ParticipantId { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string Email { get; set; }

        public DateTime LastChanged { get; set; }

        public Guid? DefaultParticipation { get; set; }

        public string ContactNumber { get; set; }

        public int AdditionalRoles { get; set; }
    }
}
