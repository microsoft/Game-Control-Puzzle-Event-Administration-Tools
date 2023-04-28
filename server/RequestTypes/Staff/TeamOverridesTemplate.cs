using GameControl.Server.ViewModel;
using System.Collections.Generic;

namespace GameControl.Server.RequestTypes.Staff
{
    public class TeamOverridesTemplate
    {
        public IEnumerable<TeamSortOverrideViewModel> SortOverride { get; set; }
    }
}
