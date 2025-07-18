using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using GameControl.Server.Util;
using Microsoft.Extensions.Configuration;
using SixLabors.ImageSharp;
using System;
using System.IO;
using System.Threading.Tasks;

namespace GameControl.Server.Events
{
    public class AzureBlobStorageMediaHandler : IMediaHandler
    {
        private readonly BlobContainerClient containerClient;
        private readonly string blobBaseUrl = string.Empty;

        public AzureBlobStorageMediaHandler(IConfiguration configuration)
        {
            var blobConnectionString = configuration.GetSection("GameControl")["BlobStorageConnectionString"];
            this.blobBaseUrl = configuration.GetSection("GameControl")["BlobStorageBaseUrl"];

            // Using the $web container for static website hosting
            this.containerClient = new BlobContainerClient(blobConnectionString, "$web");
        }

        public bool IsMediaSupported { get { return true; } }

        public async Task<string> UploadBinaryContent(MemoryStream memoryStream, string path)
        {
            // Get the MIME type for the image
            memoryStream.Position = 0;
            Image image = Image.Load(memoryStream);
            var mimeType = GameControlUtil.GetMimeType(GameControlUtil.GetImageFormat(image));
            
            BlobClient blobClient = containerClient.GetBlobClient(path);
            BlobUploadOptions uploadOptions = new BlobUploadOptions
            {
                HttpHeaders = new BlobHttpHeaders { ContentType = mimeType }
            };
            memoryStream.Position = 0;
            var response = await blobClient.UploadAsync(memoryStream, uploadOptions);

            if (response.GetRawResponse().IsError)
            {
                throw new IOException($"Failed to upload media to Azure Blob Storage: {response.GetRawResponse().ReasonPhrase}");
            }

            return new Uri(new Uri(this.blobBaseUrl), path).ToString();
        }
    }
}
