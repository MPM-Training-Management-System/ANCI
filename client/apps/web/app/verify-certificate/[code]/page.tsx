
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  FileCheck2,
  GraduationCap,
  Hash,
  Loader2,
  ShieldCheck,
  ShieldX,
  XCircle,
  Award,
  Building2,
} from "lucide-react";



interface CertificateData {
  id: string;
  enrollmentId: string;
  certificateNumber: string;
  type: string;
  issuedAt: string;
  verificationCode: string;
  pdfUrl: string;
  canvaDesignId: string | null;
  isRevoked: boolean;
  revocationReason: string | null;
  participantName: string;
  trainingName: string;
  batchCode: string;
}

type VerificationState =
  | "loading"
  | "verified"
  | "revoked"
  | "invalid"
  | "error";

export default function VerifyCertificatePage() {
  const params = useParams<{ code: string }>();
  const code = params.code;

  const [certificate, setCertificate] =
    useState<CertificateData | null>(null);

  const [status, setStatus] =
    useState<VerificationState>("loading");

  useEffect(() => {
    if (!code) return;

    const controller = new AbortController();

    async function verifyCertificate() {
      try {
        setStatus("loading");

        const baseUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!baseUrl) {
          throw new Error("API URL is not configured.");
        }

        const response = await fetch(
          `${baseUrl.replace(/\/+$/, "")}/api/certificate/verify/${encodeURIComponent(code)}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
            signal: controller.signal,
          }
        );

        if (response.status === 404) {
          setCertificate(null);
          setStatus("invalid");
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to verify certificate.");
        }

        const data: CertificateData = await response.json();

        if (
          !data.verificationCode ||
          data.verificationCode !== code
        ) {
          setCertificate(null);
          setStatus("invalid");
          return;
        }

        setCertificate(data);
        setStatus(data.isRevoked ? "revoked" : "verified");

      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error("Certificate verification error:", error);
        setStatus("error");

      }
    }

    verifyCertificate();

    return () => controller.abort();
  }, [code]);

  const formattedDate = certificate
    ? new Date(certificate.issuedAt).toLocaleDateString(
        "en-PH",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      )
    : "";

  const isVerified = status === "verified";
  const isRevoked = status === "revoked";

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f9ff] text-[#0b1c30]">


      {/* VERIFICATION CONTENT */}
      <section className="relative px-5 py-12 sm:py-16">

        <div className="mx-auto max-w-4xl">

          {/* LOADING */}
          {status === "loading" && (
            <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center shadow-[0_10px_40px_rgba(0,43,92,0.05)]">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eff4ff]">
                <Loader2 className="h-8 w-8 animate-spin text-[#2563eb]" />
              </div>

              <h2 className="mt-6 text-xl font-extrabold text-[#002b5c]">
                Verifying Certificate
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Please wait while we validate the certificate
                against our official records.
              </p>

              <div className="mx-auto mt-6 h-1.5 max-w-xs overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-[#2563eb]" />
              </div>

            </div>
          )}

          {/* VERIFIED / REVOKED */}
          {(isVerified || isRevoked) && certificate && (
            <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_15px_50px_rgba(0,43,92,0.08)]">

              {/* STATUS HEADER */}
              <div
                className={`relative overflow-hidden px-6 py-10 text-center sm:px-10 ${
                  isVerified
                    ? "bg-[#002b5c]"
                    : "bg-red-700"
                }`}
              >

                <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border-[35px] border-white/5" />

                <div className="relative z-10">

                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
                    {isVerified ? (
                      <BadgeCheck className="h-11 w-11 text-emerald-300" />
                    ) : (
                      <ShieldX className="h-11 w-11 text-red-200" />
                    )}
                  </div>

                  <div className="mt-6">

                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
                      Certificate Status
                    </span>

                    <h2 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
                      {isVerified
                        ? "Certificate Verified"
                        : "Certificate Revoked"}
                    </h2>

                    <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/80">
                      {isVerified
                        ? "This certificate is authentic and officially registered in the ACE NextGen records."
                        : "This certificate has been revoked and is no longer considered valid."}
                    </p>

                  </div>

                  <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white">
                    {isVerified ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                        Valid / Not Revoked
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-200" />
                        Revoked
                      </>
                    )}
                  </div>

                </div>
              </div>

              {/* CERTIFICATE INFORMATION */}
              <div className="p-6 sm:p-10">

                {/* SECTION TITLE */}
                <div className="mb-7 flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eff4ff]">
                    <Award className="h-5 w-5 text-[#2563eb]" />
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-[#002b5c]">
                      Certificate Information
                    </h3>

                    <p className="text-xs text-slate-500">
                      Official details of the certificate holder
                    </p>
                  </div>

                </div>

                {/* HOLDER CARD */}
                <div className="rounded-2xl border border-blue-100 bg-[#eff4ff] p-6 sm:p-7">

                  <div className="flex items-start gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#002b5c] text-white">
                      <GraduationCap className="h-6 w-6" />
                    </div>

                    <div className="min-w-0">

                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#2563eb]">
                        Certificate Holder
                      </p>

                      <h3 className="mt-2 break-words text-xl font-extrabold text-[#002b5c] sm:text-2xl">
                        {certificate.participantName}
                      </h3>

                      <p className="mt-2 text-sm font-medium text-slate-600">
                        {certificate.trainingName}
                      </p>

                    </div>
                  </div>

                </div>

                {/* DETAILS */}
                <div className="mt-8">

                  <div className="mb-5 flex items-center gap-2">
                    <FileCheck2 className="h-4 w-4 text-[#2563eb]" />

                    <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                      Certificate Details
                    </h4>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">

                    <Detail
                      icon={<Hash />}
                      label="Certificate Number"
                      value={certificate.certificateNumber}
                    />

                    <Detail
                      icon={<Award />}
                      label="Certificate Type"
                      value={certificate.type}
                    />

                    <Detail
                      icon={<Building2 />}
                      label="Training Batch"
                      value={certificate.batchCode}
                    />

                    <Detail
                      icon={<CalendarDays />}
                      label="Date Issued"
                      value={formattedDate}
                    />

                    <Detail
                      icon={<ShieldCheck />}
                      label="Verification Code"
                      value={certificate.verificationCode}
                      mono
                    />

                    <Detail
                      icon={<CheckCircle2 />}
                      label="Current Status"
                      value={
                        isVerified
                          ? "Valid / Not Revoked"
                          : "Revoked"
                      }
                      status={isVerified ? "valid" : "revoked"}
                    />

                  </div>

                </div>

                {/* REVOCATION REASON */}
                {isRevoked && certificate.revocationReason && (
                  <div className="mt-7 rounded-2xl border border-red-200 bg-red-50 p-5">

                    <div className="flex items-center gap-2">
                      <ShieldX className="h-5 w-5 text-red-600" />

                      <p className="text-sm font-bold text-red-700">
                        Revocation Reason
                      </p>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-red-600">
                      {certificate.revocationReason}
                    </p>

                  </div>
                )}

                {/* VIEW CERTIFICATE */}
                {certificate.pdfUrl && (
                  <a
                    href={certificate.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-9 flex w-full items-center justify-center gap-3 rounded-xl bg-[#002b5c] px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-900/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#2563eb] hover:shadow-xl"
                  >
                    <FileCheck2 className="h-5 w-5" />

                    View Original Certificate

                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                )}

              </div>

              {/* FOOTER */}
              <div className="border-t border-slate-100 bg-slate-50 px-6 py-5 text-center">

                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
                  <ShieldCheck className="h-4 w-4 text-[#2563eb]" />
                  Official Verification Record
                </div>

                <p className="mt-2 text-[11px] text-slate-400">
                  ACE NextGen Consultancy Inc.
                </p>

              </div>

            </div>
          )}

          {/* INVALID */}
          {status === "invalid" && (
            <ResultMessage
              icon={<ShieldX />}
              title="Invalid Certificate"
              description="We could not find a certificate matching this verification code in our official records. Please check the code and try again."
              color="red"
            />
          )}

          {/* ERROR */}
          {status === "error" && (
            <ResultMessage
              icon={<XCircle />}
              title="Verification Unavailable"
              description="Our verification service is currently unavailable. Please try again later."
              color="amber"
            />
          )}

          {/* VERIFICATION CODE */}
          <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm">

            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Verification Reference
            </p>

            <p className="mt-2 break-all font-mono text-sm font-bold tracking-wider text-[#002b5c]">
              {code}
            </p>

          </div>

          {/* BACK BUTTON */}
          <div className="mt-8 text-center">

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#2563eb] transition hover:text-[#002b5c]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to ACE NextGen Website
            </Link>

          </div>

        </div>
      </section>


    </main>
  );
}

/* DETAIL COMPONENT */

function Detail({
  icon,
  label,
  value,
  mono = false,
  status,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
  status?: "valid" | "revoked";
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-5 transition-all duration-200 hover:border-blue-100 hover:shadow-sm">

      <div className="flex items-center gap-2">

        <span className="text-[#2563eb] [&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </span>

        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
          {label}
        </p>

      </div>

      <p
        className={`mt-3 break-words text-sm font-bold ${
          mono ? "font-mono tracking-wide" : ""
        } ${
          status === "valid"
            ? "text-emerald-600"
            : status === "revoked"
              ? "text-red-600"
              : "text-[#172b4d]"
        }`}
      >
        {value || "Not available"}
      </p>

    </div>
  );
}

/* RESULT COMPONENT */

function ResultMessage({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "red" | "amber";
}) {
  const styles =
    color === "red"
      ? {
          container: "border-red-100 bg-white",
          icon: "bg-red-50 text-red-600",
          title: "text-red-700",
        }
      : {
          container: "border-amber-100 bg-white",
          icon: "bg-amber-50 text-amber-600",
          title: "text-amber-700",
        };

  return (
    <div
      className={`rounded-3xl border p-10 text-center shadow-sm ${styles.container}`}
    >

      <div
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${styles.icon} [&>svg]:h-8 [&>svg]:w-8`}
      >
        {icon}
      </div>

      <h2 className={`mt-6 text-2xl font-extrabold ${styles.title}`}>
        {title}
      </h2>

      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
        {description}
      </p>

      <Link
        href="/"
        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#002b5c] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#2563eb]"
      >
        <ArrowLeft className="h-4 w-4" />
        Return to Homepage
      </Link>

    </div>
  );
}
