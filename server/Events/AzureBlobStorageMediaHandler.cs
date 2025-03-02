using Azure.Storage.Blobs;
using Microsoft.Extensions.Configuration;
using System.IO;
using System.Threading.Tasks;

namespace GameControl.Server.Events
{
    public class AzureBlobStorageMediaHandler : IMediaHandler
    {
        private BlobContainerClient containerClient;

        public AzureBlobStorageMediaHandler(BlobServiceClient client)
        {
            this.containerClient = client.GetBlobContainerClient("events");
        }

        public bool IsMediaSupported { get { return true; } }

        public async Task<string> UploadBinaryContent(MemoryStream memoryStream, string path)
        {
            BlobClient blobClient = containerClient.GetBlobClient(path);
            memoryStream.Position = 0;
            var response = await blobClient.UploadAsync(memoryStream);

            return containerClient.Uri + path;
        }
    }
}
