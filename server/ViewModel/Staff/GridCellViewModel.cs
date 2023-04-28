using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.ViewModel.Staff
{
    public class GridCellViewModel
    {
        public Guid TeamId;
        public Guid ClueId;
        public Guid TableOfContentId;
        public DateTime? StartTime;
        public DateTime? SolveTime;
        public DateTime? PredictedStart;
        public DateTime? PredictedEnd;
        public bool IsSkipped;
        public bool HasNoAnswer;
        public IEnumerable<Guid> UnlockedClues;
    }
}
