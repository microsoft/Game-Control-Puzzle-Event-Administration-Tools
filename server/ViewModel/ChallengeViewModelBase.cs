using GameControl.Server.Database.Tables;
using System;

namespace GameControl.Server.ViewModel
{
    public class ChallengeViewModelBase
    {
        public ChallengeViewModelBase()
        {
        }

        public ChallengeViewModelBase(Challenge source)
        {
            this.ChallengeId = source.ChallengeId;
            this.Title = source.Title;
            this.Description = source.Description;
            this.StartTime = source.StartTime;
            this.EndTime = source.EndTime;
        }

        public Guid ChallengeId { get; set; }

        public virtual string Title { get; set; }

        public string Description { get; set; }

        public DateTime? StartTime { get; set; }

        public DateTime? EndTime { get; set; }
    }
}
