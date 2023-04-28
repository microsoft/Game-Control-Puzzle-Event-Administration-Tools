using System;
using System.ComponentModel.DataAnnotations;

namespace GameControl.Server.Database.Tables
{
    public class Submittable
    {
        [Key]
        public Guid SubmittableId { get; set; }

        public string SubmittableType { get; set; }

        public string Title { get; set; }

        public string ShortTitle { get; set; }

        public DateTime LastUpdate { get; set; }

        public string WikiPage { get; set; }
    }
}
