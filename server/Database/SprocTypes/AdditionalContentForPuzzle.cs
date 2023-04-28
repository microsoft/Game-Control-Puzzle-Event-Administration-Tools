using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.Database.SprocTypes
{
    public class AdditionalContentForPuzzle
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

        [Column(TypeName = "decimal(16,13)")]
        public decimal? LocationLatitude { get; set; }

        [Column(TypeName = "decimal(16,13)")]
        public decimal? LocationLongitude { get; set; }

        public int? LocationFlag { get; set; }
    }
}
