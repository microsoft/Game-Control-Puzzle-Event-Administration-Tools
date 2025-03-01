var builder = DistributedApplication.CreateBuilder(args);

var sql = builder.AddSqlServer("gamecontrol-db")
                 .WithLifetime(ContainerLifetime.Persistent);

var db = sql.AddDatabase("spiderdog-v2");

builder.AddProject<Projects.GameControl_Server>("gamecontrol-server")
       .WithReference(db)
       .WaitFor(db);

builder.Build().Run();
