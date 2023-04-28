using GameControl.Server.Database.SprocTypes;
using GameControl.Server.Database.Tables;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.ViewModel.Staff
{
    public enum CallType
    {
        None,
        Hint,
        Confirm,
        Other,
        TeamFree,
        TeamHelp,
        Checkin
    }

    public enum CallSubType
    {
        None,
        HintSmall,
        HintBig,
        HintFree,
        HintSpecial
    }

    public class CallViewModel
    {
        public CallViewModel(Call dbRow)
        {
            this.CallId = dbRow.CallId;
            this.CallType = dbRow.CallType != null ? dbRow.CallType.Trim() : "";
            this.CallSubType = dbRow.CallSubType != null ? dbRow.CallSubType.Trim() : "";
            this.CallStart = dbRow.CallStart;
            this.CallEnd = dbRow.CallEnd;
            this.Notes = dbRow.Notes;
            this.TeamNotes = dbRow.TeamNotes;
            this.PublicNotes = dbRow.PublicNotes;
            this.LastUpdated = dbRow.LastUpdated;
        }

        public CallViewModel(CallData dbRow)
        {
            this.CallId = dbRow.CallId;
            this.CallType = dbRow.CallType != null ? dbRow.CallType.Trim() : "";
            this.CallSubType = dbRow.CallSubType != null ? dbRow.CallSubType.Trim() : "";
            this.CallStart = dbRow.CallStart;
            this.CallEnd = dbRow.CallEnd;
            this.Notes = dbRow.Notes;
            this.TeamNotes = dbRow.TeamNotes;
            this.PublicNotes = dbRow.PublicNotes;
            this.LastUpdated = dbRow.LastUpdated;
        }

        public Guid CallId { get; set; }

        public Guid? SelectedPuzzleId { get; set; }

        // Include team info?

        // Include caller info?

        public DateTime CallStart { get; set; }

        public DateTime? CallEnd { get; set; }

        public string CallType { get; set; }

        public string CallSubType { get; set; }

        public string Notes { get; set; }

        public string TeamNotes { get; set; }

        public string PublicNotes { get; set; }

        public DateTime LastUpdated { get; set; }
    }
}
