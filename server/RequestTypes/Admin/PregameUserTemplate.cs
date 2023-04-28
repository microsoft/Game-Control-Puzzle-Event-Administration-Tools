using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.RequestTypes.Admin
{
    public class PregameUserTemplate
    {
        public Guid? ParticipantId { get; set; }

        public string FirstName { get; set; }

        public string Email { get; set; }

        public string ContactNumber { get; set; }

        public Guid Oid { get; set; }
    }
}
