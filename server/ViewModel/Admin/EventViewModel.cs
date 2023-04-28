using GameControl.Server.Database.Tables;
using System;
using System.Collections.Generic;

namespace GameControl.Server.ViewModel.Admin
{
    public class EventViewModel
    {
        public Guid EventId { get; set; }

        public string Name { get; set; }

        public IEnumerable<EventInstance> EventInstances { get; set; }
    }
}
