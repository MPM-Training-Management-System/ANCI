using System.Net;
using server.Settings;
using server.DTOs.Email;
using server.Enums;
using server.Models.Service;

namespace server.Services.Email;

public class ServiceEmailService : IServiceEmailService
{
    private readonly IEmailService _emailService;
    private readonly EmailSettings _emailSettings;

    public ServiceEmailService(
        IEmailService emailService,
        EmailSettings emailSettings
    )
    {
        _emailService = emailService;
        _emailSettings = emailSettings;
    }

    // =========================================================
    // SERVICE REQUEST SUBMITTED
    // =========================================================

    public async Task SendRequestSubmittedAsync(
        ServiceRequest request
    )
    {
        var applicantName =
            WebUtility.HtmlEncode(
                request.ApplicantName
            );

        var serviceName =
            WebUtility.HtmlEncode(
                request.Service?.Name
                ?? "Requested Service"
            );

        var remarksHtml =
            string.IsNullOrWhiteSpace(
                request.Remarks
            )
                ? ""
                : $"""
                    <div style="
                        margin-top:24px;
                        padding:16px;
                        border-radius:10px;
                        background:#f8fafc;
                        border:1px solid #e5e7eb;
                    ">
                        <div style="
                            font-size:12px;
                            font-weight:700;
                            color:#6b7280;
                            text-transform:uppercase;
                            letter-spacing:.06em;
                            margin-bottom:8px;
                        ">
                            Your Remarks
                        </div>

                        <div style="
                            font-size:14px;
                            line-height:1.6;
                            color:#374151;
                        ">
                            {WebUtility.HtmlEncode(request.Remarks)}
                        </div>
                    </div>
                  """;

        var content = $"""
            <p>
                Thank you for submitting your service request
                to <strong>ACE NextGen Consultancy Inc.</strong>.
            </p>

            <p>
                We have successfully received your request for:
            </p>

            {BuildInfoCard(
                "SERVICE REQUEST",
                $"""
                <strong>{serviceName}</strong>
                <br />
                <span style="color:#6b7280;">
                    Status:
                    <strong style="color:#d97706;">
                        Pending
                    </strong>
                </span>
                """
            )}

            {remarksHtml}

            <p style="margin-top:24px;">
                Our team will review your request and notify you
                once there is an update.
            </p>

            <p>
                Please keep this email for your reference.
            </p>
            """;

        await SendBrandedEmailAsync(
            request.ApplicantEmail,
            "ANCI Service Request Received",
            "Service Request Received",
            "Thank you for contacting ACE NextGen.",
            applicantName,
            content,
            "#d97706"
        );
    }

    // =========================================================
    // SERVICE REQUEST STATUS CHANGED
    // =========================================================

    public async Task SendRequestStatusChangedAsync(
        ServiceRequest request,
        ServiceRequestStatus previousStatus
    )
    {
        var currentStatus =
            request.Status;

        if (
            previousStatus ==
            currentStatus
        )
        {
            return;
        }

        // -----------------------------------------------------
        // TRAINING APPROVAL
        // -----------------------------------------------------

        if (
            currentStatus ==
            ServiceRequestStatus.Approved
            &&
            request.ResolutionType ==
            ServiceRequestResolutionType.Training
        )
        {
            await SendTrainingApprovalAsync(
                request
            );

            return;
        }

        var applicantName =
            WebUtility.HtmlEncode(
                request.ApplicantName
            );

        var serviceName =
            WebUtility.HtmlEncode(
                request.Service?.Name
                ?? "Requested Service"
            );

        var statusText =
            currentStatus.ToString();

        var statusColor =
            GetStatusColor(
                currentStatus
            );

        var remarksHtml =
            string.IsNullOrWhiteSpace(
                request.AdminRemarks
            )
                ? ""
                : $"""
                    <div style="
                        margin-top:24px;
                        padding:16px;
                        border-radius:10px;
                        background:#f8fafc;
                        border:1px solid #e5e7eb;
                    ">
                        <div style="
                            font-size:12px;
                            font-weight:700;
                            color:#6b7280;
                            text-transform:uppercase;
                            letter-spacing:.06em;
                            margin-bottom:8px;
                        ">
                            Admin Remarks
                        </div>

                        <div style="
                            font-size:14px;
                            line-height:1.6;
                            color:#374151;
                        ">
                            {
                                WebUtility.HtmlEncode(
                                    request.AdminRemarks
                                )
                            }
                        </div>
                    </div>
                  """;

        var content = $"""
            <p>
                There is an update regarding your service request
                for <strong>{serviceName}</strong>.
            </p>

            {BuildInfoCard(
                "REQUEST STATUS",
                $"""
                <div style="
                    font-size:20px;
                    font-weight:700;
                    color:{statusColor};
                ">
                    {statusText}
                </div>
                """
            )}

            {remarksHtml}

            <p style="margin-top:24px;">
                We will provide additional information if further
                action is required from you.
            </p>
            """;

        await SendBrandedEmailAsync(
            request.ApplicantEmail,
            $"ANCI Service Request {statusText}",
            "Service Request Update",
            "Your service request has been updated.",
            applicantName,
            content,
            statusColor
        );
    }

    // =========================================================
    // TRAINING APPROVAL
    // =========================================================

    public async Task SendTrainingApprovalAsync(
        ServiceRequest request
    )
    {
        var applicantName =
            WebUtility.HtmlEncode(
                request.ApplicantName
            );

        var applicantEmail =
            WebUtility.HtmlEncode(
                request.ApplicantEmail
            );

        var serviceName =
            WebUtility.HtmlEncode(
                request.Service?.Name
                ?? "Training Service"
            );

        var appDownloadUrl =
            WebUtility.HtmlEncode(
                _emailSettings.AppDownloadUrl
            );

        var remarksHtml =
            string.IsNullOrWhiteSpace(
                request.AdminRemarks
            )
                ? ""
                : $"""
                    <div style="
                        margin-top:24px;
                        padding:16px;
                        border-radius:12px;
                        background:#f8fafc;
                        border:1px solid #e5e7eb;
                    ">
                        <div style="
                            font-size:11px;
                            font-weight:700;
                            color:#6b7280;
                            text-transform:uppercase;
                            letter-spacing:.08em;
                            margin-bottom:8px;
                        ">
                            Additional Information
                        </div>

                        <div style="
                            font-size:13px;
                            line-height:1.7;
                            color:#374151;
                        ">
                            {
                                WebUtility.HtmlEncode(
                                    request.AdminRemarks
                                )
                            }
                        </div>
                    </div>
                  """;

        var content = $"""
            <!-- INTRODUCTION -->

            <p style="
                margin:0 0 14px;
                font-size:15px;
                line-height:1.7;
                color:#374151;
            ">
                Good news!
                Your service request for
                <strong>{serviceName}</strong>
                has been
                <strong style="color:#166534;">
                    approved for training.
                </strong>
            </p>

            <p style="
                margin:0 0 22px;
                font-size:14px;
                line-height:1.7;
                color:#4b5563;
            ">
                To continue with your training enrollment,
                please follow the steps below carefully.
            </p>

            <!-- APPROVAL CARD -->

            <div style="
                margin:24px 0;
                padding:22px;
                border-radius:14px;
                background:#f0fdf4;
                border:1px solid #bbf7d0;
            ">
                <div style="
                    font-size:11px;
                    font-weight:700;
                    color:#166534;
                    text-transform:uppercase;
                    letter-spacing:.1em;
                    margin-bottom:8px;
                ">
                    Training Approved
                </div>

                <div style="
                    font-size:19px;
                    font-weight:700;
                    color:#14532d;
                    line-height:1.4;
                ">
                    {serviceName}
                </div>

                <div style="
                    margin-top:8px;
                    font-size:12px;
                    color:#166534;
                ">
                    You may now proceed with mobile app enrollment.
                </div>
            </div>

            <!-- IMPORTANT EMAIL NOTICE -->

            <div style="
                margin:24px 0;
                padding:18px 20px;
                border-radius:12px;
                background:#eff6ff;
                border:1px solid #bfdbfe;
            ">
                <div style="
                    font-size:12px;
                    font-weight:700;
                    color:#1d4ed8;
                    text-transform:uppercase;
                    letter-spacing:.08em;
                    margin-bottom:8px;
                ">
                    Important
                </div>

                <div style="
                    font-size:13px;
                    line-height:1.7;
                    color:#1e40af;
                ">
                    Please use the same email address you provided
                    when submitting your service request:
                </div>

                <div style="
                    margin-top:10px;
                    padding:11px 13px;
                    background:#ffffff;
                    border:1px solid #dbeafe;
                    border-radius:8px;
                    font-size:14px;
                    font-weight:700;
                    color:#1e3a8a;
                    word-break:break-word;
                ">
                    {applicantEmail}
                </div>
            </div>

            <!-- DOWNLOAD APP -->

            {BuildDownloadAppCard(
                appDownloadUrl
            )}

            <!-- STEP BY STEP -->

            {BuildTrainingStepsCard(
                serviceName,
                applicantEmail
            )}

            <!-- REMINDER -->

            <div style="
                margin-top:24px;
                padding:18px 20px;
                border-radius:12px;
                background:#fffbeb;
                border:1px solid #fde68a;
            ">
                <div style="
                    font-size:12px;
                    font-weight:700;
                    color:#92400e;
                    margin-bottom:7px;
                ">
                    Please remember
                </div>

                <div style="
                    font-size:13px;
                    line-height:1.7;
                    color:#78350f;
                ">
                    Your service request approval does not
                    automatically enroll you in the training.
                    You must complete the enrollment process
                    through the ANCI mobile application.
                </div>
            </div>

            {remarksHtml}

            <p style="
                margin-top:26px;
                font-size:13px;
                line-height:1.7;
                color:#6b7280;
            ">
                After submitting your enrollment, please wait for
                ANCI to confirm your enrollment and provide your
                training schedule.
            </p>
            """;

        await SendBrandedEmailAsync(
            request.ApplicantEmail,
            "ANCI Training Request Approved",
            "Training Request Approved",
            "Your training service request has been approved.",
            applicantName,
            content,
            "#166534"
        );
    }

    // =========================================================
    // CONSULTATION SCHEDULED
    // =========================================================

    public async Task SendConsultationScheduledAsync(
        ServiceRequest request,
        ServiceConsultation consultation
    )
    {
        var applicantName =
            WebUtility.HtmlEncode(
                request.ApplicantName
            );

        var serviceName =
            WebUtility.HtmlEncode(
                request.Service?.Name
                ?? "Consultation Service"
            );

        var meetingLink =
            WebUtility.HtmlEncode(
                consultation.MeetingLink
            );

        var notesHtml =
            BuildNotes(
                consultation.Notes
            );

        var content = $"""
            <p>
                Your consultation request for
                <strong>{serviceName}</strong>
                has been successfully scheduled.
            </p>

            {BuildConsultationCard(
                serviceName,
                consultation
            )}

            {BuildMeetingButton(
                meetingLink
            )}

            {notesHtml}

            <p style="margin-top:24px;">
                Please make sure you are available at the
                scheduled time and use the meeting link above
                to join the consultation.
            </p>
            """;

        await SendBrandedEmailAsync(
            request.ApplicantEmail,
            "ANCI Consultation Scheduled",
            "Consultation Scheduled",
            "Your consultation has been scheduled.",
            applicantName,
            content,
            "#2563eb"
        );
    }

    // =========================================================
    // CONSULTATION STATUS CHANGED
    // =========================================================

    public async Task SendConsultationStatusChangedAsync(
        ServiceRequest request,
        ServiceConsultation consultation,
        ServiceConsultationStatus previousStatus
    )
    {
        var currentStatus =
            consultation.Status;

        if (
            previousStatus ==
            currentStatus
        )
        {
            return;
        }

        var applicantName =
            WebUtility.HtmlEncode(
                request.ApplicantName
            );

        var serviceName =
            WebUtility.HtmlEncode(
                request.Service?.Name
                ?? "Consultation Service"
            );

        var meetingLink =
            WebUtility.HtmlEncode(
                consultation.MeetingLink
            );

        var notesHtml =
            BuildNotes(
                consultation.Notes
            );

        string subject;
        string title;
        string subtitle;
        string message;
        string color;

        switch (currentStatus)
        {
            // =================================================
            // SCHEDULED
            // =================================================

            case ServiceConsultationStatus.Scheduled:

                subject =
                    "ANCI Consultation Schedule Updated";

                title =
                    "Consultation Schedule Updated";

                subtitle =
                    "Your consultation details have been updated.";

                color =
                    "#2563eb";

                message = $"""
                    <p>
                        Your consultation for
                        <strong>{serviceName}</strong>
                        has been updated.
                    </p>

                    {BuildConsultationCard(
                        serviceName,
                        consultation
                    )}

                    {BuildMeetingButton(
                        meetingLink
                    )}

                    {notesHtml}
                    """;

                break;

            // =================================================
            // IN PROGRESS
            // =================================================

            case ServiceConsultationStatus.InProgress:

                subject =
                    "ANCI Consultation In Progress";

                title =
                    "Consultation In Progress";

                subtitle =
                    "Your consultation is currently in progress.";

                color =
                    "#7c3aed";

                message = $"""
                    <p>
                        Your consultation for
                        <strong>{serviceName}</strong>
                        is now
                        <strong style="color:#7c3aed;">
                            in progress
                        </strong>.
                    </p>

                    <div style="
                        margin:24px 0;
                        padding:18px;
                        border-radius:12px;
                        background:#f5f3ff;
                        border:1px solid #ddd6fe;
                    ">
                        <div style="
                            font-size:13px;
                            font-weight:700;
                            color:#6d28d9;
                        ">
                            Join your consultation
                        </div>

                        <p style="
                            margin:6px 0 0;
                            font-size:13px;
                            color:#5b21b6;
                        ">
                            If you have not yet joined,
                            use the button below.
                        </p>
                    </div>

                    {BuildMeetingButton(
                        meetingLink
                    )}

                    {notesHtml}
                    """;

                break;

            // =================================================
            // COMPLETED
            // =================================================

            case ServiceConsultationStatus.Completed:

                subject =
                    "ANCI Consultation Completed";

                title =
                    "Consultation Completed";

                subtitle =
                    "Your consultation has been completed.";

                color =
                    "#166534";

                message = $"""
                    <p>
                        Your consultation for
                        <strong>{serviceName}</strong>
                        has been
                        <strong style="color:#166534;">
                            completed
                        </strong>.
                    </p>

                    <div style="
                        margin:24px 0;
                        padding:18px;
                        border-radius:12px;
                        background:#f0fdf4;
                        border:1px solid #bbf7d0;
                    ">
                        <div style="
                            font-size:13px;
                            font-weight:700;
                            color:#166534;
                        ">
                            Thank you
                        </div>

                        <p style="
                            margin:6px 0 0;
                            font-size:13px;
                            line-height:1.6;
                            color:#365314;
                        ">
                            Thank you for attending the consultation
                            with ACE NextGen Consultancy Inc.
                        </p>
                    </div>

                    {notesHtml}
                    """;

                break;

            // =================================================
            // CANCELLED
            // =================================================

            case ServiceConsultationStatus.Cancelled:

                subject =
                    "ANCI Consultation Cancelled";

                title =
                    "Consultation Cancelled";

                subtitle =
                    "Your consultation has been cancelled.";

                color =
                    "#dc2626";

                message = $"""
                    <p>
                        Your consultation for
                        <strong>{serviceName}</strong>
                        has been
                        <strong style="color:#dc2626;">
                            cancelled
                        </strong>.
                    </p>

                    <div style="
                        margin:24px 0;
                        padding:18px;
                        border-radius:12px;
                        background:#fef2f2;
                        border:1px solid #fecaca;
                    ">
                        <div style="
                            font-size:13px;
                            font-weight:700;
                            color:#b91c1c;
                        ">
                            Consultation Cancelled
                        </div>

                        <p style="
                            margin:6px 0 0;
                            font-size:13px;
                            line-height:1.6;
                            color:#7f1d1d;
                        ">
                            If you have questions regarding the
                            cancellation, please contact
                            ACE NextGen Consultancy Inc.
                        </p>
                    </div>

                    {notesHtml}
                    """;

                break;

            default:
                return;
        }

        await SendBrandedEmailAsync(
            request.ApplicantEmail,
            subject,
            title,
            subtitle,
            applicantName,
            message,
            color
        );
    }

    // =========================================================
    // BRANDED EMAIL WRAPPER
    // =========================================================

    private async Task SendBrandedEmailAsync(
        string recipientEmail,
        string subject,
        string title,
        string subtitle,
        string applicantName,
        string content,
        string accentColor
    )
    {
        var logoUrl =
            WebUtility.HtmlEncode(
                _emailSettings.LogoUrl
            );

        var body = $"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8" />

                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />

                <title>
                    {WebUtility.HtmlEncode(subject)}
                </title>
            </head>

            <body style="
                margin:0;
                padding:0;
                background:#f4f6f8;
                font-family:Arial, Helvetica, sans-serif;
                color:#1f2937;
            ">

                <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="
                        background:#f4f6f8;
                        padding:40px 16px;
                    "
                >
                    <tr>
                        <td align="center">

                            <table
                                width="100%"
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                                style="
                                    max-width:620px;
                                    background:#ffffff;
                                    border-radius:16px;
                                    overflow:hidden;
                                    border:1px solid #e5e7eb;
                                    box-shadow:
                                        0 8px 30px
                                        rgba(0,0,0,.06);
                                "
                            >

                                <!-- ==========================
                                     HEADER
                                =========================== -->

                                <tr>
                                    <td
                                        align="center"
                                        style="
                                            padding:30px 30px 24px;
                                            background:#ffffff;
                                            border-bottom:
                                                1px solid #f1f5f9;
                                        "
                                    >

                                        {
                                            BuildLogo(
                                                logoUrl
                                            )
                                        }

                                        <div style="
                                            margin-top:12px;
                                            font-size:16px;
                                            font-weight:700;
                                            color:#111827;
                                            letter-spacing:.01em;
                                        ">
                                            ACE NextGen Consultancy Inc.
                                        </div>

                                        <div style="
                                            margin-top:4px;
                                            font-size:10px;
                                            font-weight:700;
                                            color:#9ca3af;
                                            text-transform:uppercase;
                                            letter-spacing:.14em;
                                        ">
                                            Professional Services &amp;
                                            Training
                                        </div>

                                    </td>
                                </tr>

                                <!-- ==========================
                                     ACCENT
                                =========================== -->

                                <tr>
                                    <td style="
                                        height:4px;
                                        background:{accentColor};
                                        font-size:0;
                                        line-height:0;
                                    ">
                                    </td>
                                </tr>

                                <!-- ==========================
                                     CONTENT
                                =========================== -->

                                <tr>
                                    <td
                                        style="
                                            padding:34px 34px 30px;
                                        "
                                    >

                                        <div style="
                                            font-size:11px;
                                            font-weight:700;
                                            color:{accentColor};
                                            text-transform:uppercase;
                                            letter-spacing:.12em;
                                            margin-bottom:8px;
                                        ">
                                            {
                                                WebUtility.HtmlEncode(
                                                    subtitle
                                                )
                                            }
                                        </div>

                                        <h1 style="
                                            margin:0;
                                            font-size:25px;
                                            line-height:1.25;
                                            color:#111827;
                                        ">
                                            {
                                                WebUtility.HtmlEncode(
                                                    title
                                                )
                                            }
                                        </h1>

                                        <p style="
                                            margin:22px 0 20px;
                                            font-size:14px;
                                            color:#374151;
                                        ">
                                            Dear
                                            <strong>
                                                {applicantName}
                                            </strong>,
                                        </p>

                                        <div style="
                                            font-size:14px;
                                            line-height:1.75;
                                            color:#4b5563;
                                        ">
                                            {content}
                                        </div>

                                        <!-- ==========================
                                             SIGNATURE
                                        =========================== -->

                                        <div style="
                                            margin-top:32px;
                                            padding-top:22px;
                                            border-top:
                                                1px solid #f1f5f9;
                                        ">

                                            <p style="
                                                margin:0;
                                                font-size:13px;
                                                color:#6b7280;
                                            ">
                                                Best regards,
                                            </p>

                                            <p style="
                                                margin:5px 0 0;
                                                font-size:14px;
                                                font-weight:700;
                                                color:#111827;
                                            ">
                                                ACE NextGen Consultancy Inc.
                                            </p>

                                        </div>

                                    </td>
                                </tr>

                                <!-- ==========================
                                     FOOTER
                                =========================== -->

                                <tr>
                                    <td
                                        align="center"
                                        style="
                                            padding:22px 30px;
                                            background:#f8fafc;
                                            border-top:
                                                1px solid #f1f5f9;
                                        "
                                    >

                                        <div style="
                                            font-size:11px;
                                            color:#9ca3af;
                                            line-height:1.6;
                                        ">
                                            This is an automated message
                                            from ACE NextGen Consultancy Inc.
                                        </div>

                                        <div style="
                                            margin-top:5px;
                                            font-size:10px;
                                            color:#c0c5cc;
                                        ">
                                            Please do not reply directly
                                            to this email.
                                        </div>

                                    </td>
                                </tr>

                            </table>

                        </td>
                    </tr>
                </table>

            </body>
            </html>
            """;

        await _emailService.SendAsync(
            new SendEmailDto
            {
                ToEmail =
                    recipientEmail,

                Subject =
                    subject,

                Body =
                    body,

                IsHtml =
                    true
            }
        );
    }

    // =========================================================
    // LOGO
    // =========================================================

    private static string BuildLogo(
        string logoUrl
    )
    {
        if (
            string.IsNullOrWhiteSpace(
                logoUrl
            )
        )
        {
            return """
                <div style="
                    display:inline-block;
                    width:72px;
                    height:72px;
                    border-radius:16px;
                    background:#111827;
                    color:#ffffff;
                    font-size:18px;
                    font-weight:800;
                    line-height:72px;
                    text-align:center;
                ">
                    ACE
                </div>
                """;
        }

        return $"""
            <img
                src="{logoUrl}"
                alt="ACE NextGen Consultancy Inc."
                width="72"
                height="72"
                style="
                    display:block;
                    width:72px;
                    height:72px;
                    object-fit:contain;
                    border:0;
                    outline:none;
                    text-decoration:none;
                "
            />
            """;
    }

    // =========================================================
    // DOWNLOAD APP CARD
    // =========================================================

    private static string BuildDownloadAppCard(
        string appDownloadUrl
    )
    {
        if (
            string.IsNullOrWhiteSpace(
                appDownloadUrl
            )
        )
        {
            return """
                <div style="
                    margin:24px 0;
                    padding:22px;
                    border-radius:14px;
                    background:#f8fafc;
                    border:1px solid #e5e7eb;
                ">
                    <div style="
                        font-size:12px;
                        font-weight:700;
                        color:#111827;
                        text-transform:uppercase;
                        letter-spacing:.08em;
                        margin-bottom:8px;
                    ">
                        ANCI Mobile Application
                    </div>

                    <p style="
                        margin:0;
                        font-size:13px;
                        line-height:1.6;
                        color:#6b7280;
                    ">
                        The mobile application download link
                        is currently unavailable.
                    </p>
                </div>
                """;
        }

        return $"""
            <div style="
                margin:28px 0;
                padding:24px;
                border-radius:14px;
                background:#111827;
                text-align:center;
            ">

                <div style="
                    font-size:11px;
                    font-weight:700;
                    color:#9ca3af;
                    text-transform:uppercase;
                    letter-spacing:.1em;
                    margin-bottom:8px;
                ">
                    Step 1
                </div>

                <div style="
                    font-size:19px;
                    font-weight:700;
                    color:#ffffff;
                    margin-bottom:8px;
                ">
                    Download the ANCI Mobile App
                </div>

                <p style="
                    margin:0 0 20px;
                    font-size:13px;
                    line-height:1.6;
                    color:#d1d5db;
                ">
                    Download and install the ANCI mobile application
                    to continue your training enrollment.
                </p>

                <a
                    href="{appDownloadUrl}"
                    target="_blank"
                    style="
                        display:inline-block;
                        padding:13px 24px;
                        border-radius:9px;
                        background:#ffffff;
                        color:#111827;
                        font-size:13px;
                        font-weight:700;
                        text-decoration:none;
                    "
                >
                    Download ANCI App
                </a>

            </div>
            """;
    }

    // =========================================================
    // TRAINING STEPS
    // =========================================================

    private static string BuildTrainingStepsCard(
        string serviceName,
        string applicantEmail
    )
    {
        return $"""
            <div style="
                margin:28px 0;
                border:1px solid #e5e7eb;
                border-radius:14px;
                overflow:hidden;
                background:#ffffff;
            ">

                <div style="
                    padding:18px 20px;
                    background:#f8fafc;
                    border-bottom:1px solid #e5e7eb;
                ">
                    <div style="
                        font-size:12px;
                        font-weight:700;
                        color:#166534;
                        text-transform:uppercase;
                        letter-spacing:.08em;
                    ">
                        Step-by-Step Enrollment Guide
                    </div>

                    <div style="
                        margin-top:5px;
                        font-size:18px;
                        font-weight:700;
                        color:#111827;
                    ">
                        How to enroll in your training
                    </div>
                </div>

                <!-- STEP 2 -->

                <div style="
                    padding:20px;
                    border-bottom:1px solid #f1f5f9;
                ">
                    <table
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                    >
                        <tr>

                            <td
                                valign="top"
                                style="width:42px;"
                            >
                                <div style="
                                    width:32px;
                                    height:32px;
                                    border-radius:50%;
                                    background:#166534;
                                    color:#ffffff;
                                    font-size:14px;
                                    font-weight:700;
                                    line-height:32px;
                                    text-align:center;
                                ">
                                    2
                                </div>
                            </td>

                            <td valign="top">

                                <div style="
                                    font-size:15px;
                                    font-weight:700;
                                    color:#111827;
                                    margin-bottom:6px;
                                ">
                                    Open the ANCI App
                                </div>

                                <div style="
                                    font-size:13px;
                                    line-height:1.7;
                                    color:#6b7280;
                                ">
                                    Open the application after
                                    installation and proceed to
                                    the registration screen.
                                </div>

                            </td>

                        </tr>
                    </table>
                </div>

                <!-- STEP 3 -->

                <div style="
                    padding:20px;
                    border-bottom:1px solid #f1f5f9;
                ">
                    <table
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                    >
                        <tr>

                            <td
                                valign="top"
                                style="width:42px;"
                            >
                                <div style="
                                    width:32px;
                                    height:32px;
                                    border-radius:50%;
                                    background:#166534;
                                    color:#ffffff;
                                    font-size:14px;
                                    font-weight:700;
                                    line-height:32px;
                                    text-align:center;
                                ">
                                    3
                                </div>
                            </td>

                            <td valign="top">

                                <div style="
                                    font-size:15px;
                                    font-weight:700;
                                    color:#111827;
                                    margin-bottom:6px;
                                ">
                                    Register — Do Not Log In
                                </div>

                                <div style="
                                    font-size:13px;
                                    line-height:1.7;
                                    color:#6b7280;
                                ">
                                    Select
                                    <strong>Register</strong>
                                    if you do not have an account yet.
                                    You do not need to log in for this
                                    first-time registration process.
                                </div>

                            </td>

                        </tr>
                    </table>
                </div>

                <!-- STEP 4 -->

                <div style="
                    padding:20px;
                    border-bottom:1px solid #f1f5f9;
                ">
                    <table
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                    >
                        <tr>

                            <td
                                valign="top"
                                style="width:42px;"
                            >
                                <div style="
                                    width:32px;
                                    height:32px;
                                    border-radius:50%;
                                    background:#166534;
                                    color:#ffffff;
                                    font-size:14px;
                                    font-weight:700;
                                    line-height:32px;
                                    text-align:center;
                                ">
                                    4
                                </div>
                            </td>

                            <td valign="top">

                                <div style="
                                    font-size:15px;
                                    font-weight:700;
                                    color:#111827;
                                    margin-bottom:6px;
                                ">
                                    Use the Same Email Address
                                </div>

                                <div style="
                                    font-size:13px;
                                    line-height:1.7;
                                    color:#6b7280;
                                ">
                                    When registering, use the same
                                    email address that you provided
                                    in your service request.
                                </div>

                                <div style="
                                    margin-top:10px;
                                    padding:11px 13px;
                                    background:#f0fdf4;
                                    border:1px solid #bbf7d0;
                                    border-radius:8px;
                                    font-size:13px;
                                    font-weight:700;
                                    color:#166534;
                                    word-break:break-word;
                                ">
                                    {applicantEmail}
                                </div>

                            </td>

                        </tr>
                    </table>
                </div>

                <!-- STEP 5 -->

                <div style="
                    padding:20px;
                    border-bottom:1px solid #f1f5f9;
                ">
                    <table
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                    >
                        <tr>

                            <td
                                valign="top"
                                style="width:42px;"
                            >
                                <div style="
                                    width:32px;
                                    height:32px;
                                    border-radius:50%;
                                    background:#166534;
                                    color:#ffffff;
                                    font-size:14px;
                                    font-weight:700;
                                    line-height:32px;
                                    text-align:center;
                                ">
                                    5
                                </div>
                            </td>

                            <td valign="top">

                                <div style="
                                    font-size:15px;
                                    font-weight:700;
                                    color:#111827;
                                    margin-bottom:6px;
                                ">
                                    Complete Your Registration
                                </div>

                                <div style="
                                    font-size:13px;
                                    line-height:1.7;
                                    color:#6b7280;
                                ">
                                    Enter the required information
                                    and complete the registration
                                    process in the mobile application.
                                </div>

                            </td>

                        </tr>
                    </table>
                </div>

                <!-- STEP 6 -->

                <div style="
                    padding:20px;
                    border-bottom:1px solid #f1f5f9;
                ">
                    <table
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                    >
                        <tr>

                            <td
                                valign="top"
                                style="width:42px;"
                            >
                                <div style="
                                    width:32px;
                                    height:32px;
                                    border-radius:50%;
                                    background:#166534;
                                    color:#ffffff;
                                    font-size:14px;
                                    font-weight:700;
                                    line-height:32px;
                                    text-align:center;
                                ">
                                    6
                                </div>
                            </td>

                            <td valign="top">

                                <div style="
                                    font-size:15px;
                                    font-weight:700;
                                    color:#111827;
                                    margin-bottom:6px;
                                ">
                                    Open the Training Section
                                </div>

                                <div style="
                                    font-size:13px;
                                    line-height:1.7;
                                    color:#6b7280;
                                ">
                                    After registration, go to the
                                    <strong>Training</strong>
                                    section of the ANCI mobile app.
                                </div>

                            </td>

                        </tr>
                    </table>
                </div>

                <!-- STEP 7 -->

                <div style="
                    padding:20px;
                    border-bottom:1px solid #f1f5f9;
                ">
                    <table
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                    >
                        <tr>

                            <td
                                valign="top"
                                style="width:42px;"
                            >
                                <div style="
                                    width:32px;
                                    height:32px;
                                    border-radius:50%;
                                    background:#166534;
                                    color:#ffffff;
                                    font-size:14px;
                                    font-weight:700;
                                    line-height:32px;
                                    text-align:center;
                                ">
                                    7
                                </div>
                            </td>

                            <td valign="top">

                                <div style="
                                    font-size:15px;
                                    font-weight:700;
                                    color:#111827;
                                    margin-bottom:6px;
                                ">
                                    Select Your Training
                                </div>

                                <div style="
                                    font-size:13px;
                                    line-height:1.7;
                                    color:#6b7280;
                                ">
                                    Find and select the training
                                    program you requested:
                                </div>

                                <div style="
                                    margin-top:10px;
                                    padding:12px 14px;
                                    border-radius:8px;
                                    background:#f8fafc;
                                    border:1px solid #e5e7eb;
                                    font-size:14px;
                                    font-weight:700;
                                    color:#111827;
                                ">
                                    {serviceName}
                                </div>

                            </td>

                        </tr>
                    </table>
                </div>

                <!-- STEP 8 -->

                <div style="
                    padding:20px;
                    border-bottom:1px solid #f1f5f9;
                ">
                    <table
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                    >
                        <tr>

                            <td
                                valign="top"
                                style="width:42px;"
                            >
                                <div style="
                                    width:32px;
                                    height:32px;
                                    border-radius:50%;
                                    background:#166534;
                                    color:#ffffff;
                                    font-size:14px;
                                    font-weight:700;
                                    line-height:32px;
                                    text-align:center;
                                ">
                                    8
                                </div>
                            </td>

                            <td valign="top">

                                <div style="
                                    font-size:15px;
                                    font-weight:700;
                                    color:#111827;
                                    margin-bottom:6px;
                                ">
                                    Submit Your Enrollment
                                </div>

                                <div style="
                                    font-size:13px;
                                    line-height:1.7;
                                    color:#6b7280;
                                ">
                                    Review the training information
                                    and submit your enrollment request.
                                </div>

                            </td>

                        </tr>
                    </table>
                </div>

                <!-- STEP 9 -->

                <div style="
                    padding:20px;
                ">
                    <table
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                    >
                        <tr>

                            <td
                                valign="top"
                                style="width:42px;"
                            >
                                <div style="
                                    width:32px;
                                    height:32px;
                                    border-radius:50%;
                                    background:#166534;
                                    color:#ffffff;
                                    font-size:14px;
                                    font-weight:700;
                                    line-height:32px;
                                    text-align:center;
                                ">
                                    9
                                </div>
                            </td>

                            <td valign="top">

                                <div style="
                                    font-size:15px;
                                    font-weight:700;
                                    color:#111827;
                                    margin-bottom:6px;
                                ">
                                    Wait for Confirmation
                                </div>

                                <div style="
                                    font-size:13px;
                                    line-height:1.7;
                                    color:#6b7280;
                                ">
                                    Once your enrollment has been
                                    submitted, ANCI will review it
                                    and provide your enrollment
                                    confirmation and training schedule.
                                </div>

                            </td>

                        </tr>
                    </table>
                </div>

            </div>
            """;
    }

    // =========================================================
    // INFO CARD
    // =========================================================

    private static string BuildInfoCard(
        string label,
        string content
    )
    {
        return $"""
            <div style="
                margin:20px 0;
                padding:18px 20px;
                border-radius:12px;
                background:#f8fafc;
                border:1px solid #e5e7eb;
            ">

                <div style="
                    margin-bottom:7px;
                    font-size:10px;
                    font-weight:700;
                    color:#9ca3af;
                    text-transform:uppercase;
                    letter-spacing:.1em;
                ">
                    {label}
                </div>

                <div style="
                    font-size:14px;
                    line-height:1.6;
                    color:#374151;
                ">
                    {content}
                </div>

            </div>
            """;
    }

    // =========================================================
    // CONSULTATION CARD
    // =========================================================

    private static string BuildConsultationCard(
        string serviceName,
        ServiceConsultation consultation
    )
    {
        var date =
            consultation.ScheduledAt
                .ToString(
                    "MMMM dd, yyyy"
                );

        var time =
            consultation.ScheduledAt
                .ToString(
                    "hh:mm tt"
                );

        return $"""
            <div style="
                margin:24px 0;
                border:1px solid #dbeafe;
                border-radius:14px;
                overflow:hidden;
                background:#ffffff;
            ">

                <div style="
                    padding:14px 18px;
                    background:#eff6ff;
                    border-bottom:1px solid #dbeafe;
                ">
                    <div style="
                        font-size:11px;
                        font-weight:700;
                        color:#2563eb;
                        text-transform:uppercase;
                        letter-spacing:.08em;
                    ">
                        Consultation Details
                    </div>
                </div>

                <div style="
                    padding:18px;
                ">

                    <table
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                    >

                        <tr>
                            <td style="
                                padding:6px 0;
                                width:35%;
                                font-size:12px;
                                color:#9ca3af;
                            ">
                                Service
                            </td>

                            <td style="
                                padding:6px 0;
                                font-size:13px;
                                font-weight:700;
                                color:#374151;
                            ">
                                {serviceName}
                            </td>
                        </tr>

                        <tr>
                            <td style="
                                padding:6px 0;
                                font-size:12px;
                                color:#9ca3af;
                            ">
                                Date
                            </td>

                            <td style="
                                padding:6px 0;
                                font-size:13px;
                                font-weight:600;
                                color:#374151;
                            ">
                                {date}
                            </td>
                        </tr>

                        <tr>
                            <td style="
                                padding:6px 0;
                                font-size:12px;
                                color:#9ca3af;
                            ">
                                Time
                            </td>

                            <td style="
                                padding:6px 0;
                                font-size:13px;
                                font-weight:600;
                                color:#374151;
                            ">
                                {time}
                            </td>
                        </tr>

                    </table>

                </div>
            </div>
            """;
    }

    // =========================================================
    // MEETING BUTTON
    // =========================================================

    private static string BuildMeetingButton(
        string meetingLink
    )
    {
        return $"""
            <div style="
                margin:26px 0;
                text-align:center;
            ">

                <a
                    href="{meetingLink}"
                    target="_blank"
                    style="
                        display:inline-block;
                        padding:13px 24px;
                        border-radius:9px;
                        background:#2563eb;
                        color:#ffffff;
                        font-size:13px;
                        font-weight:700;
                        text-decoration:none;
                    "
                >
                    Join Consultation
                </a>

                <div style="
                    margin-top:10px;
                    font-size:10px;
                    color:#9ca3af;
                ">
                    Click the button above to join your consultation.
                </div>

            </div>
            """;
    }

    // =========================================================
    // NOTES
    // =========================================================

    private static string BuildNotes(
        string? notes
    )
    {
        if (
            string.IsNullOrWhiteSpace(
                notes
            )
        )
        {
            return "";
        }

        return $"""
            <div style="
                margin-top:20px;
                padding:16px;
                border-radius:10px;
                background:#f8fafc;
                border:1px solid #e5e7eb;
            ">

                <div style="
                    font-size:11px;
                    font-weight:700;
                    color:#6b7280;
                    text-transform:uppercase;
                    letter-spacing:.08em;
                    margin-bottom:6px;
                ">
                    Consultation Notes
                </div>

                <div style="
                    font-size:13px;
                    line-height:1.6;
                    color:#374151;
                ">
                    {
                        WebUtility.HtmlEncode(
                            notes
                        )
                    }
                </div>

            </div>
            """;
    }

    // =========================================================
    // STATUS COLOR
    // =========================================================

    private static string GetStatusColor(
        ServiceRequestStatus status
    )
    {
        return status switch
        {
            ServiceRequestStatus.Approved =>
                "#166534",

            ServiceRequestStatus.Rejected =>
                "#dc2626",

            ServiceRequestStatus.Scheduled =>
                "#2563eb",

            ServiceRequestStatus.InProgress =>
                "#7c3aed",

            ServiceRequestStatus.Completed =>
                "#166534",

            ServiceRequestStatus.Cancelled =>
                "#dc2626",

            _ =>
                "#d97706"
        };
    }
}