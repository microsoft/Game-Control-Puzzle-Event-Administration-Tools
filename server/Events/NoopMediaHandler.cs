using System;
using System.IO;
using System.Threading.Tasks;

namespace GameControl.Server.Events
{
    public class NoopMediaHandler : IMediaHandler
    {
        public bool IsMediaSupported { get { return false; } }

        public Task<string> UploadBinaryContent(MemoryStream memoryStream, string path)
        {
            throw new InvalidOperationException("Custom media is not supported by this application");
        }
    }
}
