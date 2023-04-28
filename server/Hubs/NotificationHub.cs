using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;
using System.Linq;
using System;
using GameControl.Server.Controllers;
using GameControl.Server.Database;

namespace GameControl.Server.Hubs
{
    [Authorize(AuthenticationSchemes = "Bearer")]
    public class NotificationHub : Hub
    {

        private readonly GameControlContext dbContext;

        public NotificationHub(GameControlContext context)
        {
            this.dbContext = context;
        }

        public override async Task OnConnectedAsync()
        {
            try
            {
                var participantId = Context.User.Claims.Where(c => c.Type == "ParticipantId").First().Value.ToString();
                var participantGuid = Guid.Parse(participantId);

                var participant = this.dbContext.Participant.FirstOrDefault(p => p.ParticipantId == participantGuid);
                var participations = this.dbContext.Participation.Where(p => p.Participant == participant.ParticipantId).ToList();

                foreach (var participation in participations)
                {
                    if (participation.Team != null)
                    {
                        await Groups.AddToGroupAsync(Context.ConnectionId, participation.Team.ToString());
                    }
                    if (participation.IsStaff || participation.IsAdmin)
                    {
                        await Groups.AddToGroupAsync(Context.ConnectionId, "ADMIN_" + participation.EventInstance.ToString());
                    }
                }
            }
            catch (Exception)
            {
                Context.Abort();
            }

            await base.OnConnectedAsync();
        }

        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }
    }
}