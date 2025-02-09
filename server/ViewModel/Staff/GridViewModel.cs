using System;
using System.Collections.Generic;

namespace GameControl.Server.ViewModel.Staff
{
    public class GridViewModel
    {
        public IEnumerable<StaffTeamGridViewModel> Teams { get; set; }

        public IEnumerable<StaffClueViewModel> Clues { get; set; }

        public List<Guid> CompletedClues { get; set; }

        public string GridNotes { get; set; }

        public Dictionary<Guid /*Teamid*/, Dictionary<Guid /*ClueId*/, GridCellViewModel>> TheGrid;
        
        public DateTime? LatestEndTime;
    }
}
