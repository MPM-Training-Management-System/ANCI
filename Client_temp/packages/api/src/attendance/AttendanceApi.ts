import type {
  AttendanceQrDto,
  AttendanceRecordDto,
  ManualAttendanceRequest,
  OpenAttendanceRequest,
  ScanAttendanceRequest,
} from "@repo/types";

import { ApiClient } from "../api/client";
import { AttendanceEndpoints } from "./AttendanceEndpoint";

export class AttendanceApi {
  constructor(
    private readonly api: ApiClient
  ) {}

  // ============================================================
  // START / OPEN SESSION
  //
  // Trainer starts the training session.
  //
  // Result:
  // Session = OPEN
  // Manual Attendance = CLOSED
  // QR Scanning = ENABLED
  // ============================================================

  async openSession(
    request: OpenAttendanceRequest
  ): Promise<void> {
    await this.api.request(
      AttendanceEndpoints.openSession,
      {
        method: "POST",
        body: request,
      }
    );
  }

  // ============================================================
  // END / CLOSE SESSION
  //
  // Trainer ends the training session.
  //
  // Result:
  // Session = CLOSED
  // Manual Attendance = CLOSED
  // QR Scanning = DISABLED
  // ============================================================

  async closeSession(
    id: string
  ): Promise<void> {
    await this.api.request(
      AttendanceEndpoints.closeSession(id),
      {
        method: "POST",
      }
    );
  }

  // ============================================================
  // OPEN MANUAL ATTENDANCE
  //
  // Trainer allows participants to manually
  // Time In / Time Out.
  //
  // Session must already be OPEN.
  // ============================================================

  async openManualAttendance(
    id: string
  ): Promise<void> {
    await this.api.request(
      AttendanceEndpoints.openManualAttendance(id),
      {
        method: "POST",
      }
    );
  }

  // ============================================================
  // CLOSE MANUAL ATTENDANCE
  //
  // Trainer disables participant manual
  // Time In / Time Out.
  //
  // The training session remains OPEN.
  // QR scanning remains ENABLED.
  // ============================================================

  async closeManualAttendance(
    id: string
  ): Promise<void> {
    await this.api.request(
      AttendanceEndpoints.closeManualAttendance(id),
      {
        method: "POST",
      }
    );
  }

  // ============================================================
  // GET SESSION
  // ============================================================

  async getSession(
    id: string
  ): Promise<AttendanceRecordDto[]> {
    return this.api.request<AttendanceRecordDto[]>(
      AttendanceEndpoints.getSession(id),
      {
        method: "GET",
      }
    );
  }

  // ============================================================
  // GET SESSION QR
  //
  // Gets the participant's permanent QR token.
  // ============================================================

  async getQr(
    id: string,
    enrollmentId: string
  ): Promise<AttendanceQrDto> {
    return this.api.request<AttendanceQrDto>(
      AttendanceEndpoints.getQr(
        id,
        enrollmentId
      ),
      {
        method: "GET",
      }
    );
  }

  // ============================================================
  // SCAN ATTENDANCE
  //
  // Trainer scans participant permanent QR.
  //
  // Only requires:
  // Session = OPEN
  //
  // Manual Attendance status does NOT matter.
  // ============================================================

  async scan(
    request: ScanAttendanceRequest
  ): Promise<void> {
    await this.api.request(
      AttendanceEndpoints.scan,
      {
        method: "POST",
        body: request,
      }
    );
  }

  // ============================================================
  // MANUAL ATTENDANCE
  //
  // Participant:
  // Time In / Time Out
  //
  // Backend checks:
  // Session OPEN
  // Manual Attendance OPEN
  // ============================================================

  async manual(
    request: ManualAttendanceRequest
  ): Promise<void> {
    await this.api.request(
      AttendanceEndpoints.manual,
      {
        method: "POST",
        body: request,
      }
    );
  }

  // ============================================================
  // GET BATCH ATTENDANCE
  // ============================================================

  async getBatch(
    batchId: string
  ): Promise<AttendanceRecordDto[]> {
    return this.api.request<AttendanceRecordDto[]>(
      AttendanceEndpoints.getBatch(batchId),
      {
        method: "GET",
      }
    );
  }

  // ============================================================
  // GET CURRENT SESSION STATE
  //
  // GET:
  // /api/attendance/batch/{batchId}/open
  //
  // Response:
  //
  // {
  //   isOpen: true,
  //   attendanceSessionId: "...",
  //   manualAttendanceOpen: true
  // }
  //
  // OR:
  //
  // {
  //   isOpen: false,
  //   attendanceSessionId: null,
  //   manualAttendanceOpen: false
  // }
  //
  // IMPORTANT:
  // isOpen and manualAttendanceOpen are DIFFERENT states.
  // ============================================================
async getOpenSession(
  batchId: string,
  trainingSessionId: string
): Promise<{
  isOpen: boolean;
  attendanceSessionId: string | null;
  manualAttendanceOpen: boolean;
}> {
  return this.api.request<{
    isOpen: boolean;
    attendanceSessionId: string | null;
    manualAttendanceOpen: boolean;
  }>(
    AttendanceEndpoints.getOpenSession(
      batchId,
      trainingSessionId
    ),
    {
      method: "GET",
    }
  );
}



async getAttendanceProgress(): Promise<
  {
    enrollmentId: string;
    trainingBatchId: string;
    participantName: string;
    totalSessions: number;
    attendedSessions: number;
    lateSessions: number;
    absentSessions: number;
    attendancePercentage: number;
  }[]
> {
  return this.api.request<
    {
      enrollmentId: string;
      trainingBatchId: string;
      participantName: string;
      totalSessions: number;
      attendedSessions: number;
      lateSessions: number;
      absentSessions: number;
      attendancePercentage: number;
    }[]
  >(
    AttendanceEndpoints.getattendanceprogress,
    {
      method: "GET",
    }
  );
}
}