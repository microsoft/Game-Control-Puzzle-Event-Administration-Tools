using System;

namespace GameControl.Server.RequestTypes.Staff
{
    public class ChallengeSubmissionApproval
    {
        public Guid ChallengeSubmissionId { get; set; }

        public string ApproverText { get; set; }

        public int State { get; set; }
    }
}
