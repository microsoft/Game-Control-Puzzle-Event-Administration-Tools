using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.RequestTypes.Auth
{
    public class MsaToken
    {
        public string Token { get; set; }
    }

    public class MsaUser
    {
        public Guid UserId { get; set; }

        public string PrincipalName { get; set; }

        public string GivenName { get; set; }

        public string Surname { get; set; }
    }
}
