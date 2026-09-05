using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using server.DTOs.Attendance;
using server.Interfaces.Attendance;

using System.Security.Claims;

namespace server.Controllers;

[ApiController]
[Route("api/attendance")]
[Authorize]
public class AttendanceController : ControllerBase
{
    private readonly IAttendanceService _service;

    public AttendanceController(
        IAttendanceService service)
    {
        _service = service;
    }

    // =========================================================
    // START / OPEN ATTENDANCE SESSION
    // Trainer
    //
    // Starts the training class/session.
    //
    // Result:
    // Session = OPEN
    // Manual Attendance = CLOSED
    // QR Scanning = ENABLED
    // =========================================================

    [HttpPost("sessions/open")]
    [Authorize(Roles = "Trainer")]
    public async Task<IActionResult> OpenSession(
        OpenAttendanceRequest request)
    {
        var trainerUserId =
            GetCurrentUserId();

        var sessionId =
            await _service.OpenSessionAsync(
                trainerUserId,
                request);

        return Ok(new
        {
            attendanceSessionId = sessionId
        });
    }

    // =========================================================
    // END / CLOSE ATTENDANCE SESSION
    // Trainer
    //
    // Result:
    // Session = CLOSED
    // Manual Attendance = CLOSED
    // QR Scanning = DISABLED
    // =========================================================

    [HttpPost("sessions/{id:guid}/close")]
    [Authorize(Roles = "Trainer")]
    public async Task<IActionResult> CloseSession(
        Guid id)
    {
        var trainerUserId =
            GetCurrentUserId();

        await _service.CloseSessionAsync(
            id,
            trainerUserId);

        return NoContent();
    }

    // =========================================================
    // OPEN MANUAL ATTENDANCE
    // Trainer
    //
    // This is SEPARATE from opening the session.
    //
    // Requirements:
    // Session must already be OPEN.
    //
    // Result:
    // Session = OPEN
    // Manual Attendance = OPEN
    // QR Scanning = ENABLED
    // =========================================================

    [HttpPost("sessions/{id:guid}/manual/open")]
    [Authorize(Roles = "Trainer")]
    public async Task<IActionResult> OpenManualAttendance(
        Guid id)
    {
        var trainerUserId =
            GetCurrentUserId();

        await _service.OpenManualAttendanceAsync(
            id,
            trainerUserId);

        return NoContent();
    }

    // =========================================================
    // CLOSE MANUAL ATTENDANCE
    // Trainer
    //
    // IMPORTANT:
    // Closing manual attendance does NOT close the session.
    //
    // Result:
    // Session = OPEN
    // Manual Attendance = CLOSED
    // QR Scanning = ENABLED
    // =========================================================

    [HttpPost("sessions/{id:guid}/manual/close")]
    [Authorize(Roles = "Trainer")]
    public async Task<IActionResult> CloseManualAttendance(
        Guid id)
    {
        var trainerUserId =
            GetCurrentUserId();

        await _service.CloseManualAttendanceAsync(
            id,
            trainerUserId);

        return NoContent();
    }

    // =========================================================
    // GET ATTENDANCE SESSION
    // Trainer / Participant / Admin
    // =========================================================

    [HttpGet("sessions/{id:guid}")]
    [Authorize(Roles = "Trainer,Participant,Admin")]
    public async Task<
        ActionResult<IEnumerable<AttendanceRecordDto>>
    > GetSession(
        Guid id)
    {
        var userId =
            GetCurrentUserId();

        var result =
            await _service.GetSessionAsync(
                id,
                userId);

        return Ok(result);
    }

    // =========================================================
    // GET ATTENDANCE QR
    // Trainer / Participant
    //
    // Permanent QR.
    //
    // QR can be retrieved whether the session
    // is OPEN or CLOSED.
    //
    // Actual scanning is controlled by session status.
    // =========================================================

    [HttpGet("sessions/{id:guid}/qr")]
    [Authorize(Roles = "Trainer,Participant")]
    public async Task<ActionResult<AttendanceQrDto>> GetQr(
        Guid id,
        [FromQuery] Guid enrollmentId)
    {
        var userId =
            GetCurrentUserId();

        var result =
            await _service.GetQrAsync(
                id,
                enrollmentId,
                userId);

        return Ok(result);
    }

    // =========================================================
    // SCAN ATTENDANCE
    // Trainer
    //
    // Trainer scans participant's PERMANENT QR.
    //
    // Requirement:
    // Session must be OPEN.
    //
    // Manual Attendance status does NOT matter.
    //
    // Example:
    //
    // Session OPEN
    // Manual CLOSED
    //       ↓
    // QR scanning still works.
    // =========================================================

    [HttpPost("scan")]
    [Authorize(Roles = "Trainer")]
    public async Task<IActionResult> ScanAttendance(
        ScanAttendanceRequest request)
    {
        var trainerUserId =
            GetCurrentUserId();

        await _service.ScanAttendanceAsync(
            trainerUserId,
            request);

        return Ok();
    }

    // =========================================================
    // MANUAL ATTENDANCE
    // Participant
    //
    // Requirements:
    // 1. Session must be OPEN
    // 2. Manual Attendance must be OPEN
    //
    // Actions:
    // TimeIn
    // TimeOut
    // =========================================================

    [HttpPost("manual")]
    [Authorize(Roles = "Participant")]
    public async Task<IActionResult> ManualAttendance(
        ManualAttendanceRequest request)
    {
        var participantUserId =
            GetCurrentUserId();

        await _service.ManualAttendanceAsync(
            participantUserId,
            request);

        return Ok();
    }

    // =========================================================
    // GET BATCH ATTENDANCE
    // Trainer / Participant / Admin
    // =========================================================

    [HttpGet("batch/{batchId:guid}")]
    [Authorize(Roles = "Trainer,Participant,Admin")]
    public async Task<
        ActionResult<IEnumerable<AttendanceRecordDto>>
    > GetBatchAttendance(
        Guid batchId)
    {
        var userId =
            GetCurrentUserId();

        var result =
            await _service.GetBatchAttendanceAsync(
                batchId,
                userId);

        return Ok(result);
    }

    // =========================================================
    // GET CURRENT OPEN SESSION
    // Trainer / Participant / Admin
    //
    // Returns:
    //
    // {
    //   isOpen: true/false,
    //   attendanceSessionId: "...",
    //   manualAttendanceOpen: true/false
    // }
    //
    // IMPORTANT:
    // Even if there is no active session,
    // service returns a normal response:
    //
    // {
    //   isOpen: false,
    //   attendanceSessionId: null,
    //   manualAttendanceOpen: false
    // }
    // =========================================================
[HttpGet("batch/{batchId:guid}/open")]
[Authorize(Roles = "Trainer,Participant,Admin")]
public async Task<ActionResult<OpenAttendanceSessionDto>>
    GetOpenSession(
        Guid batchId,
        [FromQuery] Guid trainingSessionId)
{
    var userId =
        GetCurrentUserId();

    var result =
        await _service.GetOpenSessionAsync(
            batchId,
            trainingSessionId,
            userId);

    return Ok(result);
}

    // =========================================================
    // CURRENT USER ID
    // =========================================================

    private Guid GetCurrentUserId()
    {
        var value =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(value))
        {
            throw new UnauthorizedAccessException(
                "User identity is missing.");
        }

        if (!Guid.TryParse(
                value,
                out var userId))
        {
            throw new UnauthorizedAccessException(
                "Invalid user identity.");
        }

        return userId;
    }
}