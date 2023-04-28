using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;
using System.Linq;
using System;
using GameControl.Server.Controllers;
using GameControl.Server.Database;

namespace GameControl.Server.Hubs
{
    public class IntegrationHub : Hub
    {
        private readonly GameControlContext dbContext;

        public IntegrationHub(GameControlContext context)
        {
            this.dbContext = context;
        }

        public override async Task OnConnectedAsync()
        {
            var apiKey = Context.GetHttpContext().Request.Headers["apiKey"].ToString();
            var eventInstance = this.dbContext.getEventInstanceFromApiKey(apiKey);

            if (eventInstance == null)
            {
                Context.Abort();
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, eventInstance.Value.ToString());

            await base.OnConnectedAsync();
        }
    }
}