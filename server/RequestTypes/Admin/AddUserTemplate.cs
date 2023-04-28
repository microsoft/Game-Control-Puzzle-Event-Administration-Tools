using System;

namespace GameControl.Server.RequestTypes.Admin
{
    public class AddUserTemplate
    {
        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string Email { get; set; }

        public string ContactNumber { get; set; }

        public Guid? TeamId { get; set; }

        public bool? IsStaff { get; set; }

        public bool? IsAdmin { get; set; }

        public string Login { get; set; }

        public string Password { get; set; }
    }
}
