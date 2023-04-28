using System;

namespace GameControl.Server.ViewModel
{
    public class TeamSortOverrideViewModel
    {
        public static readonly string AdditionalDataKey = "SortOverride";

        public Guid TableOfContentId { get; set; }

        public int SortOrder { get; set; }
    }
}
