using server.Data;
using Microsoft.EntityFrameworkCore;
using server.Security;
using server.Services;
using server.Services.Interfaces;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Text;
using Microsoft.OpenApi.Models;
using server.Settings;
using System.Security.Claims;
using server.Interfaces.Training;
using server.Services.Training;
using server.Services.Enrollment;
using server.Interfaces.Enrollment;
using server.Services.Attendance;
using server.Interfaces.Attendance;
using server.Services.DocumentExtraction;


var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:3000","http://localhost:3001", "http://192.168.1.16:3000","https://anci-tms.vercel.app"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
builder.Services.AddScoped<
    IParticipantProfileService,
    ParticipantProfileService
>();

builder.Services.AddScoped<
    ILearningMaterialService,
    LearningMaterialService
>();
builder.Services.AddScoped<
    ILearningMaterialAiService,
    LearningMaterialAiService
>();
builder.Services.AddScoped<
    IOpenCodeService,
    OpenCodeService
>();
builder.Services.AddScoped<
    IDocumentTextExtractionService,
    DocumentTextExtractionService>();

builder.Services.AddScoped<
    ITrainingScheduleService,
    TrainingScheduleService
>();
builder.Services.AddScoped<
    IWrittenAssessmentService,
    WrittenAssessmentService
>();
builder.Services.AddScoped<
    IAdminProfileService,
    AdminProfileService
>();
builder.Services.AddScoped<
    IEnrollmentDocumentService,
    EnrollmentDocumentService
>();

builder.Services.AddScoped
<IAssessmentAiService, 
AssessmentAiService
>();


builder.Services.AddScoped<
    IAttendanceService,
    AttendanceService
>();

builder.Services.AddScoped<
    ILearningProgressService,
    LearningProgressService>();
    
builder.Services.AddScoped<
    ITrainingProgramService,
    TrainingProgramService>();
builder.Services.AddScoped<
    ITrainingProgramDocumentService,
    TrainingProgramDocumentService
>();
builder.Services.AddScoped<
    ITrainingBatchService,
    TrainingBatchService>();
builder.Services.AddScoped<
    IEnrollmentService,
    EnrollmentService>();
builder.Services.AddScoped<
    ITrainerAssignmentService,
    TrainerAssignmentService>();

builder.Services.AddScoped<
    ITrainerProfileService,
    TrainerProfileService
>();
builder.Services.AddScoped<
    ITrainerApplicationService,
    TrainerApplicationService
>();
builder.Services.Configure<CloudinarySettings>(
    builder.Configuration.GetSection("Cloudinary")
);

builder.Services.AddScoped<ICloudinaryService, CloudinaryService>();
builder.Services.AddScoped<PasswordService>();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);
builder.Services
    .AddAuthentication(
        JwtBearerDefaults.AuthenticationScheme
    )
    .AddJwtBearer(options =>
{
    var secret =
        builder.Configuration["Jwt:Secret"];

    var issuer =
        builder.Configuration["Jwt:Issuer"];

    var audience =
        builder.Configuration["Jwt:Audience"];

    options.TokenValidationParameters =
        new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,

            IssuerSigningKey =
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(secret!)
                ),

            ValidateIssuer = true,
            ValidIssuer = issuer,

            ValidateAudience = true,
            ValidAudience = audience,

            ValidateLifetime = true,

            ClockSkew =
                TimeSpan.FromMinutes(1),

            RoleClaimType =
                ClaimTypes.Role,

            NameClaimType =
                ClaimTypes.Name
        };

    options.Events =
        new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine();
                Console.WriteLine(
                    "========== JWT ERROR =========="
                );

                Console.WriteLine(
                    context.Exception.GetType().FullName
                );

                Console.WriteLine(
                    context.Exception.Message
                );

                Console.WriteLine(
                    "================================"
                );

                return Task.CompletedTask;
            }
        };
});



builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<
    IOtpService,
    OtpService
>();
builder.Services.AddScoped<PasswordService>();
builder.Services.AddDataProtection();

builder.Services.AddScoped<JwtService>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description =
                "Enter your JWT token. Example: Bearer {your token}"
        }
    );

    options.AddSecurityRequirement(
        new OpenApiSecurityRequirement
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
        }
    );
});
builder.Services.AddHttpClient();
var app = builder.Build();

app.UseCors("FrontendPolicy");

app.UseSwagger();
app.UseSwaggerUI();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();