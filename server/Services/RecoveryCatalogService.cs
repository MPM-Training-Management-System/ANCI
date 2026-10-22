
using System.Reflection;
using Microsoft.EntityFrameworkCore;

using server.Data;
using server.DTOs.Admin.Recovery;
using server.Interfaces;
using server.Models.Assessment;
using server.Models.Attendance;
using server.Models.Auth;
using server.Models.Learning;
using server.Models.Otp;
using server.Models.Participant;
using server.Models.Service;
using server.Models.Trainer;
using server.Models.Training;
using server.Services.Interfaces;

namespace server.Services;

public sealed class RecoveryCatalogService : IRecoveryCatalogService
{
    private readonly IConfiguration _configuration;
    private readonly ICacheService _cacheService;

    public RecoveryCatalogService(
        IConfiguration configuration,
        ICacheService cacheService
    )
    {
        _configuration = configuration;
        _cacheService = cacheService;
    }

    private sealed record ModuleDefinition(
        string Key,
        string Name,
        string Description,
        Type[] Entities
    );

    private static readonly ModuleDefinition[] Modules =
    [
        new(
            "identity",
            "Users and Profiles",
            "User accounts, participant and trainer profiles, applications, and related records.",
            [
                typeof(User),
                typeof(ParticipantProfile),
                typeof(TrainerProfile),
                typeof(TrainerApplication),
                typeof(TrainerApplicationDocument),
                typeof(TrainerApplicationEducation),
                typeof(TrainerApplicationCertification),
                typeof(TrainerEducation),
                typeof(TrainerCertification),
                typeof(TrainerReportRequest),
                typeof(OtpVerification)
            ]
        ),

        new(
            "services",
            "Service Management",
            "Services, requirements, requests, and consultations.",
            [
                typeof(server.Models.Service.Service),
                typeof(ServiceRequirement),
                typeof(ServiceRequest),
                typeof(ServiceConsultation)
            ]
        ),

        new(
            "training",
            "Training Management",
            "Programs, batches, sessions, enrollments, participation, and certificates.",
            [
                typeof(TrainingProgram),
                typeof(TrainingProgramDocument),
                typeof(TrainingProgramRequirement),
                typeof(TrainingBatch),
                typeof(TrainingSession),
                typeof(TrainerAssignment),
                typeof(server.Models.Participant.Enrollment),
                typeof(EnrollmentDocument),
                typeof(Certificate),
                typeof(ParticipationSetting),
                typeof(ParticipationRecord)
            ]
        ),

        new(
            "assessment",
            "Assessment Management",
            "Written and practical assessments, questions, attempts, answers, results, and retake requests.",
            [
                typeof(WrittenAssessment),
                typeof(AssessmentQuestion),
                typeof(AssessmentChoice),
                typeof(AssessmentAttempt),
                typeof(AssessmentAnswer),
                typeof(AssessmentResult),
                typeof(AssessmentRetakeRequest),
                typeof(PracticalAssessment),
                typeof(PracticalAssessmentCriterion),
                typeof(PracticalAssessmentCriterionScore),
                typeof(PracticalAssessmentResult)
            ]
        ),

        new(
            "attendance",
            "Attendance Management",
            "Attendance sessions and records.",
            [
                typeof(AttendanceSession),
                typeof(AttendanceRecord)
            ]
        ),

        new(
            "learning",
            "Learning Management",
            "Learning materials, modules, files, chunks, sections, and progress.",
            [
                typeof(LearningMaterial),
                typeof(LearningModule),
                typeof(LearningModuleFile),
                typeof(LearningModuleChunk),
                typeof(LearningSection),
                typeof(LearningSectionProgress)
            ]
        ),

        new(
            "system",
            "System Records",
            "Backup metadata.",
            [
                typeof(server.Models.Backup.Backup)
            ]
        )
    ];

    public async Task<IReadOnlyList<RecoveryModuleDto>> GetModulesAsync(
        CancellationToken cancellationToken = default
    )
    {
        var connectionString =
            _configuration.GetConnectionString("RecoveryConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "RecoveryConnection is not configured."
            );
        }

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseNpgsql(connectionString)
            .Options;

        await using var recoveryDb =
            new ApplicationDbContext(options, _cacheService);

        var registeredEntityTypes = recoveryDb.Model
            .GetEntityTypes()
            .Select(entity => entity.ClrType)
            .ToHashSet();

        var results = new List<RecoveryModuleDto>();

        foreach (var module in Modules)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var moduleDto = new RecoveryModuleDto
            {
                Key = module.Key,
                Name = module.Name,
                Description = module.Description
            };

            foreach (var entityType in module.Entities)
            {
                cancellationToken.ThrowIfCancellationRequested();

                if (!registeredEntityTypes.Contains(entityType))
                {
                    throw new InvalidOperationException(
                        $"Recovery entity '{entityType.FullName}' is not registered " +
                        "in ApplicationDbContext. Verify its EF Core mapping."
                    );
                }

                var count = await CountEntityAsync(
                    recoveryDb,
                    entityType,
                    cancellationToken
                );

                moduleDto.Entities.Add(
                    new RecoveryEntityCountDto
                    {
                        EntityName = entityType.Name,
                        RecordCount = count
                    }
                );

                moduleDto.TotalRecords += count;
            }

            results.Add(moduleDto);
        }

        return results;
    }

    private static async Task<int> CountEntityAsync(
        ApplicationDbContext context,
        Type entityType,
        CancellationToken cancellationToken
    )
    {
        var method = typeof(RecoveryCatalogService).GetMethod(
            nameof(CountTypedAsync),
            BindingFlags.NonPublic | BindingFlags.Static
        );

        if (method is null)
        {
            throw new InvalidOperationException(
                "Could not locate the entity count method."
            );
        }

        var genericMethod = method.MakeGenericMethod(entityType);

        var task = genericMethod.Invoke(
            null,
            [
                context,
                cancellationToken
            ]
        ) as Task<int>;

        if (task is null)
        {
            throw new InvalidOperationException(
                $"Could not count records for '{entityType.Name}'."
            );
        }

        return await task;
    }

    private static Task<int> CountTypedAsync<TEntity>(
        ApplicationDbContext context,
        CancellationToken cancellationToken
    )
        where TEntity : class
    {
        return context.Set<TEntity>()
            .AsNoTracking()
            .CountAsync(cancellationToken);
    }
}
