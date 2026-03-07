

using ExpenseTrackerAPI.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddHttpClient();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("https://expense-tracker-fullstack-ten.vercel.app")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Add Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter: Bearer {your JWT token}"
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Check Railway's default DATABASE_URL environment variable if standard config is missing or has placeholders
var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
if (!string.IsNullOrEmpty(databaseUrl))
{
    connectionString = databaseUrl;
}

builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (connectionString != null && (connectionString.StartsWith("postgres://") || connectionString.StartsWith("postgresql://") || connectionString.Contains("Host=")))
    {
        // Handle postgresql:// URI format
        var formattedConnString = connectionString;
        if (formattedConnString.StartsWith("postgres://") || formattedConnString.StartsWith("postgresql://"))
        {
            // Simple converter for postgres:// URI to Npgsql connection string
            var uri = new Uri(formattedConnString);
            var userInfo = uri.UserInfo.Split(':');
            formattedConnString = $"Host={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')};Username={userInfo[0]};Password={userInfo[1]};SslMode=Require;Trust Server Certificate=true;";
        }
        options.UseNpgsql(formattedConnString);
    }
    else
    {
        options.UseSqlServer(connectionString ?? "Server=(localdb)\\mssqllocaldb;Database=ExpenseTrackerDB;Trusted_Connection=True;");
    }
});
var app = builder.Build();

// AUTOMATICALLY CREATE DATABASE TABLES ON STARTUP
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        context.Database.Migrate();
        Console.WriteLine("✅ Database shifted/migrated successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ An error occurred while migrating the database: {ex.Message}");
    }
}

app.UseRouting();

// 1. CORS MUST BE after UseRouting but before Authorization
app.UseCors("AllowFrontend");

// 2. Logging
app.Use(async (context, next) =>
{
    Console.WriteLine($"Incoming {context.Request.Method} request: {context.Request.Path}");
    await next();
});

// 3. Swagger
app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => "Expense Tracker API is running!");
app.MapControllers();

app.Run();