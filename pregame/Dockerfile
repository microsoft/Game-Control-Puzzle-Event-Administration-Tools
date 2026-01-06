FROM mcr.microsoft.com/dotnet/sdk:8.0 AS builder
WORKDIR /source
COPY . .
RUN dotnet publish -c Debug -o /out Pregame/Pregame.csproj

FROM mcr.microsoft.com/dotnet/aspnet:8.0
COPY --from=builder /out/ .
ENTRYPOINT ["dotnet", "Pregame.dll"]