using server.DTOs.Reports;

namespace server.Interfaces.Reports;

public interface IReportService
{
    Task<AdminReportOverviewDto>
        GetAdminOverviewAsync();

    Task<TrainingCompletionReportDto>
        GetTrainingCompletionReportAsync(
            ReportFilterDto filter);
    Task<EnrollmentReportDto>
        GetEnrollmentReportAsync(
            ReportFilterDto filter);

    Task<AttendanceReportDto>
        GetAttendanceReportAsync(
            ReportFilterDto filter);

    Task<AssessmentResultsReportDto>
        GetAssessmentResultsReportAsync(
            ReportFilterDto filter);

    Task<CertificateReportDto>
        GetCertificateReportAsync(
            ReportFilterDto filter);

    Task<TrainerReportDto>
        GetTrainerReportAsync(
            ReportFilterDto filter);

    Task<ServiceRequestReportDto>
    GetServiceRequestReportAsync(
        ReportFilterDto filter);
}