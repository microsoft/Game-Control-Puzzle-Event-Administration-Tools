using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GameControl.Server.Database.Tables;

namespace GameControl.Server.ViewModel
{
    public class UserViewModel
    {
        public UserViewModel() { }

        public UserViewModel(Participant participant)
        {
            this.ParticipantId = participant.ParticipantId;
            this.ContactNumber = participant.ContactNumber;
            this.Email = participant.Email;
            this.FirstName = participant.FirstName;
            this.LastName = participant.LastName;
            this.DisplayName = participant.FirstName + " " + participant.LastName;
        }

        public Guid ParticipantId { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string DisplayName { get; set; }

        public string Email { get; set; }

        public string ContactNumber { get; set; }

        public List<ParticipationViewModel> Participation { get; set; }

        public List<LoginMap> LoginNames { get; set; }
    }

    public class LoginMap
    {
        public string LoginName { get; set; }

        public string EventName { get; set; }
    }
}
