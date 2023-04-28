# the build stage uses the SDK image:
FROM mcr.microsoft.com/dotnet/core/sdk:3.1 as builder  
WORKDIR /source
COPY . .  
RUN dotnet restore
RUN dotnet publish -c Release -o /out GameControl.Server.csproj

# the final app uses the runtime image:
FROM mcr.microsoft.com/dotnet/core/aspnet:3.1  
COPY --from=builder /out/ .  
ENTRYPOINT ["dotnet", "GameControl.Server.dll"]