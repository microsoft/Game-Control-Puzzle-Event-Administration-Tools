using GameControl.Server.Database.SprocTypes;
using System;
using System.Collections.Generic;

namespace GameControl.Server.ViewModel.Player
{
    public class PlayerClueViewModel : ClueViewModelBase
    {
        public PlayerClueViewModel() { }

        public PlayerClueViewModel(TableOfContentsEntryForTeam toc, Guid eventInstanceId)
        {
            this.EventInstanceId = eventInstanceId;
            this.TableOfContentId = toc.TableOfContentId;
            this.SubmittableTitle = toc.SubmittableTitle;
            this.SubmittableType = toc.SubmittableType;
            this.UnlockTime = toc.UnlockTime;
            this.SubmissionTime = toc.SubmissionTime;
            this.SortOrder = toc.SortOrder;
            this.SubmittableId = toc.SubmittableId;
            this.IsSolved = toc.SubmissionTime.HasValue || toc.AnswerCount == 0;
        }

        public bool IsSolved { get; set; }

        public bool IsRated { get; set; }

        public DateTime UnlockTime { get; set; }

        public DateTime? SubmissionTime { get; set; }

        public IEnumerable<SubmissionViewModel> Submissions { get; set; }
    }
}
