# Use the official .NET SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore
COPY ["AbanobLeague.API.csproj", "./"]
RUN dotnet restore "AbanobLeague.API.csproj"

# Copy everything else and build
COPY . .
RUN dotnet publish "AbanobLeague.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Use the official ASP.NET runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Expose port 8080 for Render
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080

ENTRYPOINT ["dotnet", "AbanobLeague.API.dll"]
