using System.IO;
using System.Threading.Tasks;

namespace GameControl.Server.Events
{
    public interface IMediaHandler
    {
        bool IsMediaSupported { get; }

        Task<string> UploadBinaryContent(MemoryStream memoryStream, string path);
    }
}
