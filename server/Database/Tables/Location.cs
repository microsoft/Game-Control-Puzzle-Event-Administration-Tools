﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.Database.Tables
{
    public enum LocationFlags
    {
        HasBathroom = 0x1,
        FoodNearby = 0x2,
    }

    public class Location
    {
        [Key]
        public Guid LocationId { get; set; }

        public string Name { get; set; }

        public DateTime LastUpdate { get; set; }

        public string Address { get; set; }

        [Column(TypeName = "decimal(16, 13)")]
        public decimal Latitude { get; set; }

        [Column(TypeName = "decimal(16, 13)")]
        public decimal Longitude { get; set; }

        public int LocationFlag { get; set; }
    }
}
