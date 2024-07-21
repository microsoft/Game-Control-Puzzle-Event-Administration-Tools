using GameControl.Server.Database.SprocTypes;
using GameControl.Server.Database.Tables;
using GameControl.Server.Util;
using Microsoft.EntityFrameworkCore.Query.Internal;
using System;

namespace GameControl.Server.ViewModel
{
    public class ContentViewModel
    {
        // Special-cased content names for handling plot in the UX.
        public static readonly string UnsolvedPlot = "UnsolvedPlot";
        public static readonly string SolvedPlot   = "SolvedPlot";
        public static readonly string SkipPlot     = "SkipPlot";

        public ContentViewModel(Content source)
        {
            this.ContentId = source.ContentId;
            this.ContentType = source.ContentType.Trim();
            this.Name = source.Name;
            this.LastUpdated = source.LastUpdate;
            this.AchievementUnlockId = source.AchievementUnlockId;

            if (source.ContentType.Trim().Equals("PlainText", StringComparison.InvariantCultureIgnoreCase) ||
                source.ContentType.Trim().Equals("RichText", StringComparison.InvariantCultureIgnoreCase) ||
                source.ContentType.Trim().Equals("YoutubeUrl", StringComparison.InvariantCultureIgnoreCase) ||
                source.ContentType.Trim().Equals("Hyperlink", StringComparison.InvariantCultureIgnoreCase))
            {
                if (source.EncryptionKey != null)
                {
                    this.StringContent = GameControlUtil.DecryptContent(source.ContentId, source.EncryptionKey, source.RawData);
                }
                else
                {
                    this.StringContent = source.ContentText;
                }
            }
            else if (source.ContentType.Trim().Equals("Image", StringComparison.InvariantCultureIgnoreCase))
            {
                this.StringContent = source.ContentText;
            }
            else
            {
                this.StringContent = string.Empty;
            }
        }

        public ContentViewModel(AdditionalContentForPuzzle source)
        {
            if (source.ContentId.HasValue)
            {
                this.ContentId = source.ContentId.Value;
                this.ContentType = source.ContentType.Trim();
                this.Name = source.ContentName;
                this.LastUpdated = source.ContentLastUpdated.Value;
                this.AchievementUnlockId = source.AchievementUnlockId;

                if (source.ContentType.Trim().Equals("PlainText", StringComparison.InvariantCultureIgnoreCase) ||
                    source.ContentType.Trim().Equals("RichText", StringComparison.InvariantCultureIgnoreCase) ||
                    source.ContentType.Trim().Equals("YoutubeUrl", StringComparison.InvariantCultureIgnoreCase) ||
                    source.ContentType.Trim().Equals("Hyperlink", StringComparison.InvariantCultureIgnoreCase))
                {
                    if (source.EncryptionKey != null)
                    {
                        this.StringContent = GameControlUtil.DecryptContent(source.ContentId.Value, source.EncryptionKey, source.RawData);
                    }
                    else
                    {
                        this.StringContent = source.ContentText;
                    }
                }
                else if (source.ContentType.Trim().Equals("Image", StringComparison.InvariantCultureIgnoreCase))
                {
                    this.StringContent = source.ContentText;
                }
                else
                {
                    this.StringContent = string.Empty;
                }
            }
            else if (source.LocationId.HasValue)
            {
                this.ContentId = source.LocationId.Value;
                this.ContentType = "Location";
                this.Address = source.LocationAddress;
                this.Name = source.LocationName;
                this.Latitude = source.LocationLatitude;
                this.Longitude = source.LocationLongitude;
                this.LocationFlags = source.LocationFlag ?? 0;
                this.LastUpdated = source.LocationLastUpdated.Value;
            }
        }

        public ContentViewModel(AdditionalContentForTeam source)
        {
            if (source.ContentId.HasValue)
            {
                this.ContentId = source.ContentId.Value;
                this.ContentType = source.ContentType.Trim();
                this.Name = source.ContentName;
                this.LastUpdated = source.ContentLastUpdated.Value;
                this.AchievementUnlockId = source.AchievementUnlockId;

                if (source.ContentType.Trim().Equals("PlainText", StringComparison.InvariantCultureIgnoreCase) ||
                    source.ContentType.Trim().Equals("RichText", StringComparison.InvariantCultureIgnoreCase) ||
                    source.ContentType.Trim().Equals("YoutubeUrl", StringComparison.InvariantCultureIgnoreCase) ||
                    source.ContentType.Trim().Equals("Hyperlink", StringComparison.InvariantCultureIgnoreCase))
                {
                    if (source.EncryptionKey != null)
                    {
                        this.StringContent = GameControlUtil.DecryptContent(source.ContentId.Value, source.EncryptionKey, source.RawData);
                    }
                    else
                    {
                        this.StringContent = source.ContentText;
                    }
                }
                else if (source.ContentType.Trim().Equals("Image", StringComparison.InvariantCultureIgnoreCase))
                {
                    this.StringContent = source.ContentText;
                }
                else
                {
                    this.StringContent = string.Empty;
                }
            }
            else if (source.LocationId.HasValue)
            {
                this.ContentId = source.LocationId.Value;
                this.ContentType = "Location";
                this.Address = source.LocationAddress;
                this.Name = source.LocationName;
                this.Latitude = source.LocationLatitude;
                this.Longitude = source.LocationLongitude;
                this.LocationFlags = source.LocationFlag ?? 0;
                this.LastUpdated = source.LocationLastUpdated.Value;
            }
        }

        public Guid ContentId { get; set; }

        public string ContentType { get; set; }

        public string Name { get; set; }

        public string StringContent { get; set; }

        // Used for locations, consider extending the base type to clean this sort of stuff up?
        public string Address { get; set; }

        public decimal? Latitude { get; set; }

        public decimal? Longitude { get; set; }

        public int LocationFlags { get; set; }

        public DateTime LastUpdated { get; set; }

        public Guid? AchievementUnlockId { get; set; }
    }
}
