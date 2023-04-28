using System;

namespace GameControl.Server.RequestTypes
{
    public class NewEventTemplate
    {
        public Guid? EventId { get; set; }

        public string EventName { get; set; }
    }
}
