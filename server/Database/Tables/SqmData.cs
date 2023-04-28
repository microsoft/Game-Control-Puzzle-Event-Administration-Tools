using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.Database.Tables
{
    public class SqmData
    {
        [Key]
        public Guid SqmId { get; set; }

        public Guid? Team { get; set; }

        public string Data { get; set; }

        public DateTime LastUpdated { get; set; }

        public DateTime TimeCollected { get; set; }

        public Guid? Participation { get; set; }
    }
}
