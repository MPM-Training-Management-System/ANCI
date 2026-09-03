import type {
  AttendanceQrDto,
  AttendanceRecordDto,
  ManualAttendanceRequest,
  OpenAttendanceRequest,
  ScanAttendanceRequest,
} from "@repo/types";

import {
  ApiClient,
} from "../api/client";

import {
  AttendanceEndpoints,
} from "./AttendanceEndpoint";

export class AttendanceApi {

  constructor(
    private readonly api: ApiClient
  ) {}


  // TRAINER

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


  // TRAINER / PARTICIPANT / ADMIN

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


  // PARTICIPANT

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

}