var builder = DistributedApplication.CreateBuilder(args);

var storage = builder.AddAzureStorage("storage")
                     .RunAsEmulator();

var blobs = storage.AddBlobs("blobs");
var queues = storage.AddQueues("queues");

var db = builder.AddSqlServer("gamecontrol-db")
                 .WithBindMount("../database", "/usr/config")
                 .WithEntrypoint("/usr/config/entrypoint.sh")
                 .WithDataVolume()
                 .WithLifetime(ContainerLifetime.Persistent)
                 .AddDatabase("master");

// Parameters for server
var corsOriginParameter = builder.AddParameter("GameControlCorsOrigin");
var gameControlSecretKeyParameter = builder.AddParameter("GameControlSecretKey", secret: true);
var jwtIssuerOptionsAudienceParameter = builder.AddParameter("JwtIssuerOptionsAudience");
var jwtIssuerOptionsIssuerParameter = builder.AddParameter("JstIssuerOptionsIssuer");

var server = builder.AddProject<Projects.GameControl_Server>("gamecontrol-server")
       .WithEnvironment("GameControl__CorsOrigin", corsOriginParameter)
       .WithEnvironment("GameControl__SecretKey", gameControlSecretKeyParameter)
       .WithEnvironment("JwtIssuerOptions__Audience", jwtIssuerOptionsAudienceParameter)
       .WithEnvironment("JwtIssuerOptions__Issuer", jwtIssuerOptionsIssuerParameter)
       .WithReference(db)
       .WaitFor(db)
       .WithReference(blobs)
       .WaitFor(blobs)
       .WithReference(queues)
       .WaitFor(queues)
       .WithExternalHttpEndpoints();

builder.AddNpmApp("gamecontrol-client", "../client")
    .WithReference(server)
    .WaitFor(server)
    .WithEnvironment("BROWSER", "none") // Disable opening browser on npm start
    .WithExternalHttpEndpoints()
    .PublishAsDockerFile();

builder.Build().Run();
