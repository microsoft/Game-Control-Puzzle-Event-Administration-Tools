using GameControl.Server.Database.Tables;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.ViewModel.Player
{
    public class PlayerChallengeViewModel : ChallengeViewModelBase
    {
        private const string Delimiter = "^^^";
        public PlayerChallengeViewModel() { }

        public PlayerChallengeViewModel(Challenge source)
            : base(source)
        {
            this.Submissions = new List<PlayerChallengeSubmissionViewModel>();
        }

        public IEnumerable<PlayerChallengeSubmissionViewModel> Submissions { get; set; }

        public override string Title
        {
            get
            {
                if (base.Title.Contains("^^^"))
                {
                    var tokens = base.Title.Split(
                        new[] { Delimiter },
                        StringSplitOptions.RemoveEmptyEntries
                    );
                    if (tokens.Length == 2) {
                    return tokens[0];
                    }
                }

                return base.Title;
            }
            set
            {
                base.Title = value;
            }
        }

        public Guid? DependentClue
        {
            get
            {
                if (base.Title.Contains("^^^"))
                {
                    var tokens = base.Title.Split(
                        new[] { Delimiter },
                        StringSplitOptions.RemoveEmptyEntries
                    );
                    if (tokens.Length == 2) {
                        Guid result;
                        if (Guid.TryParse(tokens[1], out result))
                        {
                            return result;
                        }
                    }
                }

                return null;
            }
        }


    }
}
