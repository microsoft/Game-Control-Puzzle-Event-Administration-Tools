using GameControl.Server.ViewModel.Admin;
using System;
using System.Collections.Generic;

namespace GameControl.Server.ViewModel
{
    public class EventInfo
    {
        public Guid EventInstanceId { get; set; }

        public string EventName { get; set; }

        public bool IsStaff { get; set; }

        public bool IsAdmin { get; set; }

        public IEnumerable<SettingViewModel> EventSettings { get; set; }
    }
}
