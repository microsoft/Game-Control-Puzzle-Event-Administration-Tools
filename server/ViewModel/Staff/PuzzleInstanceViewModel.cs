using GameControl.Server.Database.Tables;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.ViewModel.Staff
{
    public class PuzzleInstanceViewModel
    {
        public PuzzleInstanceViewModel() { }

        public PuzzleInstanceViewModel(ToCInstance dbRow)
        {
            this.Id = dbRow.ToCInstanceId;
            this.TableOfContentId = dbRow.TableOfContentsEntry;
            this.CurrentTeam = dbRow.CurrentTeam;
            this.FriendlyName = dbRow.FriendlyName;
            this.Notes = dbRow.Notes;
            this.NeedsReset = dbRow.NeedsReset;
            this.LastUpdated = dbRow.LastUpdated;
        }

        public Guid Id { get; set; }

        public Guid TableOfContentId { get; set; }

        public Guid? CurrentTeam { get; set; }

        public string FriendlyName { get; set; }

        public string Notes { get; set; }

        public bool NeedsReset { get; set; }

        public DateTime LastUpdated { get; set; }
    }
}
