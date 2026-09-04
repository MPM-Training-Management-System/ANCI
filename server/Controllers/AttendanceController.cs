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
        // OPEN ATTENDANCE SESSION
        // Trainer
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
        // CLOSE ATTENDANCE SESSION
        // Trainer
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
        // GET ATTENDANCE SESSION
        // Trainer / Participant / Admin
        // =========================================================

        [HttpGet("sessions/{id:guid}")]
        [Authorize(Roles = "Trainer,Participant,Admin")]
        public async Task<
            ActionResult<IEnumerable<AttendanceRecordDto>>
        > GetSession(Guid id)
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
        // QR works OPEN or CLOSED.
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
        // Trainer can scan even when CLOSED.
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
        // Requires OPEN session.
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
        // CURRENT USER
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

            return Guid.Parse(value);
        }
        // =========================================================
// GET CURRENT OPEN ATTENDANCE SESSION
// Trainer / Participant / Admin
//
// Used by frontend to determine whether
// attendance is currently OPEN.
//
// 200 = OPEN
// 404 = CLOSED / no active session
// =========================================================

[HttpGet("batch/{batchId:guid}/open")]
[Authorize(Roles = "Trainer,Participant,Admin")]
public async Task<IActionResult> GetOpenSession(
    Guid batchId)
{
    var userId =
        GetCurrentUserId();

    var result =
        await _service.GetOpenSessionAsync(
            batchId,
            userId);

    return Ok(result);
}
    }