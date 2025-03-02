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

            builder.AddSqlServerDbContext<GameControlContext>(connectionName: "master");
            builder.AddAzureBlobClient("blobs");
            builder.AddAzureQueueClient("queues");

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

            services.AddControllers().AddNewtonsoftJson();
            services.AddControllersWithViews().AddControllersAsServices();
            services.AddSignalR();

            services.AddSingleton<IAppCache>(new CachingService());
            services.AddSingleton<IEventHandler>(sp => new IntegrationHubEventHandler(sp.GetService<IHubContext<IntegrationHub>>()));
            services.AddSingleton<IMediaHandler, AzureBlobStorageMediaHandler>();

            var app = builder.Build();

            app.MapDefaultEndpoints();

            app.UseRouting();

            if (app.Environment.IsDevelopment())
            {
                app.Logger.LogInformation("In Development Mode");
                app.UseDeveloperExceptionPage();
            }

            app.UseCors(corsBuilder =>
                corsBuilder
                    .WithOrigins(configuration.GetSection("GameControl")["CorsOrigin"])
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials()
            );

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
