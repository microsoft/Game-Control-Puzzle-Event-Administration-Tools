using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.Database.Tables
{
    public class Pulse
    {
        [Key]
        public Guid PulseId { get; set; }

        // NOTE: Deprecated
        public Guid? Team { get; set; }

        public string PulseText { get; set; }

        public byte PulseRating { get; set; }

        public DateTime LastUpdated { get; set; }

        public byte[] TeamPic { get; set; }

        // NOTE: Technically non-null, but may be null for legacy pulses
        public Guid? Participation { get; set; }

        public decimal? Latitude { get; set; }

        public decimal? Longitude { get; set; }
    }
}
