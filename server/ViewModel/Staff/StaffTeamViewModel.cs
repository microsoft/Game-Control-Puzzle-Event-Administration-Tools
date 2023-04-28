using GameControl.Server.Database.Tables;
using GameControl.Server.ViewModel.Staff;
using System;
using System.Collections.Generic;

namespace GameControl.Server.ViewModel
{
    public class StaffTeamViewModel
    {
        public StaffTeamViewModel() { }

        public StaffTeamViewModel(Team team)
        {
            this.TeamId = team.TeamId;
            this.Name = team.Name;
            this.ShortName = team.ShortName;
            this.Color = team.Color;
            this.IsTestTeam = team.IsTestTeam;
            this.Passphrase = team.Passphrase;
            this.GcNotes = team.GcNotes;
            this.Points = team.Points ?? 0;
            this.CallHistory = new List<CallViewModel>();
            this.Roster = new List<UserViewModel>();
            this.SubmissionHistory = new List<SubmissionViewModel>();
        }

        public Guid TeamId { get; set; }

        public string Name { get; set; }

        public string ShortName { get; set; }

        public int Color { get; set; }

        public bool IsTestTeam { get; set; }

        public long Points { get; set; }

        public CallViewModel ActiveCall { get; set; }

        public string Passphrase { get; set; }

        public string GcNotes { get; set; }

        public IEnumerable<CallViewModel> CallHistory { get; set; }

        public IEnumerable<UserViewModel> Roster { get; set; }

        public IEnumerable<SubmissionViewModel> SubmissionHistory { get; set; }

        public TeamAdditionalDataViewModel AdditionalData { get; set; }
    }
}
