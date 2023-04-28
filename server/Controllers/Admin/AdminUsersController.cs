using GameControl.Server.Database;
using GameControl.Server.Database.Tables;
using GameControl.Server.RequestTypes;
using GameControl.Server.RequestTypes.Admin;
using GameControl.Server.ViewModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

namespace GameControl.Server.Controllers
{
    [Authorize]
    [Route("api/admin/users")]
    public class AdminUsersController : ControllerBase
    {
        private readonly string ANONYMIZED_USER_NAME = "Anonymous Player";
        private readonly GameControlContext dbContext;

        public AdminUsersController(GameControlContext dbContext)
        {
            this.dbContext = dbContext;
        }

        [HttpGet]
        public IActionResult GetUsers()
        {
            if (this.dbContext.isUserMetaAdmin(ParticipantIdFromClaim))
            {
                Dictionary<Guid, UserViewModel> allUsers = new Dictionary<Guid, UserViewModel>();
                var allTeams = this.dbContext.Team.ToList();
                var allEventInstances = this.dbContext.EventInstance.ToList();

                foreach (var participant in this.dbContext.Participant.Where(p => p.FirstName != ANONYMIZED_USER_NAME).OrderBy(p => p.LastName))
                {
                    allUsers.Add(participant.ParticipantId, new UserViewModel(participant)
                    {
                        Participation = new List<ParticipationViewModel>(),
                        LoginNames = new List<LoginMap>()
                    });
                }

                Dictionary<Guid, Guid> participationToParticipant = new Dictionary<Guid, Guid>();

                foreach (Participation participation in this.dbContext.Participation)
                {
                    if (allUsers.ContainsKey(participation.Participant))
                    {
                        participationToParticipant.Add(participation.ParticipationId, participation.Participant);
                        allUsers[participation.Participant].Participation.Add(new ParticipationViewModel()
                        {
                            EventInstanceId = participation.EventInstance,
                            ParticipationId = participation.ParticipationId,
                            EventFriendlyName = allEventInstances.FirstOrDefault(p => p.EventInstanceId == participation.EventInstance).FriendlyName,
                            TeamId = participation.Team,
                            IsAdmin = participation.IsAdmin,
                            IsStaff = participation.IsStaff,
                            TeamName = !participation.Team.HasValue ? null : allTeams.First(p => p.TeamId == participation.Team).Name
                        });
                    }
                };

                foreach (var login in this.dbContext.ParticipationLogin)
                {
                    if (participationToParticipant.ContainsKey(login.Participation))
                    {
                        allUsers[participationToParticipant[login.Participation]].LoginNames.Add(new LoginMap()
                        {
                            LoginName = login.UserName,
                            EventName = "Unknown Event"
                        });
                    }
                }

                return Ok(allUsers.Values);
            }

            return Forbid();
        }

        [HttpPost("{eventInstance}")]
        public IActionResult AddUser(Guid eventInstance, [FromBody] AddUserTemplate newUser)
        {
            if (this.dbContext.isUserMetaAdmin(ParticipantIdFromClaim) || this.dbContext.isUserAdminForEvent(ParticipantIdFromClaim, eventInstance))
            {
                if (newUser != null)
                {
                    var specifiedTeam = newUser.TeamId.HasValue ? this.dbContext.Team.FirstOrDefault(p => p.TeamId == newUser.TeamId) : null;

                    if (newUser.TeamId == null || (specifiedTeam != null && specifiedTeam.EventInstance == eventInstance))
                    {

                        Participant newParticipant = new Participant()
                        {
                            ParticipantId = Guid.NewGuid(),
                            FirstName = newUser.FirstName,
                            LastName = newUser.LastName,
                            Email = newUser.Email,
                            ContactNumber = newUser.ContactNumber,
                            LastChanged = DateTime.UtcNow
                        };

                        this.dbContext.Participant.Add(newParticipant);
                        this.dbContext.SaveChanges();

                        Participation newParticipation = new Participation()
                        {
                            ParticipationId = Guid.NewGuid(),
                            EventInstance = eventInstance,
                            IsAdmin = newUser.IsAdmin ?? false,
                            IsStaff = newUser.IsStaff ?? false,
                            LastUpdated = DateTime.UtcNow,
                            Participant = newParticipant.ParticipantId,
                            Team = newUser.TeamId
                        };

                        this.dbContext.Participation.Add(newParticipation);
                        this.dbContext.SaveChanges();

                        if (!string.IsNullOrEmpty(newUser.Login) && !string.IsNullOrEmpty(newUser.Password))
                        {
                            byte[] salt = AuthenticationController.GenerateSalt();
                            byte[] finalhash = AuthenticationController.HashPassword(newUser.Password, salt);


                            ParticipationLogin login = new ParticipationLogin()
                            {
                                Participation = newParticipation.ParticipationId,
                                UserName = newUser.Login,
                                HashedSaltedPassword = finalhash,
                                Salt = salt
                            };

                            this.dbContext.ParticipationLogin.Add(login);
                            this.dbContext.SaveChanges();
                        }

                        return Ok(new UserViewModel(newParticipant)
                        {
                            Participation = new List<ParticipationViewModel>(new ParticipationViewModel[] {
                            new ParticipationViewModel()
                            {
                                ParticipationId = newParticipation.ParticipationId,
                                EventInstanceId = newParticipation.EventInstance,
                                IsStaff = newParticipation.IsStaff,
                                IsAdmin = newParticipation.IsAdmin,
                                TeamId = newParticipation.Team,
                                TeamName = specifiedTeam?.Name ?? null,
                                TeamShortName = specifiedTeam?.ShortName ?? null
                            }
                        }),
                            LoginNames = new List<LoginMap>()
                        });
                    }
                    else
                    {
                        return BadRequest("Invalid team specified");
                    }
                }
                else
                {
                    return BadRequest("No user specified");
                }
            }
            else
            {
                return Forbid();
            }
        }

        [HttpPut("{participantId}/{eventInstanceId}")]
        public IActionResult AddEvent(Guid participantId, Guid eventInstanceId, string apiKey, [FromBody] NewParticipationTemplate newParticipation)
        {
            if (this.dbContext.isUserAdminForEvent(ParticipantIdFromClaim, eventInstanceId) || this.dbContext.isUserMetaAdmin(participantId) || (apiKey != null && this.dbContext.isApiKeyValid(eventInstanceId, apiKey)))
            {
                var newParticipationObj = this.dbContext.Participation.FirstOrDefault(p => p.EventInstance == eventInstanceId && p.Participant == participantId);

                if (newParticipationObj == null)
                {
                    var newPart = new Participation()
                    {
                        EventInstance = eventInstanceId,
                        ParticipationId = Guid.NewGuid(),
                        Participant = participantId,
                        IsAdmin = newParticipation.IsAdmin,
                        IsStaff = newParticipation.IsStaff,
                        Team = newParticipation.TeamId,
                        LastUpdated = DateTime.UtcNow
                    };

                    this.dbContext.Participation.Add(newPart);
                    this.dbContext.SaveChanges();

                    return Ok(new UserViewModel()
                    {
                        ParticipantId = participantId,
                        Participation = new List<ParticipationViewModel>(new ParticipationViewModel[]
                        {
                            new ParticipationViewModel()
                            {
                                ParticipationId = newPart.ParticipationId,
                                TeamId = newPart.Team,
                                IsStaff = newPart.IsStaff,
                                IsAdmin = newPart.IsAdmin,
                                EventInstanceId = newPart.EventInstance
                            }
                        })
                    });
                }
                else
                {
                    newParticipationObj.IsStaff = newParticipation.IsStaff;
                    newParticipationObj.IsAdmin = newParticipation.IsAdmin;
                    newParticipationObj.Team = newParticipation.TeamId;

                    this.dbContext.Participation.Update(newParticipationObj);
                    this.dbContext.SaveChanges();

                    return Ok(new UserViewModel()
                    {
                        ParticipantId = participantId,
                        Participation = new List<ParticipationViewModel>(new ParticipationViewModel[]
                        {
                            new ParticipationViewModel()
                            {
                                EventInstanceId = newParticipationObj.EventInstance,
                                ParticipationId = newParticipationObj.ParticipationId,
                                IsAdmin = newParticipationObj.IsAdmin,
                                IsStaff = newParticipationObj.IsStaff,
                                TeamId = newParticipationObj.Team
                            }
                        })
                    });
                }
            }

            return Forbid();
        }

        [HttpPut("{participantId}")]
        public IActionResult UpdateUserInfo(Guid participantId, [FromBody] EditUserTemplate userInfo)
        {
            if (this.dbContext.isUserMetaAdmin(ParticipantIdFromClaim))
            {
                Participant participant = this.dbContext.Participant.FirstOrDefault(p => p.ParticipantId == participantId);

                if (participant != null)
                {
                    participant.Email = userInfo.Email;
                    participant.ContactNumber = userInfo.ContactNumber;

                    this.dbContext.Participant.Update(participant);
                    this.dbContext.SaveChanges();

                    var participations = this.dbContext.Participation.Where(p => p.Participant == participantId).ToList();

                    return Ok(new UserViewModel(participant));
                }

                return NotFound();
            }

            return Forbid();
        }

    }
}
