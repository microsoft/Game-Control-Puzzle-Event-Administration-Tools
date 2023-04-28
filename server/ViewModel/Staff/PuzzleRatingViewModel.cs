using System;
using GameControl.Server.Database.SprocTypes;

namespace GameControl.Server.ViewModel.Staff
{
    public class PuzzleRatingViewModel
    {
        public PuzzleRatingViewModel(RatingForTableOfContentsEntry dbRow)
        {
            this.ParticipationId = dbRow.Participation;
            this.TableOfContentId = dbRow.TableOfContentsEntry;
            this.Rating = dbRow.Rating;
            this.Comments = dbRow.Comments;
            this.LastUpdated = dbRow.LastUpdated;
            this.RatedByUser = dbRow.FirstName + " " + dbRow.LastName;
            this.RatedByTeam = dbRow.Name;
        }

        public Guid ParticipationId { get; set; }

        public Guid TableOfContentId { get; set; }

        public int Rating { get; set; }

        public string Comments { get; set; }

        public DateTime LastUpdated { get; set; }

        public string RatedByUser { get; set; }

        public string RatedByTeam { get; set; }
    }
}
