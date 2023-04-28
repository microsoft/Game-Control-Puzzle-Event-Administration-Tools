using Azure.Storage.Blobs;
using Microsoft.Extensions.Configuration;
using System.IO;
using System.Threading.Tasks;

namespace GameControl.Server.Events
{
    public class AzureBlobStorageMediaHandler : IMediaHandler
    {
        private BlobContainerClient containerClient;
        private readonly string blobBaseUrl = "";

        public AzureBlobStorageMediaHandler(IConfiguration configuration)
        {
            var blobConnectionString = configuration.GetSection("GameControl")["BlobStorageConnectionString"];
            this.blobBaseUrl = configuration.GetSection("GameControl")["BlobStorageBaseUrl"];
            this.containerClient = new BlobContainerClient(blobConnectionString, "events");
        }

        public bool IsMediaSupported { get { return true; } }

        public async Task<string> UploadBinaryContent(MemoryStream memoryStream, string path)
        {
            BlobClient blobClient = containerClient.GetBlobClient(path);
            memoryStream.Position = 0;
            var response = await blobClient.UploadAsync(memoryStream);

            return this.blobBaseUrl + path;
        }
    }
}
