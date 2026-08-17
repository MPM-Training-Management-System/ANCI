using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using server.Data;
using server.Services;
using System.Text;
using server.Services.Interfaces;
using server.Algorithms;
using Npgsql;
using server.Models;
using System.Security.Claims;
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddMemoryCache();
var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection");

if (!string.IsNullOrWhiteSpace(connectionString))
{
    var builderConnection =
        new Npgsql.NpgsqlConnectionStringBuilder(connectionString);

    Console.WriteLine("================================");
    Console.WriteLine("DATABASE CONFIG");
    Console.WriteLine($"Host: {builderConnection.Host}");
    Console.WriteLine($"Port: {builderConnection.Port}");
    Console.WriteLine($"Database: {builderConnection.Database}");
    Console.WriteLine($"Username: {builderConnection.Username}");
    Console.WriteLine("================================");
}
else
{
    Console.WriteLine("DATABASE CONFIG: CONNECTION STRING IS NULL");
}


builder.Services.AddScoped<ICacheService, CacheService>();
builder.Services.AddScoped<
    IParticipantPolicyService,
    ParticipantPolicyService
>();

builder.Services.AddScoped<
    IUserApplicationService,
    UserApplicationService
>();
builder.Services.AddScoped<
    IParticipantService,
    ParticipantService>();
builder.Services.AddScoped<OcrService>();

builder.Services.AddScoped<
    IIdValidationService,
    IdValidationService
>();
    
builder.Services.AddScoped<IOtpService, OtpService>();
builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("EmailSettings")
);
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    ));
builder.Services.AddScoped<CloudinaryService>();
builder.Services.AddScoped<IParticipantService, ParticipantService>();
builder.Services.AddScoped<ITrainerService, TrainerService>();

// Controllers
builder.Services.AddControllers();
builder.Services.AddScoped<ITrainingProgramService, TrainingProgramService>();
// JWT Service
builder.Services.AddScoped<ITrainingScheduleService, TrainingScheduleService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<ScheduleConflictChecker>();
// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "ANCI API",
        Version = "v1"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Enter JWT Token",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
{
    ValidateIssuer = true,
    ValidateAudience = true,
    ValidateLifetime = true,
    ValidateIssuerSigningKey = true,

    ValidIssuer = builder.Configuration["Jwt:Issuer"],
    ValidAudience = builder.Configuration["Jwt:Audience"],

    IssuerSigningKey = new SymmetricSecurityKey(
        Encoding.UTF8.GetBytes(
            builder.Configuration["Jwt:Key"]!
        )
    ),

    RoleClaimType = ClaimTypes.Role
};
    });

builder.Services.AddAuthorization();


// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",
                "http://localhost:3001",
                "https://anci-tms.vercel.app"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});


if (builder.Environment.IsDevelopment())
{
    builder.WebHost.UseUrls("http://0.0.0.0:5296");
}

var app = builder.Build();

// Swagger
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseCors("Frontend");

// Authentication
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();