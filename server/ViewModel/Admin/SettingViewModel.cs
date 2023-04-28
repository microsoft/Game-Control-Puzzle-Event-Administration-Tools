using GameControl.Server.Database.Tables;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.ViewModel.Admin
{
    public class SettingViewModel
    {
        public SettingViewModel() { }

        public SettingViewModel(Settings sourceSetting)
        {
            this.SettingId = sourceSetting.SettingId;
            this.EventInstanceId = sourceSetting.EventInstanceId;
            this.Name = sourceSetting.Name;
            this.SettingType = sourceSetting.SettingType;
            this.StringValue = sourceSetting.StringValue;
            this.HasBinaryValue = sourceSetting.BinaryValue != null;
            this.LastUpdated = sourceSetting.LastUpdated;
        }

        public int SettingId { get; set; }

        public Guid EventInstanceId { get; set; }

        public string Name { get; set; }

        public string SettingType { get; set; }

        public string StringValue { get; set; }

        public bool HasBinaryValue { get; set; }

        public DateTime LastUpdated { get; set; }
    }
}
