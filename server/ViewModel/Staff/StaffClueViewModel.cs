using System;
using System.Collections.Generic;
using GameControl.Server.Database.SprocTypes;
using GameControl.Server.Database.Tables;

namespace GameControl.Server.ViewModel.Staff
{
    public class StaffClueViewModel : ClueViewModelBase
    {
        public StaffClueViewModel() { }

        public StaffClueViewModel(TableOfContentsEntry toc, Submittable sub) : base(toc, sub)
        {
            this.ShortTitle = sub.ShortTitle;
            this.ParSolveTime = toc.ParSolveTime;
            this.OpenTime = toc.OpenTime;
            this.ClosingTime = toc.ClosingTime;
            this.TeamsStatus = new List<SolveDataViewModel>();
            this.Answers = new List<AnswerViewModel>();
        }

        public StaffClueViewModel(TableOfContentsEntryForStaff tocForStaff, Guid eventInstanceId)
        {
            TableOfContentId = tocForStaff.TableOfContentId;
            EventInstanceId = eventInstanceId; 
            SubmittableTitle = tocForStaff.Title;
            ShortTitle = tocForStaff.ShortTitle;
            SubmittableType = tocForStaff.SubmittableType;
            SortOrder = tocForStaff.SortOrder;
            SubmittableId = tocForStaff.SubmittableId;
            Content = new List<ContentViewModel>();
            TeamsStatus = new List<SolveDataViewModel>();
            ParSolveTime = tocForStaff.ParSolveTime;
            OpenTime = tocForStaff.OpenTime;
            ClosingTime = tocForStaff.ClosingTime;
        }

        public string ShortTitle { get; set; }

        public int? ParSolveTime { get; set; }

        public DateTime? OpenTime { get; set; }

        public DateTime? ClosingTime { get; set; }

        public int? AverageSolveTime { get; set; }

        public IEnumerable<AnswerViewModel> Answers { get; set; }

        public IEnumerable<PuzzleRatingViewModel> Ratings { get; set; }

        public IEnumerable<SolveDataViewModel> TeamsStatus {get; set; }

        public IEnumerable<PuzzleInstanceViewModel> Instances { get; set; }
    }
}
