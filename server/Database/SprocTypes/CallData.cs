using System;
using System.ComponentModel.DataAnnotations;

namespace GameControl.Server.Database.SprocTypes
{
    public class CallData
    {
        [Key]
        public Guid CallId { get; set; }

        public Guid Team { get; set; }

        public string ShortName { get; set; }

        public int Color { get; set; }

        public Guid Participant { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public DateTime CallStart { get; set; }

        public DateTime? CallEnd { get; set; }

        public string CallType { get; set; }

        public string CallSubType { get; set; }

        public Guid? ToCEntry { get; set; }

        public string Notes { get; set; }

        public string TeamNotes { get; set; }

        public string PublicNotes { get; set; }

        public DateTime LastUpdated { get; set; }
    }
}
