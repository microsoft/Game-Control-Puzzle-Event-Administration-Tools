using System;

namespace GameControl.Server.RequestTypes
{
    public class NewTeamTemplate
    {
        public Guid? TeamId { get; set; }

        public string Name { get; set; }

        public string ShortName { get; set; }

        public int Color { get; set; }

        public string Passphrase { get; set; }

        public Boolean IsTestTeam { get; set; }

        public Guid? CorrelationId { get; set; }

        public string GcNotes { get; set; }
    
    }
}
