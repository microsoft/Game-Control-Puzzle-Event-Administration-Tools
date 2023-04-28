using System;

namespace GameControl.Server.ViewModel
{
    public class GcMessageViewModelBase
    {
        public Guid MessageId { get; set; }

        public string MessageText { get; set; }

        public DateTime LastUpdated { get; set; }
    }
}
