using Microsoft.AspNetCore.Http;
using System;

namespace GameControl.Server.RequestTypes
{
    public class NewTextContentTemplate
    {
        public Guid? ContentId { get; set; }

        public string ContentType { get; set; }

        public string ContentName { get; set; }

        public string StringContent { get; set; }

        public IFormFile BinaryContent { get; set; }

        public Guid? AchievementUnlockId { get; set; }
    }
}
