using System;

namespace GameControl.Server.RequestTypes.Staff
{
    public class LocationTemplate
    {
        public Guid? LocationId { get; set; }

        public string Name { get; set; }

        public string Address { get; set; }

        public decimal Latitude { get; set; }

        public decimal Longitude { get; set; }

        public int LocationFlags { get; set; }
    }
}
