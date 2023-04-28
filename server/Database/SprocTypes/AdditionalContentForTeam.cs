using System;
using System.ComponentModel.DataAnnotations;

namespace GameControl.Server.Database.SprocTypes
{
    public class AdditionalContentForTeam
    {
        [Key]
        public Guid AssociationId { get; set; }

        public Guid? ContentId { get; set; }

        public string ContentType { get; set; }

        public string ContentName { get; set; }

        public string ContentText { get; set; }

        public string ShortName { get; set; }

        public string FileName { get; set; }

        public byte[] RawData { get; set; }

        public DateTime? ContentLastUpdated { get; set; }

        public byte[] EncryptionKey { get; set; }

        public Guid? LocationId { get; set; }

        public string LocationName { get; set; }

        public DateTime? LocationLastUpdated { get; set; }

        public string LocationAddress { get; set; }

        public decimal? LocationLatitude { get; set; }

        public decimal? LocationLongitude { get; set; }

        public int? LocationFlag { get; set; }

        public Guid TableOfContentId { get; set; }

        public Guid Submittable { get; set; }

        public int SortOrder { get; set; }

        public string UnlockReason { get; set; }

        public DateTime UnlockTime { get; set; }
    }
}
