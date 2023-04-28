using System;
using System.ComponentModel.DataAnnotations;

namespace GameControl.Server.Database.Tables
{
    public class Event
    {
        [Key]
        public Guid EventId { get; set; }

        public string EventName { get; set; }
    }
}
