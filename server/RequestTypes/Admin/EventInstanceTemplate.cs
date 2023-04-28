using System;

namespace GameControl.Server.RequestTypes.Admin
{
    public class EventInstanceTemplate
    {
        public string EventType { get; set; }

        public string FriendlyName { get; set; }

        public DateTime StartTime { get; set; }

        public DateTime EndTime { get; set; }
    }
}
