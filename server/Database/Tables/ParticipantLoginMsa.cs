using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.Database.Tables
{
    public class ParticipantLoginMsa
    {
        [Key]
        public Guid MicrosoftId { get; set; }

        public Guid Participant { get; set; }

        public string PrincipalName { get; set; }
    }
}
