using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.RequestTypes
{
    public class NewPulseTemplate
    {
        public string PulseText { get; set; }

        public byte PulseRating { get; set; }
    }
}
