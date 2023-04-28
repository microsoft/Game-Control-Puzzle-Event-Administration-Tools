using System;
using System.ComponentModel.DataAnnotations;

namespace GameControl.Server.Database.Tables
{
    public class ToCContent
    {
        [Key]
        public Guid Id { get; set; }

        public Guid TableOfContentsEntry { get; set; }

        public DateTime LastUpdated { get; set; }

        public Guid? Location { get; set; }

        public Guid? AdditionalContent { get; set; }
    }
}
