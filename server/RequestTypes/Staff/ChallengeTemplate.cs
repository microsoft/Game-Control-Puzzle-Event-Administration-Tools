using System;

namespace GameControl.Server.RequestTypes.Staff
{
    public class ChallengeTemplate
    {
        public Guid? ChallengeId { get; set; }

        public string Title { get; set; }

        public string Description { get; set; }

        public long? PointsAwarded { get; set; }

        public DateTime? StartTime { get; set; }

        public DateTime? EndTime { get; set; }
    }
}
