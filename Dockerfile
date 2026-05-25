# Stage 1: Base runtime environment
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

# Stage 2: Build and restore dependencies
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["Tazk_project.csproj", "."]
RUN dotnet restore "./Tazk_project.csproj"
COPY . .
RUN dotnet build "Tazk_project.csproj" -c Release -o /app/build

# Stage 3: Publish the binaries
FROM build AS publish
RUN dotnet publish "Tazk_project.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 4: Final runtime image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Render dynamically binds the app to a port using the PORT env variable
ENV ASPNETCORE_URLS=http://*:${PORT}

ENTRYPOINT ["dotnet", "Tazk_project.dll"]
