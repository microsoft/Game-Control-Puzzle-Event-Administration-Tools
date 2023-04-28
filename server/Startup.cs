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
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Azure;
using Azure.Storage.Queues;
using Azure.Storage.Blobs;
using Azure.Core.Extensions;

namespace GameControl.Server
{
    public class Startup
    {

        private readonly SymmetricSecurityKey signingKey;

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;

            var SecretKey = Configuration.GetSection("GameControl")["SecretKey"];
            signingKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(SecretKey));
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDbContext<GameControlContext>(options =>
                options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection")));

            var jwtAppSettingOptions = Configuration.GetSection(nameof(JwtIssuerOptions));
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

            services.AddLogging();
            services.AddControllers().AddNewtonsoftJson();
            services.AddControllersWithViews().AddControllersAsServices();
            services.AddSignalR();

            services.AddSingleton<IAppCache>(new CachingService());
            services.AddSingleton<IEventHandler>(sp => new IntegrationHubEventHandler(sp.GetService<IHubContext<IntegrationHub>>()));

            var blobConnectionString = Configuration.GetSection("GameControl")["BlobStorageConnectionString"];
            var blobBaseUrl = Configuration.GetSection("GameControl")["BlobStorageBaseUrl"];

            if (!string.IsNullOrEmpty(blobConnectionString) && !string.IsNullOrEmpty(blobBaseUrl))
            {
                services.AddSingleton<IMediaHandler>(new AzureBlobStorageMediaHandler(Configuration));
            }
            else
            {
                services.AddSingleton<IMediaHandler>(new NoopMediaHandler());
            }
            services.AddAzureClients(builder =>
            {
                builder.AddBlobServiceClient(Configuration["ConnectionStrings:GameControlStorage:blob"], preferMsi: true);
                builder.AddQueueServiceClient(Configuration["ConnectionStrings:GameControlStorage:queue"], preferMsi: true);
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILoggerFactory logger)
        {
            var configLogger = logger.CreateLogger("Configure");
            app.UseRouting();

            if (env.IsDevelopment())
            {
                configLogger.LogInformation("In Development Mode");
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
                    .WithOrigins(Configuration.GetSection("GameControl")["CorsOrigin"])
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
                configLogger.LogInformation("Using Endpoints");
                endpoints.MapHub<NotificationHub>("/hub");
                endpoints.MapHub<IntegrationHub>("/integrationhub");
                endpoints.MapControllers();
            });
        }
    }
    internal static class StartupExtensions
    {
        public static IAzureClientBuilder<BlobServiceClient, BlobClientOptions> AddBlobServiceClient(this AzureClientFactoryBuilder builder, string serviceUriOrConnectionString, bool preferMsi)
        {
            if (preferMsi && Uri.TryCreate(serviceUriOrConnectionString, UriKind.Absolute, out Uri serviceUri))
            {
                return builder.AddBlobServiceClient(serviceUri);
            }
            else
            {
                return builder.AddBlobServiceClient(serviceUriOrConnectionString);
            }
        }
        public static IAzureClientBuilder<QueueServiceClient, QueueClientOptions> AddQueueServiceClient(this AzureClientFactoryBuilder builder, string serviceUriOrConnectionString, bool preferMsi)
        {
            if (preferMsi && Uri.TryCreate(serviceUriOrConnectionString, UriKind.Absolute, out Uri serviceUri))
            {
                return builder.AddQueueServiceClient(serviceUri);
            }
            else
            {
                return builder.AddQueueServiceClient(serviceUriOrConnectionString);
            }
        }
    }
}
