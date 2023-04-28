using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.ViewModel.Staff
{
    // TODO: There is probably some merging here that should be doable with GridCellViewModel.
    public class SolveDataViewModel
    {
        public Guid TeamId { get; set; }

        // TODO: Should this not be included here and instead handled by the UI?
        public string TeamName { get; set; }

        public DateTime? StartTime { get; set; }

        public DateTime? SolveTime { get; set; }

        public bool IsSkipped { get; set; }
    }
}
