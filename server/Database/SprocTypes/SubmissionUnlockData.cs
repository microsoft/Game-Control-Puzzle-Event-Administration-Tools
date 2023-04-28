using System;
using System.ComponentModel.DataAnnotations;

namespace GameControl.Server.Database.SprocTypes
{
    public class SubmissionUnlockData
    {
        [Key]
        public Guid TableOfContentId { get; set; }

        public string Title { get; set; }
    }
}
