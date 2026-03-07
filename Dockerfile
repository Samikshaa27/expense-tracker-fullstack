FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy project file
COPY backend/*.csproj ./
RUN dotnet restore

# Copy all backend source code
COPY backend/. ./

# Build the application
RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .

# Start app with dynamic port mapping
ENV ASPNETCORE_URLS=http://*:${PORT:-5269}
ENTRYPOINT ["dotnet", "ExpenseTrackerAPI.dll"]
