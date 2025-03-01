using System;
using System.Text;
using System.Threading.Tasks;
using GameControl.Server.Authentication;
using GameControl.Server.Database;
using GameControl.Server.Events;
using GameControl.Server.Hubs;
using LazyCache;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Azure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

namespace GameControl.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            builder.AddServiceDefaults();

            var services = builder.Services;
            var configuration = builder.Configuration;

            builder.AddSqlServerDbContext<GameControlContext>(connectionName: "spiderdog-v2");

            var jwtAppSettingOptions = configuration.GetSection(nameof(JwtIssuerOptions));
            var SecretKey = configuration.GetSection("GameControl")["SecretKey"];
            var signingKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(SecretKey));
            services.Configure<JwtIssuerOptions>(options =>
            {
                options.Issuer = jwtAppSettingOptions[nameof(JwtIssuerOptions.Issuer)];
                options.Audience = jwtAppSettingOptions[nameof(JwtIssuerOptions.Audience)];
                options.SigningCredentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);
                options.ValidFor = TimeSpan.FromDays(5.0);
            });

            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = jwtAppSettingOptions[nameof(JwtIssuerOptions.Issuer)],
                ValidateAudience = true,
                ValidAudience = jwtAppSettingOptions[nameof(JwtIssuerOptions.Audience)],
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = signingKey,
                RequireExpirationTime = true,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(o =>
            {
                o.TokenValidationParameters = tokenValidationParameters;
                o.IncludeErrorDetails = true;
                o.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];

                        // If the request is for our hub...
                        var path = context.HttpContext.Request.Path;
                        if (!string.IsNullOrEmpty(accessToken) &&
                            (path.StartsWithSegments("/hub")))
                        {
                            // Read the token out of the query string
                            context.Token = accessToken;
                        }
                        return Task.CompletedTask;
                    }
                };
            });

            // Logging
            services.AddLogging();

            // Telemetry
#if !DEBUG
            services.AddOpenTelemetry().UseAzureMonitor();
#endif

            services.AddControllers().AddNewtonsoftJson();
            services.AddControllersWithViews().AddControllersAsServices();
            services.AddSignalR();

            services.AddSingleton<IAppCache>(new CachingService());
            services.AddSingleton<IEventHandler>(sp => new IntegrationHubEventHandler(sp.GetService<IHubContext<IntegrationHub>>()));

            var blobConnectionString = configuration.GetSection("GameControl")["BlobStorageConnectionString"];
            var blobBaseUrl = configuration.GetSection("GameControl")["BlobStorageBaseUrl"];

            if (!string.IsNullOrEmpty(blobConnectionString) && !string.IsNullOrEmpty(blobBaseUrl))
            {
                services.AddSingleton<IMediaHandler>(new AzureBlobStorageMediaHandler(configuration));
            }
            else
            {
                services.AddSingleton<IMediaHandler>(new NoopMediaHandler());
            }
            services.AddAzureClients(builder =>
            {
                builder.AddBlobServiceClient(configuration["ConnectionStrings:GameControlStorage:blob"], preferMsi: true);
                builder.AddQueueServiceClient(configuration["ConnectionStrings:GameControlStorage:queue"], preferMsi: true);
            });

            var app = builder.Build();

            app.MapDefaultEndpoints();

            app.UseRouting();

            if (app.Environment.IsDevelopment())
            {
                app.Logger.LogInformation("In Development Mode");
                app.UseDeveloperExceptionPage();

                app.UseCors(builder =>
                    builder
                    .WithOrigins("http://localhost:3000")
                        // .AllowAnyOrigin()
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials()
                );
            }
            else
            {
                // With an NGINX proxy in front of the API, the HTTPS redirect
                // is no longer required as this container is not publicly exposed.

                //app.UseRewriter(new RewriteOptions().AddRedirectToHttps());

                app.UseCors(builder =>
                    builder
                    .WithOrigins(configuration.GetSection("GameControl")["CorsOrigin"])
                        // .AllowAnyOrigin()
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials()
                );
            }

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                app.Logger.LogInformation("Using Endpoints");
                endpoints.MapHub<NotificationHub>("/hub");
                endpoints.MapHub<IntegrationHub>("/integrationhub");
                endpoints.MapControllers();
            });
        }
    }
}
