using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text.RegularExpressions;

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
        public static ImageCodecInfo GetCodec(Image i)
        {
            var formatId = i.RawFormat.Guid;

            foreach (var codec in ImageCodecInfo.GetImageDecoders())
            {
                if (codec.FormatID == formatId)
                {
                    return codec;
                }
            }

            return null;
        }

        public static string GetExtension(ImageCodecInfo codec)
        {
            return codec.FilenameExtension
                .Split(new[] { ';' }, StringSplitOptions.RemoveEmptyEntries)
                .First()
                .Trim('*')
                .ToLower();
        }
        #endregion
    }
}
