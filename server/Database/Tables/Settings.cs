using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.Database.Tables
{
    public class Settings
    {
        [Key]
        public int SettingId { get; set; }

        public Guid EventInstanceId { get; set; }

        public string Name { get; set; }

        public string SettingType { get; set; }

        public string StringValue { get; set; }

        public byte[] BinaryValue { get; set; }

        public DateTime LastUpdated { get; set; }
    }
}
