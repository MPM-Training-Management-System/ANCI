    using server.DTOs.Enrollment;

    namespace server.Services.Interfaces;

    public interface IEnrollmentService
    {
        Task<EnrollmentDto> CreateAsync(
            Guid participantUserId,
            CreateEnrollmentRequest request);

        Task<IEnumerable<EnrollmentDto>> GetMyEnrollmentsAsync(
            Guid participantUserId);

        Task<EnrollmentDto?> GetByIdAsync(
            Guid enrollmentId,
            Guid userId);

        Task<IEnumerable<EnrollmentDto>> GetMyEnrollmentsForTrainerAsync(
        Guid trainerUserId);


        Task ReviewAsync(
            Guid enrollmentId,
            Guid adminUserId,
            ReviewEnrollmentRequest request);

            Task<IEnumerable<EnrollmentDto>>
        GetAllForAdminAsync();
            
    }