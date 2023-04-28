using System;
using System.ComponentModel.DataAnnotations;

namespace GameControl.Server.Database.Tables
{
    public class ApiKey
    {
        [Key]
        public int Id { get; set; }

        public Guid EventInstance { get; set; }

        public string Name { get; set; }

        public string KeyValue { get; set; }

        public bool IsRevoked { get; set; }

        public DateTime LastUpdated { get; set; }
    }
}
