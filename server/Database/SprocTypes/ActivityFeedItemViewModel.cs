using System;
using System.ComponentModel.DataAnnotations;

namespace GameControl.Server.Database.SprocTypes
{
    public class ActivityFeedItemViewModel
    {
        [Key]
        public Guid Id { get; set; }

        public string TeamName { get; set; }

        public Guid? TeamId { get; set; }

        public int TeamColor { get; set; }

        public string AggregatedContentType { get; set; }

        public DateTime LastUpdated { get; set; }

        public long? NumericValue { get; set; }

        public string Description { get; set; }

        public Guid EventInstance { get; set; }

        public long? RowNum { get; set; }

        public int HasAdditionalImage { get; set; }
    }
}
