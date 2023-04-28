using GameControl.Server.Database.Tables;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.ViewModel.Player
{
    public class PlayerCallViewModel
    {
        public PlayerCallViewModel(Call dbRow)
        {
            this.CallId = dbRow.CallId;
            this.EndTime = dbRow.CallEnd;
            this.StartTime = dbRow.CallStart;
            this.PublicNotes = dbRow.PublicNotes;
            this.TeamNotes = dbRow.TeamNotes;
            this.LastUpdated = dbRow.LastUpdated;
            this.CallType = dbRow.CallType.Trim();
        }

        public Guid CallId { get; set; }

        public DateTime StartTime { get; set; }

        public DateTime? EndTime { get; set; }

        public string TeamNotes { get; set; }

        public string PublicNotes { get; set; }

        public string CallType { get; set; }

        public DateTime LastUpdated { get; set; }
    }
}
