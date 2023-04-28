using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using GameControl.Server.Authentication;
using GameControl.Server.Database;
using GameControl.Server.Database.Tables;
using GameControl.Server.RequestTypes;
using GameControl.Server.RequestTypes.Auth;
using GameControl.Server.ViewModel;
using GameControl.Server.ViewModel.Admin;
using System;
using System.Diagnostics;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace GameControl.Server.Controllers
{
    [Route("api/[controller]")]
    public class AuthenticationController : Controller
    {
        private const int SaltSize = 128;
        private static readonly Random Random = new Random(unchecked((int)DateTime.UtcNow.Ticks));

        private readonly String msaClientId;

        private readonly bool logAuthenticationFailures;

        private readonly JwtIssuerOptions jwtOptions;
        private readonly GameControlContext dbContext;
        private readonly JsonSerializerSettings jsonSerializerSettings;

        public AuthenticationController(IOptions<JwtIssuerOptions> jwtOptions, GameControlContext dbContext, IConfiguration configuration)
        {
            this.jwtOptions = jwtOptions.Value;
            this.dbContext = dbContext;
            this.jsonSerializerSettings = new JsonSerializerSettings
            {
                Formatting = Formatting.Indented
            };

            this.msaClientId = configuration.GetSection("GameControl")["MsaClientId"];
            this.logAuthenticationFailures = configuration.GetSection("GameControl").GetValue<bool>("LogAuthenticationFailures", false);
        }

        [HttpPut("[action]")]
        [AllowAnonymous]
        public async Task<IActionResult> JwtMsa([FromBody] MsaToken msaJwt)
        {
            if (String.IsNullOrEmpty(msaClientId))
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new InvalidOperationException("Microsoft Account authentication is not configured on this server."));
            }
            if (msaJwt == null)
            {
                return BadRequest();
            }

            try
            {
                JwtSecurityToken msaToken = new JwtSecurityToken(msaJwt.Token);

                Claim appId = msaToken.Claims.FirstOrDefault(p => p.Type == "aud");
                Claim oid = msaToken.Claims.FirstOrDefault(p => p.Type == "oid");

                Claim iss = msaToken.Claims.FirstOrDefault(p => p.Type == "iss");

                
                if (appId != null && oid != null)
                {
                    // Verify that the app ID matches our expected app ID.
                    if (String.CompareOrdinal(appId.Value, msaClientId) != 0)
                    {
                        return Unauthorized();
                    }

                    // And verify that the token was issued by the Microsoft Account service.
                    if (!iss.Value.StartsWith("https://sts.windows.net") &&
                        !iss.Value.StartsWith("https://login.microsoftonline.com"))
                    {
                        return Unauthorized();
                    }

                    var msaLogin = this.dbContext.ParticipantLoginMsa.FirstOrDefault(p => p.MicrosoftId == new Guid(oid.Value));

                    if (msaLogin != null)
                    {
                        return await this.GenerateJwtFromParticipantGuid(msaLogin.Participant);
                    }
                    else
                    {
                        Claim email = msaToken.Claims.FirstOrDefault(p => p.Type == "preferred_username");
                        var existingUser = this.dbContext.Participant.AsEnumerable().FirstOrDefault(p => email.Value.Equals(p.Email, StringComparison.InvariantCultureIgnoreCase));

                        if (existingUser != null)
                        {
                            ParticipantLoginMsa newMsaLogin = new ParticipantLoginMsa()
                            {
                                MicrosoftId = new Guid(oid.Value),
                                Participant = existingUser.ParticipantId,
                                PrincipalName = email.Value
                            };
                            this.dbContext.ParticipantLoginMsa.Add(newMsaLogin);
                            this.dbContext.SaveChanges();

                            return await this.GenerateJwtFromParticipantGuid(existingUser.ParticipantId);
                        }
                        else
                        {
                            if (this.logAuthenticationFailures) 
                            {
                                Debug.WriteLine("Could not find user with preferred username: " + email.Value);

                                SqmData newEvent = new SqmData()
                                {
                                    SqmId = Guid.NewGuid(),
                                    LastUpdated = DateTime.UtcNow,
                                    TimeCollected = DateTime.UtcNow,
                                    Data = "Failed to sign in with preferred_username: " + email.Value
                                };
                                this.dbContext.SqmData.Add(newEvent);
                                this.dbContext.SaveChanges();
                            }
                        }
                    }
                }

                Trace.TraceWarning("Failed to sign in");
                return Unauthorized();
            }
            catch (Exception)
            {
                return BadRequest();
            }

        }

        [HttpPost("[action]")]
        [AllowAnonymous]
        public async Task<IActionResult> JwtMsa([FromBody] MsaUser msaUser)
        {
            if (msaUser == null)
            {
                return BadRequest();
            }

            var msaLogin = this.dbContext.ParticipantLoginMsa.FirstOrDefault(p => p.MicrosoftId == msaUser.UserId);

            if (msaLogin != null)
            {
                return await this.GenerateJwtFromParticipantGuid(msaLogin.Participant);
            }
            else
            {
                // If we don't recognize the MSA OID, see if the PrincipalName matches the email address
                // associated with a user. If so we'll create the MsaLogin row for them.
                var principalUser = this.dbContext.Participant.FirstOrDefault(p => p.Email == msaUser.PrincipalName);

                if (principalUser != null)
                {
                    ParticipantLoginMsa newMsaLogin = new ParticipantLoginMsa()
                    {
                        MicrosoftId = msaUser.UserId,
                        Participant = principalUser.ParticipantId,
                        PrincipalName = msaUser.PrincipalName
                    };
                    this.dbContext.ParticipantLoginMsa.Add(newMsaLogin);
                    this.dbContext.SaveChanges();

                    return await this.GenerateJwtFromParticipantGuid(principalUser.ParticipantId);
                }
                else
                {
                    return NotFound("Could not find existing user with provided e-mail address.");
                }
            }
        }

        private async Task<IActionResult> GenerateJwtFromParticipantGuid(Guid participantId)
        {
            var participant = this.dbContext.Participant.FirstOrDefault(p => p.ParticipantId == participantId);
            var participations = this.dbContext.Participation.Where(p => p.Participant == participant.ParticipantId).ToList();

            var claims = new[]
            {
                new Claim("Sub", participant.ParticipantId.ToString()),
                new Claim("Jti", await this.jwtOptions.JtiGenerator()),
                new Claim("Iat", ToUnixEpochDate(this.jwtOptions.IssuedAt).ToString(), ClaimValueTypes.Integer64),
                new Claim("ParticipantId", participant.ParticipantId.ToString()),
                new Claim("DisplayName", !string.IsNullOrEmpty(participant.LastName) ?
                    string.Format("{0} {1}", participant.FirstName, participant.LastName) :
                    participant.FirstName)
            };

            var jwt = new JwtSecurityToken(
                issuer: this.jwtOptions.Issuer,
                audience: this.jwtOptions.Audience,
                claims: claims,
                notBefore: this.jwtOptions.NotBefore,
                expires: this.jwtOptions.Expiration,
                signingCredentials: this.jwtOptions.SigningCredentials);

            var encodedJwt = new JwtSecurityTokenHandler().WriteToken(jwt);

            // TODO: [Participation_GetParticipationByParticipant] is close to what's needed here, but doesn't pull in teams.
            // Determine if we can update that sproc safely with minimal impact on existing logic.
            var allEventInstances = this.dbContext.EventInstance.ToList();
            var allEvents = this.dbContext.Event.ToList();
            var allSettings = this.dbContext.Settings.ToList();

            var participationViewModels = participations.Select(p => new ParticipationViewModel()
            {
                ParticipationId = p.ParticipationId,
                IsStaff = p.IsStaff,
                IsAdmin = p.IsAdmin,
                TeamId = p.Team,
                TeamShortName = p.Team.HasValue ? this.dbContext.Team.First(q => q.TeamId == p.Team).ShortName : null,
                TeamName = p.Team.HasValue ? this.dbContext.Team.First(q => q.TeamId == p.Team).Name : null,
                EventInstanceId = p.EventInstance,
                EventFriendlyName = allEventInstances.First(q => q.EventInstanceId == p.EventInstance).FriendlyName,
                EventStartTime = allEventInstances.First(q => q.EventInstanceId == p.EventInstance).StartTime,
                EventEndTime = allEventInstances.First(q => q.EventInstanceId == p.EventInstance).EndTime,
                Settings = allSettings.Where(q => q.EventInstanceId == p.EventInstance && (p.IsStaff || q.SettingType == "UserString")).Select(q => new SettingViewModel(q))
            }).OrderBy(p => p.EventStartTime);

            var defaultParticipation = participations.FirstOrDefault(p => p.ParticipationId == participant.DefaultParticipation);
            EventInfo defaultEventInfo = null;

            if (defaultParticipation != null)
            {
                defaultEventInfo = new EventInfo()
                {
                    EventInstanceId = defaultParticipation.EventInstance,
                    IsAdmin = defaultParticipation.IsAdmin,
                    IsStaff = defaultParticipation.IsStaff
                };
            }

            return StatusCode((int)HttpStatusCode.OK, new LoginResult
            {
                ParticipantId = participant.ParticipantId,
                DisplayName = participant.FirstName + ' ' + participant.LastName,
                DefaultEventInstance = defaultEventInfo,
                Token = encodedJwt,
                ExpireTime = (int)this.jwtOptions.ValidFor.TotalSeconds,
                Participation = participationViewModels
            });

        }

        [HttpPost("[action]")]
        [AllowAnonymous]
        public async Task<IActionResult> Jwt([FromBody] ApplicationUser applicationUser)
        {
            if (applicationUser == null || string.IsNullOrEmpty(applicationUser.UserName) || string.IsNullOrEmpty(applicationUser.Password))
            {
                return BadRequest();
            }
            else
            {
                var participationLogin = this.dbContext.ParticipationLogin.FirstOrDefault(p => p.UserName == applicationUser.UserName);
                if (participationLogin == null)
                {
                    return Unauthorized();
                }
                else if (ValidatePassword(applicationUser.Password, participationLogin.Salt, participationLogin.HashedSaltedPassword))
                {
                    try
                    {
                        var participation = this.dbContext.Participation.FirstOrDefault(p => p.ParticipationId == participationLogin.Participation);
                        return await this.GenerateJwtFromParticipantGuid(participation.Participant);
                    }
                    catch (NullReferenceException)
                    {
                        return StatusCode((int)HttpStatusCode.InternalServerError);
                    }
                }
            }

            return new UnauthorizedResult();
        }

        /// <returns>Date converted to seconds since Unix epoch (Jan 1, 1970, midnight UTC).</returns>
        private static long ToUnixEpochDate(DateTime date)
          => (long)Math.Round((date.ToUniversalTime() -
                               new DateTimeOffset(1970, 1, 1, 0, 0, 0, TimeSpan.Zero))
                              .TotalSeconds);

        #region Password Utilities
        private static bool ValidatePassword(string password, byte[] salt, byte[] hashedSaltedPasword)
        {
            if (!string.IsNullOrEmpty(password))
            {
                byte[] hashToValidate = HashPassword(password, salt);
                return ValidatePasswordHash(hashToValidate, hashedSaltedPasword);
            }

            return false;
        }

        public static byte[] GenerateSalt()
        {
            byte[] salt = new byte[SaltSize];

            Random.NextBytes(salt);

            return salt;
        }

        public static byte[] HashPassword(string password, byte[] salt)
        {
            HashAlgorithm algorithm = new SHA256Managed();
            byte[] passwordBytes = algorithm.ComputeHash(Encoding.UTF8.GetBytes(password));
            byte[] hashWithSaltBytes = new byte[passwordBytes.Length + salt.Length];

            Buffer.BlockCopy(passwordBytes, 0, hashWithSaltBytes, 0, passwordBytes.Length);
            Buffer.BlockCopy(salt, 0, hashWithSaltBytes, passwordBytes.Length, salt.Length);

            return algorithm.ComputeHash(hashWithSaltBytes);
        }

        /// <summary>
        /// Attempts to validate the hashed password
        /// </summary>
        private static bool ValidatePasswordHash(byte[] hashedPasswordToValidate, byte[] hashedSaltedPassword)
        {
            if (hashedPasswordToValidate.Length != hashedSaltedPassword.Length)
            {
                return false;
            }

            for (int i = 0; i < hashedPasswordToValidate.Length; i++)
            {
                if (hashedPasswordToValidate[i] != hashedSaltedPassword[i])
                {
                    return false;
                }
            }

            return true;
        }

        #endregion
    }
}
