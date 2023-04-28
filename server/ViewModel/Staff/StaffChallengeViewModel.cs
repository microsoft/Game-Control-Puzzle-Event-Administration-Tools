using GameControl.Server.Database.Tables;
using System;
using System.Collections.Generic;

namespace GameControl.Server.ViewModel.Staff
{
    public class StaffChallengeViewModel : ChallengeViewModelBase
    {
        public StaffChallengeViewModel() { }

        public StaffChallengeViewModel(Challenge source) 
            : base(source)
        {
            this.LastUpdated = source.LastUpdated;
            this.PointsAwarded = source.PointsAwarded;
            this.Submissions = new List<StaffChallengeSubmissionViewModel>();
        }

        public long PointsAwarded { get; set; }

        public DateTime LastUpdated { get; set; }

        public IEnumerable<StaffChallengeSubmissionViewModel> Submissions { get; set; } 
    }
}
