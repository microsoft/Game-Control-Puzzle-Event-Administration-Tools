using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace GameControl.Server.RequestTypes
{
    public class NewPhotoPulseTemplate : NewPulseTemplate
    {
        public IFormFile PulseImage { get; set; }
    }
}
