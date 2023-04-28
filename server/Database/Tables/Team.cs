using System;
using System.ComponentModel.DataAnnotations;

namespace GameControl.Server.Database.Tables
{
    public class Team
    {
        [Key]
        public Guid TeamId { get; set; }

        public Guid EventInstance { get; set; }

        public string Name { get; set; }

        public string ShortName { get; set; }

        public int Color { get; set; }

        public DateTime LastUpdate { get; set; }

        public string Passphrase { get; set; }

        public long? Points { get; set; }

        public Boolean IsTestTeam { get; set; }

        // NOTE: [Game Control Team] This column is a legacy column from pre-2011. Back when Game Control was an app on
        // laptops we handed out, we used certificates that we pre-installed on the laptops to authenticate
        // teams, and this field stored the thumbprint of those certs. There is no historical data in
        // the DB that actually uses it and for now it's being used as an optional correlation field with the
        // pregame site.
        public string CertificateThumbprint { get; set; }

        public string GcNotes { get; set; }
    }
}
