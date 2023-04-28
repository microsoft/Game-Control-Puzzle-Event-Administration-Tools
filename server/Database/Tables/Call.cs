using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.Database.Tables
{
    public class Call
    {
        [Key]
        public Guid CallId { get; set; }

        public Guid Team { get; set; }

        public Guid Participant { get; set; }

        public DateTime CallStart { get; set; }

        public DateTime? CallEnd { get; set; }

        public string CallType { get; set; }

        public string CallSubType { get; set; }

        public DateTime LastUpdated { get; set; }

        public Guid? ToCEntry { get; set; }

        public string Notes { get; set; }

        public string TeamNotes { get; set; }

        public string PublicNotes { get; set; }
    }
}
