using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.RequestTypes
{
    public class CallTemplate
    {
        public Guid? CallId { get; set; }

        public Guid? TeamId { get; set; }

        public Guid? ParticipationId { get; set; }

        public Guid? TableOfContentsEntry { get; set; }

        public string CallType { get; set; }

        public string CallSubType { get; set; }

        public string Notes { get; set; }

        public string TeamNotes { get; set; }

        public string PublicNotes { get; set; }

        public DateTime? CallEnd { get; set; }
    }
}
