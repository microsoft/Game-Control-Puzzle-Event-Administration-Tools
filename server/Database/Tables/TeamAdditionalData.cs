using System;
using System.ComponentModel.DataAnnotations;

namespace GameControl.Server.Database.Tables
{
    public class TeamAdditionalData
    {
        [Key]
        public Guid Team { get; set; }

        [Key]
        public string DataKey { get; set; }

        public string DataValue { get; set; }

        public DateTime LastUpdated { get; set; }
    }
}
