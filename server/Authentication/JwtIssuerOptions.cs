using Microsoft.IdentityModel.Tokens;
using System;
using System.Threading.Tasks;

namespace GameControl.Server.Authentication
{
    public class JwtIssuerOptions
    {
        /// <summary>
        ///  "iss" (Issuer) Claim
        /// </summary>
        public string Issuer { get; set; }

        /// <summary>
        /// "sub" (Subject) claim
        /// </summary>
        public string Subject { get; set; }

        /// <summary>
        /// "aud" (Audience) claim
        /// </summary>
        public string Audience { get; set; }

        public DateTime NotBefore => DateTime.UtcNow;

        public DateTime IssuedAt => DateTime.UtcNow;

        public TimeSpan ValidFor { get; set; } = TimeSpan.FromDays(5);

        public DateTime Expiration => IssuedAt.Add(ValidFor);

        public Func<Task<string>> JtiGenerator =>
            () => Task.FromResult(Guid.NewGuid().ToString());

        public SigningCredentials SigningCredentials { get; set; }
    }
}
