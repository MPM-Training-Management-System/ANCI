
using System.Linq.Expressions;
using System.Reflection;

using Microsoft.EntityFrameworkCore;

using server.Data;
using server.DTOs.Admin.Recovery;
using server.Interfaces;
using server.Services.Interfaces;

namespace server.Services;

public sealed class RecoveryRecordSearchService
    : IRecoveryRecordSearchService
{
    private readonly IConfiguration _configuration;
    private readonly ICacheService _cacheService;

    private static readonly IReadOnlyDictionary<string, Type[]> ModuleEntities =
        new Dictionary<string, Type[]>(StringComparer.OrdinalIgnoreCase)
        {
            ["identity"] =
            [
                typeof(server.Models.Auth.User),
                typeof(server.Models.Participant.ParticipantProfile),
                typeof(server.Models.Trainer.TrainerProfile),
                typeof(server.Models.Trainer.TrainerApplication),
                typeof(server.Models.Trainer.TrainerApplicationDocument),
                typeof(server.Models.Trainer.TrainerApplicationEducation),
                typeof(server.Models.Trainer.TrainerApplicationCertification),
                typeof(server.Models.Trainer.TrainerEducation),
                typeof(server.Models.Trainer.TrainerCertification),
                typeof(server.Models.Trainer.TrainerReportRequest),
                typeof(server.Models.Otp.OtpVerification)
            ],

            ["services"] =
            [
                typeof(server.Models.Service.Service),
                typeof(server.Models.Service.ServiceRequirement),
                typeof(server.Models.Service.ServiceRequest),
                typeof(server.Models.Service.ServiceConsultation)
            ],

            ["training"] =
            [
                typeof(server.Models.Training.TrainingProgram),
                typeof(server.Models.Training.TrainingProgramDocument),
                typeof(server.Models.Training.TrainingProgramRequirement),
                typeof(server.Models.Training.TrainingBatch),
                typeof(server.Models.Training.TrainingSession),
                typeof(server.Models.Trainer.TrainerAssignment),
                typeof(server.Models.Participant.Enrollment),
                typeof(server.Models.Participant.EnrollmentDocument),
                typeof(server.Models.Training.Certificate),
                typeof(server.Models.Training.ParticipationSetting),
                typeof(server.Models.Training.ParticipationRecord)
            ],

            ["assessment"] =
            [
                typeof(server.Models.Assessment.WrittenAssessment),
                typeof(server.Models.Assessment.AssessmentQuestion),
                typeof(server.Models.Assessment.AssessmentChoice),
                typeof(server.Models.Assessment.AssessmentAttempt),
                typeof(server.Models.Assessment.AssessmentAnswer),
                typeof(server.Models.Assessment.AssessmentResult),
                typeof(server.Models.Assessment.AssessmentRetakeRequest),
                typeof(server.Models.Assessment.PracticalAssessment),
                typeof(server.Models.Assessment.PracticalAssessmentCriterion),
                typeof(server.Models.Assessment.PracticalAssessmentCriterionScore),
                typeof(server.Models.Assessment.PracticalAssessmentResult)
            ],

            ["attendance"] =
            [
                typeof(server.Models.Attendance.AttendanceSession),
                typeof(server.Models.Attendance.AttendanceRecord)
            ],

            ["learning"] =
            [
                typeof(server.Models.Learning.LearningMaterial),
                typeof(server.Models.Learning.LearningModule),
                typeof(server.Models.Learning.LearningModuleFile),
                typeof(server.Models.Learning.LearningModuleChunk),
                typeof(server.Models.Learning.LearningSection),
                typeof(server.Models.Learning.LearningSectionProgress)
            ],

            ["system"] =
            [
                typeof(server.Models.Backup.Backup)
            ]
        };

    private static readonly HashSet<string> SensitivePropertyNames =
        new(StringComparer.OrdinalIgnoreCase)
        {
            "Password",
            "PasswordHash",
            "PasswordSalt",
            "Token",
            "AccessToken",
            "RefreshToken",
            "GoogleIdToken",
            "GoogleSubjectId",
            "Secret",
            "SecretKey",
            "ApiKey",
            "Otp",
            "OtpCode",
            "VerificationToken",
            "ResetToken",
            "SecurityStamp"
        };

    private static readonly HashSet<string> PreferredLabelNames =
        new(StringComparer.OrdinalIgnoreCase)
        {
            "FullName",
            "Name",
            "Title",
            "Email",
            "UserCode",
            "ProgramCode",
            "BatchCode",
            "ServiceCode",
            "CertificateNumber"
        };

    public RecoveryRecordSearchService(
        IConfiguration configuration,
        ICacheService cacheService
    )
    {
        _configuration = configuration;
        _cacheService = cacheService;
    }

    public async Task<RecoveryRecordSearchResultDto> SearchAsync(
        string module,
        string entityName,
        string? search,
        int page = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default
    )
    {
        if (string.IsNullOrWhiteSpace(module))
        {
            throw new ArgumentException(
                "A recovery module is required.",
                nameof(module)
            );
        }

        if (string.IsNullOrWhiteSpace(entityName))
        {
            throw new ArgumentException(
                "An entity name is required.",
                nameof(entityName)
            );
        }

        if (page < 1)
        {
            throw new ArgumentOutOfRangeException(
                nameof(page),
                "Page must be at least 1."
            );
        }

        if (pageSize < 1 || pageSize > 100)
        {
            throw new ArgumentOutOfRangeException(
                nameof(pageSize),
                "Page size must be between 1 and 100."
            );
        }

        if (!ModuleEntities.TryGetValue(module, out var allowedEntities))
        {
            throw new ArgumentException(
                $"Unknown recovery module '{module}'.",
                nameof(module)
            );
        }

        var entityType = allowedEntities.FirstOrDefault(type =>
            string.Equals(
                type.Name,
                entityName,
                StringComparison.OrdinalIgnoreCase
            ) ||
            string.Equals(
                type.FullName,
                entityName,
                StringComparison.OrdinalIgnoreCase
            )
        );

        if (entityType is null)
        {
            throw new ArgumentException(
                $"Entity '{entityName}' is not available in module '{module}'.",
                nameof(entityName)
            );
        }

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

        var efEntityType = recoveryDb.Model.FindEntityType(entityType);

        if (efEntityType is null)
        {
            throw new InvalidOperationException(
                $"Entity '{entityType.Name}' is not registered in EF Core."
            );
        }

        if (efEntityType.FindPrimaryKey() is null)
        {
            throw new InvalidOperationException(
                $"Entity '{entityType.Name}' does not have a primary key."
            );
        }

        var method = typeof(RecoveryRecordSearchService).GetMethod(
            nameof(SearchTypedAsync),
            BindingFlags.Instance | BindingFlags.NonPublic
        );

        if (method is null)
        {
            throw new InvalidOperationException(
                "Could not locate the record search method."
            );
        }

        var genericMethod = method.MakeGenericMethod(entityType);

        var task = genericMethod.Invoke(
            this,
            [
                recoveryDb,
                module,
                entityName,
                search,
                page,
                pageSize,
                cancellationToken
            ]
        ) as Task<RecoveryRecordSearchResultDto>;

        if (task is null)
        {
            throw new InvalidOperationException(
                "Could not execute the record search."
            );
        }

        return await task;
    }

    private async Task<RecoveryRecordSearchResultDto> SearchTypedAsync<TEntity>(
        ApplicationDbContext context,
        string module,
        string entityName,
        string? search,
        int page,
        int pageSize,
        CancellationToken cancellationToken
    )
        where TEntity : class
    {
        var efEntityType = context.Model.FindEntityType(typeof(TEntity))
            ?? throw new InvalidOperationException(
                $"Entity '{typeof(TEntity).Name}' is not registered."
            );

        var primaryKey = efEntityType.FindPrimaryKey()
            ?? throw new InvalidOperationException(
                $"Entity '{typeof(TEntity).Name}' has no primary key."
            );

        if (primaryKey.Properties.Count != 1)
        {
            throw new InvalidOperationException(
                $"Entity '{typeof(TEntity).Name}' has a composite primary key. " +
                "This search implementation requires an explicit key formatter."
            );
        }

        var keyName = primaryKey.Properties[0].Name;

        IQueryable<TEntity> query = context.Set<TEntity>()
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchableProperties = efEntityType.GetProperties()
                .Where(property =>
                    property.ClrType == typeof(string) &&
                    !SensitivePropertyNames.Contains(property.Name))
                .ToArray();

            if (searchableProperties.Length > 0)
            {
                var parameter = Expression.Parameter(typeof(TEntity), "entity");
                Expression? combined = null;

                var efPropertyMethod = typeof(EF)
                    .GetMethods(BindingFlags.Public | BindingFlags.Static)
                    .Single(method =>
                        method.Name == nameof(EF.Property) &&
                        method.IsGenericMethodDefinition &&
                        method.GetParameters().Length == 2)
                    .MakeGenericMethod(typeof(string));

                var containsMethod = typeof(string).GetMethod(
                    nameof(string.Contains),
                    [typeof(string)]
                )!;

                foreach (var property in searchableProperties)
                {
                    var propertyExpression = Expression.Call(
                        efPropertyMethod,
                        parameter,
                        Expression.Constant(property.Name)
                    );

                    var notNull = Expression.NotEqual(
                        propertyExpression,
                        Expression.Constant(null, typeof(string))
                    );

                    var contains = Expression.Call(
                        propertyExpression,
                        containsMethod,
                        Expression.Constant(search.Trim())
                    );

                    var condition = Expression.AndAlso(notNull, contains);

                    combined = combined is null
                        ? condition
                        : Expression.OrElse(combined, condition);
                }

                if (combined is not null)
                {
                    var predicate = Expression.Lambda<Func<TEntity, bool>>(
                        combined,
                        parameter
                    );

                    query = query.Where(predicate);
                }
            }
        }

        var totalRecords = await query.CountAsync(cancellationToken);

        query = query.OrderBy(entity =>
            EF.Property<object>(entity, keyName));

        var entities = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var records = new List<RecoveryRecordListItemDto>(entities.Count);

        foreach (var entity in entities)
        {
            var keyValue = context.Entry(entity)
                .Property(keyName)
                .CurrentValue;

            var recordId = keyValue?.ToString() ?? string.Empty;

            var safeStringProperties = efEntityType.GetProperties()
                .Where(property =>
                    property.ClrType == typeof(string) &&
                    !SensitivePropertyNames.Contains(property.Name))
                .ToArray();

            string? ReadString(string propertyName)
            {
                var property = safeStringProperties.FirstOrDefault(item =>
                    string.Equals(
                        item.Name,
                        propertyName,
                        StringComparison.OrdinalIgnoreCase
                    )
                );

                if (property is null)
                {
                    return null;
                }

                return context.Entry(entity)
                    .Property(property.Name)
                    .CurrentValue as string;
            }

            var labelProperty = safeStringProperties.FirstOrDefault(property =>
                PreferredLabelNames.Contains(property.Name) &&
                !string.IsNullOrWhiteSpace(ReadString(property.Name))
            );

            var displayLabel = labelProperty is not null
                ? ReadString(labelProperty.Name)!
                : $"{typeof(TEntity).Name} {recordId}";

            var secondaryLabel =
                ReadString("Email") ??
                ReadString("UserCode") ??
                ReadString("ProgramCode") ??
                ReadString("BatchCode") ??
                ReadString("ServiceCode") ??
                ReadString("Status");

            records.Add(
                new RecoveryRecordListItemDto
                {
                    EntityName = typeof(TEntity).Name,
                    RecordId = recordId,
                    DisplayLabel = displayLabel,
                    SecondaryLabel = secondaryLabel
                }
            );
        }

        return new RecoveryRecordSearchResultDto
        {
            Module = module,
            EntityName = entityName,
            Page = page,
            PageSize = pageSize,
            TotalRecords = totalRecords,
            TotalPages = (int)Math.Ceiling(
                totalRecords / (double)pageSize
            ),
            Records = records
        };
    }
}
