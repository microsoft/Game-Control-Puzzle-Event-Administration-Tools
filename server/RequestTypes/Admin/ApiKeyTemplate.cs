using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.RequestTypes.Admin
{
    public class ApiKeyTemplate
    {
        public int? Id { get; set; }

        public Guid EventInstance { get; set; }

        public string Name { get; set; }

        public string KeyValue { get; set; }

        public bool IsRevoked { get; set; }

        public DateTime LastUpdated { get; set; }
    }
}
