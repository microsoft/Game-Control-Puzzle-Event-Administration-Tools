using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace GameControl.Server.Events
{
    /**
     * Interface for puzzle event listeners. These are modules that will listen for specific puzzle events
     * that external services may want to have pushed to them.
     */
    public interface IEventHandler
    {
        Task HandlePuzzleSolved(Guid eventInstance, Guid teamId, Guid solvedPuzzle);

        Task HandleUnlockedPuzzlesChanged(Guid eventInstance, Guid teamId, IEnumerable<Guid> unlockedPuzzles, IEnumerable<Guid> relockedPuzzles);

        Task HandleChallengeCompleted(Guid eventInstance, Guid teamId, Guid challengeId);
    }
}
