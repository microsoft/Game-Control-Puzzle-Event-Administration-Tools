using System;

namespace GameControl.Server.RequestTypes.Staff
{
    public class PuzzleInstanceTemplate
    {
        public Guid? Id { get; set; }

        public Guid? CurrentTeam { get; set; }

        public string FriendlyName { get; set; }

        public string Notes { get; set; }

        public bool? NeedsReset { get; set; }
    }
}
