import { ApiClient } from "../api/client";
import { CertificateEndpoints } from "./CertificateEndpoints";

import type {
  Certificate,
  EligibleCertificate,
} from "@repo/types";

export class CertificateApi {
  constructor(
    private readonly api: ApiClient
  ) {}

  // =========================================================
  // GET ALL CERTIFICATES
  // =========================================================

  async getAll(): Promise<Certificate[]> {
    return this.api.request<Certificate[]>(
      CertificateEndpoints.getAll(),
      {
        method: "GET",
      }
    );
  }

  // =========================================================
  // GET CERTIFICATES BY ENROLLMENT
  // =========================================================

  async getByEnrollment(
    enrollmentId: string
  ): Promise<Certificate[]> {
    return this.api.request<Certificate[]>(
      CertificateEndpoints.getByEnrollment(
        enrollmentId
      ),
      {
        method: "GET",
      }
    );
  }

  // =========================================================
  // GENERATE CERTIFICATES
  // =========================================================

  async generate(
    enrollmentId: string
  ): Promise<Certificate[]> {
    return this.api.request<Certificate[]>(
      CertificateEndpoints.generate(
        enrollmentId
      ),
      {
        method: "POST",
      }
    );
  }

  // =========================================================
  // VERIFY CERTIFICATE
  // =========================================================

  async verify(
    verificationCode: string
  ): Promise<Certificate> {
    return this.api.request<Certificate>(
      CertificateEndpoints.verify(
        verificationCode
      ),
      {
        method: "GET",
      }
    );
  }

  // =========================================================
  // GET ELIGIBLE PARTICIPANTS
  // =========================================================

  async getEligible(): Promise<EligibleCertificate[]> {
    return this.api.request<EligibleCertificate[]>(
      CertificateEndpoints.eligible(),
      {
        method: "GET",
      }
    );
  }
}