using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using server.DTOs.Reports;
using server.Interfaces.Reports;

namespace server.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    // =====================================================
    // ADMIN
    // =====================================================

    [HttpGet("admin/overview")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<AdminReportOverviewDto>>
        GetAdminOverview()
    {
        var result =
            await _reportService.GetAdminOverviewAsync();

        return Ok(result);
    }

    [HttpGet("admin/training-completion")]
[Authorize(Roles = "Admin")]
public async Task<ActionResult<TrainingCompletionReportDto>>
    GetTrainingCompletionReport(
        [FromQuery] ReportFilterDto filter)
{
    var result =
        await _reportService
            .GetTrainingCompletionReportAsync(filter);

    return Ok(result);
}
[HttpGet("admin/enrollments")]
[Authorize(Roles = "Admin")]
public async Task<ActionResult<EnrollmentReportDto>>
    GetEnrollmentReport(
        [FromQuery] ReportFilterDto filter)
{
    var result =
        await _reportService
            .GetEnrollmentReportAsync(filter);

    return Ok(result);
}
    // =========================================================
    // ATTENDANCE
    // =========================================================

    [HttpGet("admin/attendance")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<AttendanceReportDto>>
        GetAttendanceReport(
            [FromQuery] ReportFilterDto filter)
    {
        var result =
            await _reportService
                .GetAttendanceReportAsync(
                    filter);

        return Ok(result);
    }
        [HttpGet("admin/assessment-results")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<AssessmentResultsReportDto>>
        GetAssessmentResultsReport(
            [FromQuery] ReportFilterDto filter)
    {
        var result =
            await _reportService
                .GetAssessmentResultsReportAsync(filter);

        return Ok(result);
    }
        [HttpGet("admin/certificates")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<CertificateReportDto>>
        GetCertificateReport(
            [FromQuery] ReportFilterDto filter)
    {
        var result =
            await _reportService
                .GetCertificateReportAsync(filter);

        return Ok(result);
    }
        [HttpGet("admin/trainers")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<TrainerReportDto>>
        GetTrainerReport(
            [FromQuery] ReportFilterDto filter)
    {
        var result =
            await _reportService
                .GetTrainerReportAsync(filter);

        return Ok(result);
    }
    [HttpGet("admin/service-requests")]
[Authorize(Roles = "Admin")]
public async Task<ActionResult<ServiceRequestReportDto>>
    GetServiceRequestReport(
        [FromQuery] ReportFilterDto filter)
{
    var result =
        await _reportService
            .GetServiceRequestReportAsync(filter);

    return Ok(result);
}
}