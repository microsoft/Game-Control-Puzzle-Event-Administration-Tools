using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;

namespace GameControl.Server.Controllers
{
    public class ControllerBase : Controller
    {
        protected Guid ParticipantIdFromClaim
        {
            get
            {
                return Guid.Parse(User.Claims.First(p => p.Type == "ParticipantId").Value);
            }
        }
    }
}
