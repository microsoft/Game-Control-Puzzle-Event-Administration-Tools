﻿using LazyCache;
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GameControl.Server.Database;
using GameControl.Server.Util;

namespace GameControl.Server.Controllers
{
    [AllowAnonymous]
    [Route("api/[controller]")]
    public class ContentController : Controller
    {
        private readonly GameControlContext dbContext;
        private readonly IAppCache cache;

        public ContentController(GameControlContext dbContext, IAppCache cache)
        {
            this.dbContext = dbContext;
            this.cache = cache;
        }

        [HttpGet("[action]/{contentId}")]
        public ActionResult Pic(Guid contentId)
        {
            var content = this.dbContext.AdditionalContent.FirstOrDefault(p => p.ContentId == contentId);

            if (content != null)
            {
                CryptoStream cs = new CryptoStream(
                    new MemoryStream(content.RawData),
                    Aes.Create().CreateDecryptor(content.EncryptionKey, content.ContentId.ToByteArray()),
                    CryptoStreamMode.Read);

                MemoryStream ms = new MemoryStream();
                cs.CopyTo(ms);

                return GetImageFromStream(contentId, ms);
            }
            else
            {
                return NotFound();
            }
        }

        [HttpGet("pulsePic/{pulseId}")]
        public ActionResult PulsePic(Guid pulseId)
        {
            var pulse = this.dbContext.Pulse.FirstOrDefault(p => p.PulseId == pulseId);

            if (pulse != null)
            {
                using (MemoryStream ms = new MemoryStream(pulse.TeamPic))
                {
                    return GetImageFromStream(pulseId, ms);
                }
            }
            else
            {
                return NotFound();
            }
        }

        [HttpGet("challengePicFull/{challengeSubmissionId}")]
        public ActionResult ChallengePicFull(Guid challengeSubmissionId)
        {
            var cachedChallengePic = cache.GetOrAdd("Challenge_" + challengeSubmissionId, cacheEntry =>
                {
                    cacheEntry.AbsoluteExpiration = DateTimeOffset.Now.AddHours(12);

                    var challengeSubmission = this.dbContext.ChallengeSubmission.FirstOrDefault(p => p.ChallengeSubmissionId == challengeSubmissionId);

                    if (challengeSubmission != null)
                    {
                        if (challengeSubmission.SubmissionBinaryContent != null)
                        {
                            using (MemoryStream ms = new MemoryStream(challengeSubmission.SubmissionBinaryContent))
                            {
                                var largePic = GetImageFromStream(challengeSubmissionId, ms);
                                Image image = Image.FromStream(ms);
                                return ms.ToArray();
                            }
                        }
                    }
                    return null;
                });

            if (cachedChallengePic == null)
            {
                return NotFound();
            }
            else
            {
                return File(cachedChallengePic, "image/jpg", challengeSubmissionId.ToString() + "_t.jpg");
            }
        }

        [HttpGet("challengePic/{challengeSubmissionId}")]
        public ActionResult ChallengePicThumb(Guid challengeSubmissionId)
        {
            var cachedChallengePic = cache.GetOrAdd("ChallengeThumb_" + challengeSubmissionId, cacheEntry =>
                {
                    cacheEntry.AbsoluteExpiration = DateTimeOffset.Now.AddHours(12);

                    var challengeSubmission = this.dbContext.ChallengeSubmission.FirstOrDefault(p => p.ChallengeSubmissionId == challengeSubmissionId);

                    if (challengeSubmission != null)
                    {
                        if (challengeSubmission.SubmissionBinaryContent != null)
                        {
                            using (MemoryStream ms = new MemoryStream(challengeSubmission.SubmissionBinaryContent))
                            {
                                var largePic = GetImageFromStream(challengeSubmissionId, ms);
                                Image image = Image.FromStream(ms);
                                var thumb = ScaleImage(image, 256, 256);
                                ms.Close();

                                using (MemoryStream ms2 = new MemoryStream())
                                {
                                    thumb.Save(ms2, ImageFormat.Jpeg);
                                    ms2.Seek(0, SeekOrigin.Begin);

                                    return ms2.ToArray();
                                }
                            }
                        }
                    }
                    return null;
                });

            if (cachedChallengePic == null)
            {
                return NotFound();
            }
            else
            {
                return File(cachedChallengePic, "image/jpg", challengeSubmissionId.ToString() + "_t.jpg");
            }
        }

        [HttpGet("pulseThumb/{pulseId}")]
        public ActionResult PulsePicThumb(Guid pulseId)
        {
            var pulse = this.dbContext.Pulse.FirstOrDefault(p => p.PulseId == pulseId);

            if (pulse != null)
            {
                using (MemoryStream ms = new MemoryStream(pulse.TeamPic))
                {
                    var largePic = GetImageFromStream(pulseId, ms);
                    Image image = Image.FromStream(ms);
                    var thumb = ScaleImage(image, 256, 256);
                    ms.Close();

                    using (MemoryStream ms2 = new MemoryStream())
                    {
                        thumb.Save(ms2, ImageFormat.Jpeg);
                        ms2.Seek(0, SeekOrigin.Begin);

                        return File(ms2.ToArray(), "image/jpg", pulseId.ToString() + "_t.jpg");
                    }
                }
            }
            else
            {
                return NotFound();
            }

        }

        [HttpGet("[action]")]
        public ActionResult Achievement(Guid achievementId)
        {
            var achievement = this.dbContext.Achievement.FirstOrDefault(p => p.AchievementId == achievementId);

            if (achievement != null)
            {
                MemoryStream ms = new MemoryStream(achievement.Icon);
                return GetImageFromStream(achievementId, ms);
            }
            else
            {
                return NotFound();
            }
        }

        private ActionResult GetImageFromStream(Guid itemId, MemoryStream ms)
        {
            Image image = Image.FromStream(ms);
            ms.Seek(0, SeekOrigin.Begin);

            var codec = GameControlUtil.GetCodec(image);

            if (codec == null)
            {
                // unsupported media type
                return StatusCode((int)HttpStatusCode.UnsupportedMediaType);
            }
            else
            {
                return File(ms.ToArray(), codec.MimeType, itemId.ToString() + GameControlUtil.GetExtension(codec));
            }
        }

        private static Image ScaleImage(Image source, int maxWidth, int maxHeight)
        {
            var ratioX = (double)maxWidth / source.Width;
            var ratioY = (double)maxHeight / source.Height;
            var ratio = Math.Min(ratioX, ratioY);
            var newImage = new Bitmap((int)(source.Width * ratio), (int)(source.Height * ratio));
            Graphics.FromImage(newImage).DrawImage(source, 0, 0, newImage.Width, newImage.Height);

            return newImage;
        }

    }
}
