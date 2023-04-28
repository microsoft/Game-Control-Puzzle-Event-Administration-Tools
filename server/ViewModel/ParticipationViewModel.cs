using GameControl.Server.ViewModel.Admin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.ViewModel
{
    public class ParticipationViewModel
    {
        public Guid EventInstanceId { get; set; }

        public Guid ParticipationId { get; set; }

        public string EventFriendlyName { get; set; }

        public DateTime EventStartTime { get; set; }

        public DateTime EventEndTime { get; set; }

        public Guid? TeamId { get; set; }

        public string TeamName { get; set; }
        
        public string TeamShortName { get; set; }

        public bool IsStaff { get; set; }

        public bool IsAdmin { get; set; }

        public IEnumerable<SettingViewModel> Settings { get; set; }
    }
}
