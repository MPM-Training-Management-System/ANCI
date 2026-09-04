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
  constructor(private readonly api: ApiClient) {}

  // ============================================================
  // OPEN SESSION
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
  // CLOSE SESSION
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
  // SCAN
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
  // MANUAL
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
  // GET CURRENT OPEN SESSION
  //
  // Participant:
  // GET /api/attendance/batch/{batchId}/open
  //
  // 200 = OPEN
  // 404 = CLOSED
  // ============================================================

 async getOpenSession(
  batchId: string
): Promise<{
  isOpen: boolean;
  attendanceSessionId: string | null;
}> {
  return this.api.request<{
    isOpen: boolean;
    attendanceSessionId: string | null;
  }>(
    `/api/attendance/batch/${batchId}/open`,
    {
      method: "GET",
    }
  );
}
}