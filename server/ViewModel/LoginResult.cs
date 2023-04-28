using System;
using System.Collections.Generic;

namespace GameControl.Server.ViewModel
{
    public class LoginResult
    {
        public Guid ParticipantId { get; set; }

        public string DisplayName { get; set; }

        public string Token { get; set; }

        public int ExpireTime { get; set; }

        public EventInfo DefaultEventInstance { get; set; }

        public IEnumerable<ParticipationViewModel> Participation { get; set; }
    }
}
