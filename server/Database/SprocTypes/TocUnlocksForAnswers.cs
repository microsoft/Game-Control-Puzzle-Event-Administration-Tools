using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.Database.SprocTypes
{
    public class TocUnlocksForAnswers
    {
        [Key]
        public Guid AnswerId { get; set; }

        public string AnswerResponse { get; set; }

        public string AnswerText { get; set; }

        public bool IsCorrectAnswer { get; set; }

        public Guid? AppliesToTeam { get; set; }

        public Guid? AdditionalContent { get; set; }

        public Guid SourceSubmittable { get; set; }

        public Guid? TableOfContentId { get; set; }

        public string Title { get; set; }

        public string ShortTitle { get; set; }

        public string SubmittableType { get; set; }

        public DateTime? LastUpdate { get; set; }

        public Guid? SubmittableId { get; set; }

        public int? SortOrder { get; set; }            
    }
}
