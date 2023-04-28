using System;
using System.ComponentModel.DataAnnotations;

namespace GameControl.Server.Database.Tables
{
    public class Content
    {
        [Key]
        public Guid ContentId { get; set; }

        public string ContentType { get; set; }

        public string ContentText { get; set; }

        public string Name { get; set; }

        public string ShortName { get; set; }

        public string FileName { get; set; }

        public byte[] RawData { get; set; }

        public DateTime LastUpdate { get; set; }

        public byte[] EncryptionKey { get; set; }
    }
}
