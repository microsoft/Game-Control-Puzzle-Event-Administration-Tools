using System;
using System.ComponentModel.DataAnnotations;

namespace GameControl.Server.Database.Tables
{
    public class GcMessage
    {
        [Key]
        public Guid MessageId { get; set; }

        public Guid GcParticipation { get; set; }

        public Guid Team { get; set; }

        public string MessageText { get; set; }

        public DateTime LastUpdated { get; set; }
    }
}
