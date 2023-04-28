using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.RequestTypes
{
    public class AchievementTemplate
    {
        public Guid? AchievementId { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public IFormFile AchievementImage { get; set; }
    }
}
