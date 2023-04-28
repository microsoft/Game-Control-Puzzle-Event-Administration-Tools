using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace GameControl.Server.Events
{
    public class NoopEventHandler : IEventHandler
    {
        public Task HandleChallengeCompleted(Guid eventInstance, Guid teamId, Guid challengeId)
        {
            return null;
        }

        public Task HandlePuzzleSolved(Guid eventInstance, Guid teamId, Guid solvedPuzzle)
        {
            return null;
        }

        public Task HandleUnlockedPuzzlesChanged(Guid eventInstance, Guid teamId, IEnumerable<Guid> unlockedPuzzles, IEnumerable<Guid> relockedPuzzles)
        {
            return null;
        }
    }
}
