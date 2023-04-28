using GameControl.Server.Database.Tables;
using System;

namespace GameControl.Server.ViewModel
{
    public class AchievementViewModel
    {
        public AchievementViewModel() { }

        public AchievementViewModel(Achievement model)
        {
            this.AchievementId = model.AchievementId;
            this.Name = model.Name;
            this.Description = model.Description;

            // NOTE: This date varies based on how this is being queried; when querying
            // team achievements this is the unlock date. When querying staff achievements it's
            // the created/last updated date.
            this.LastUpdated = model.CreatedOn;
        }

        public Guid AchievementId { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public DateTime LastUpdated { get; set; }
    }
}
