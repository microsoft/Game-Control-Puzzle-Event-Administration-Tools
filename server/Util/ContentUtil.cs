using Azure.Storage.Blobs;
using GameControl.Server.Database;
using GameControl.Server.Database.Tables;
using GameControl.Server.Events;
using GameControl.Server.RequestTypes;
using GameControl.Server.ViewModel;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace GameControl.Server.Util
{
    public class ContentUtil
    {
        public static void UploadContentToBlobStorage(BlobContainerClient containerClient, MemoryStream memoryStream, string path)
        {
            BlobClient achievementBlob = containerClient.GetBlobClient(path);
            memoryStream.Position = 0;
            var response = achievementBlob.Upload(memoryStream);
        }

        public static async Task<Content> AddContent(GameControlContext dbContext, IMediaHandler mediaHandler, NewTextContentTemplate content)
        {
            if (content.ContentType == "PlainText" || content.ContentType == "YoutubeUrl" || content.ContentType == "Hyperlink" || content.ContentType == "RichText")
            {
                Content newContent = new Content()
                {
                    ContentId = Guid.NewGuid(),
                    ContentType = content.ContentType,
                    Name = content.ContentName,
                    ContentText = content.StringContent,
                    LastUpdate = DateTime.UtcNow
                };

                dbContext.AdditionalContent.Add(newContent);
                dbContext.SaveChanges();
                return newContent;
            }
            else if (content.ContentType == "Image" && content.BinaryContent != null)
            {
                if (mediaHandler.IsMediaSupported)
                {
                    Content newContent = new Content()
                    {
                        ContentId = Guid.NewGuid(),
                        ContentType = content.ContentType,
                        Name = content.ContentName,
                        LastUpdate = DateTime.UtcNow,
                    };

                    var targetPath =
                        string.Format("content/{0}/{1}",
                            newContent.ContentId,
                            content.BinaryContent.FileName
                        );

                    using (var memoryStream = new MemoryStream())
                    {
                        await content.BinaryContent.CopyToAsync(memoryStream);
                        newContent.ContentText = await mediaHandler.UploadBinaryContent(memoryStream, targetPath);
                        dbContext.AdditionalContent.Add(newContent);
                        dbContext.SaveChanges();
                        return newContent;
                    }
                }
                else
                {
                    throw new InvalidOperationException();
                }
            }
            else
            {
                throw new InvalidOperationException();
            }
        }

        public static IEnumerable<ContentViewModel> GetContentForClue(GameControlContext dbContext, Guid tableOfContentId)
        {
            return dbContext.GetAdditionalContentForClue(tableOfContentId).Select(p => new ContentViewModel(p));
        }
    }
}
