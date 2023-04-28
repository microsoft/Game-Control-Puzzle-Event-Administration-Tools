using System;
using System.ComponentModel.DataAnnotations;

namespace GameControl.Server.Database.Tables
{
    public class ParticipationLogin
    {
        [Key]
        public string UserName { get; set; }

        public byte[] HashedSaltedPassword { get; set; }

        public byte[] Salt { get; set; }

        public Guid Participation { get; set; }

        public bool RequiresReset { get; set; }

        public string Token { get; set; }

        public Nullable<Guid> ResetId { get; set; }

    }
}
