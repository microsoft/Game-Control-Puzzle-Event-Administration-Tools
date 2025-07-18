using System;
using System.Collections.Generic;
using GameControl.Server.Database.Tables;

namespace GameControl.Server.ViewModel
{
    public abstract class ClueViewModelBase
    {
        private string submittableType;

        public ClueViewModelBase() { }

        public ClueViewModelBase(TableOfContentsEntry toc, Submittable sub)
        {
            this.TableOfContentId = toc.TableOfContentId;
            this.EventInstanceId = toc.EventInstance;
            this.SubmittableId = toc.Submittable;
            this.SubmittableTitle = sub.Title;
            this.SortOrder = toc.SortOrder;
            this.TakeOver = toc.TakeOver;
            this.SubmittableType = sub.SubmittableType;
            this.Content = new List<ContentViewModel>();
        }

        public Guid TableOfContentId { get; set; }

        public Guid EventInstanceId { get; set; }

        public Guid SubmittableId { get; set; }

        public string SubmittableTitle { get; set; }

        public int SortOrder { get; set; }

        public bool TakeOver { get; set; }

        public string SubmittableType
        {
            get { return this.submittableType; }
            set
            {
                // Ensure the submittable type is trimmed and has the expected casing - SQL ignores
                // case and the client was incorrectly submitting some types with lower-case starting
                // letters.
                if (value.Trim().Equals("Puzzle", StringComparison.OrdinalIgnoreCase))
                {
                    this.submittableType = "Puzzle";
                }
                else if (value.Trim().Equals("LocUnlock", StringComparison.OrdinalIgnoreCase))
                {
                    this.submittableType = "LocUnlock";
                }
                else if (value.Trim().Equals("Plot", StringComparison.OrdinalIgnoreCase))
                {
                    this.submittableType = "Plot";
                }
                else if (value.Trim().Equals("Tool", StringComparison.OrdinalIgnoreCase))
                {
                    this.submittableType = "Tool";
                }
                else
                {
                    this.submittableType = value.Trim();
                }
            }
        }

        public IEnumerable<ContentViewModel> Content { get; set; }
    }
}
