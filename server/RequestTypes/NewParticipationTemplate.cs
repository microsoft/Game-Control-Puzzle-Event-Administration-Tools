using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.RequestTypes
{
    public class NewParticipationTemplate
    {
        public Guid? TeamId { get; set; }

        public bool IsStaff { get; set; }

        public bool IsAdmin { get; set; }
    }
}
