using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.Database.Tables
{
    public class EventInstance
    {
        [Key]
        public Guid EventInstanceId { get; set; }

        public Guid Event { get; set; }

        public string EventType { get; set; }

        public string FriendlyName { get; set; }

        public DateTime StartTime { get; set; }

        public DateTime EndTime { get; set; }
    }
}
