using System;
using System.Collections.Generic;

namespace GameControl.Server.RequestTypes.Staff
{
    public class GcMessageTemplate
    {
        public string Message { get; set; }

        public IEnumerable<Guid> Teams { get; set; }
    }
}
