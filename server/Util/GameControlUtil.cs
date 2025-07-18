using System;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text.RegularExpressions;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats;

namespace GameControl.Server.Util
{
    public class GameControlUtil
    {
        public static string SanitizeString(string inputString)
        {
            try
            { 
                return Regex.Replace(inputString, @"[^\w\u20a0-\u32ff\u1f000-\u1ffff\ufe4e5-\ufe4ee]", "",
                                     RegexOptions.None, TimeSpan.FromSeconds(1.5)).ToUpperInvariant();
            }
            // If we timeout when replacing invalid characters, 
            // we should return Empty.
            catch (RegexMatchTimeoutException)
            {
                return String.Empty;
            }
        }

        public static string DecryptContent(Guid contentId, byte[] encryptionKey, byte[] contentData)
        {
            CryptoStream cs = new CryptoStream(
                new MemoryStream(contentData),
                Aes.Create().CreateDecryptor(encryptionKey, contentId.ToByteArray()),
                CryptoStreamMode.Read);

            StreamReader sr = new StreamReader(cs);
            return sr.ReadToEnd();
        }

        #region Image Utilities
        public static IImageFormat GetImageFormat(Image image)
        {
            return image.Metadata.DecodedImageFormat;
        }

        public static string GetMimeType(IImageFormat format)
        {
            return format?.DefaultMimeType ?? "application/octet-stream";
        }

        public static string GetExtension(IImageFormat format)
        {
            if (format == null) return ".bin";
            
            return format.FileExtensions.FirstOrDefault() ?? ".bin";
        }
        #endregion
    }
}
