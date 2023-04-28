using Newtonsoft.Json;
using System;
using GameControl.Server.Hubs;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace GameControl.Server.Events
{
    /*
     * Game Event Handler for sending event updates to Azure DataGrid for external applications
     * that need game state updates.
     */
    public class IntegrationHubEventHandler : IEventHandler
    {

        private readonly IHubContext<IntegrationHub> integrationHub;
        private readonly string DATA_VERSION = "0.0.0";

        public IntegrationHubEventHandler(IHubContext<IntegrationHub> integrationHub)
        {
            this.integrationHub = integrationHub;
        }

        public async Task HandlePuzzleSolved(Guid eventInstance, Guid teamId, Guid solvedPuzzle)
        {
            try
            {
                var puzzleSolvedMessage = new
                {
                    id = Guid.NewGuid(),
                    subject = "Solves",
                    data = new
                    {
                        teamid = teamId,
                        puzzleid = solvedPuzzle
                    },
                    eventType = "GC.Solve",
                    eventTime = DateTime.UtcNow,
                    dataVersion = DATA_VERSION
                };

                await integrationHub.Clients.Group(eventInstance.ToString()).SendAsync("OnPuzzleSolved", puzzleSolvedMessage);
            }
            catch (Exception)
            {
                // Catch all exceptions to prevent this best-effort notification from interrupting
                // game flow if something goes wrong.
            }
        }

        public async Task HandleUnlockedPuzzlesChanged(Guid eventInstance, Guid teamId, IEnumerable<Guid> unlockedPuzzles, IEnumerable<Guid> relockedPuzzles)
        {
            try
            {
                List<object> messages = new List<object>();

                if (unlockedPuzzles != null) {
                    messages.AddRange(unlockedPuzzles.Select(p => new
                {
                    id = Guid.NewGuid(),
                    subject = "Unlocks",
                    data = new
                    {
                        teamid = teamId,
                        puzzleid = p
                    },
                    eventType = "GC.Unlock",
                    eventTime = DateTime.UtcNow,
                    dataVersion = DATA_VERSION
                }));
                }

                if (relockedPuzzles != null) {
                messages.AddRange(relockedPuzzles.Select(p => new
                {
                    id = Guid.NewGuid(),
                    subject = "Relocks",
                    data = new
                    {
                        teamid = teamId,
                        puzzleid = p
                    },
                    eventType = "GC.Relock",
                    eventTime = DateTime.UtcNow,
                    dataVersion = DATA_VERSION
                }));}

                await integrationHub.Clients.Group(eventInstance.ToString()).SendAsync("OnUnlockedPuzzlesChanged", messages);
            }
            catch (Exception)
            {
                // Catch all exceptions to prevent this best-effort notification from interrupting
                // game flow if something goes wrong.
            }
        }

        public async Task HandleChallengeCompleted(Guid eventInstance, Guid teamId, Guid challengeId)
        {
            try
            {
                var challengeApprovedMessage = new
                {
                    id = Guid.NewGuid(),
                    subject = "Challenges",
                    data = new
                    {
                        teamid = teamId,
                        challengeid = challengeId
                    },
                    eventType = "GC.ChallengeCompleted",
                    eventTime = DateTime.UtcNow,
                    dataVersion = DATA_VERSION
                };

                await integrationHub.Clients.Group(eventInstance.ToString()).SendAsync("OnChallengeCompleted", challengeApprovedMessage);
            }
            catch (Exception)
            {
                // Catch all exceptions to prevent this best-effort notification from interrupting
                // game flow if something goes wrong.
            }
        }
    }
}
