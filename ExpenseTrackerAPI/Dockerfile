# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy csproj and restore as distinct layers
COPY ["ExpenseTrackerAPI.csproj", "./"]
RUN dotnet restore "./ExpenseTrackerAPI.csproj"

# Copy everything else and build app
COPY . .
RUN dotnet publish "./ExpenseTrackerAPI.csproj" -c Release -o out

# Final stage/image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .

# Expose port and start app
ENV ASPNETCORE_URLS=http://+:5269
EXPOSE 5269
ENTRYPOINT ["dotnet", "ExpenseTrackerAPI.dll"]
