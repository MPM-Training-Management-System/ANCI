
"use client";

import { useState } from "react";
import { adminRecoveryApi } from "@/lib/api";

interface RecoveryEntity {
  entityName: string;
  sourceCount: number;
  existingCount: number;
  missingCount: number;
}

interface RecoveryPreview {
  userId: string;
  userCode: string;
  fullName: string;
  email: string;
  userExistsInRecovery: boolean;
  userExistsInProduction: boolean;
  relatedRecordsFound: number;
  recordsAlreadyInProduction: number;
  recordsMissingFromProduction: number;
  entities: RecoveryEntity[];
  warnings: string[];
}

interface RecoveryResult {
  userId: string;
  success: boolean;
  restoredRecords: number;
  skippedRecords: number;
  failedRecords: number;
  messages: string[];
}

export default function BackupPage() {
  const [userCode, setUserCode] = useState("");
  const [preview, setPreview] = useState<RecoveryPreview | null>(null);
  const [result, setResult] = useState<RecoveryResult | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function handlePreview() {
    const normalizedUserCode = userCode.trim();

    if (!normalizedUserCode) {
      setError("Please enter a User Code, such as P26-001.");
      return;
    }

    setLoadingPreview(true);
    setError("");
    setNotice("");
    setPreview(null);
    setResult(null);

    try {
      const data =
        await adminRecoveryApi.previewFullUserRecovery(
          normalizedUserCode,
        );

      setPreview(data as RecoveryPreview);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load backup recovery records.",
      );
    } finally {
      setLoadingPreview(false);
    }
  }

  async function handleRestore() {
    if (!preview) {
      setError("Preview the User Code first.");
      return;
    }

    if (!preview.userExistsInRecovery) {
      setError("This user does not exist in the recovery database.");
      return;
    }

    if (preview.recordsMissingFromProduction <= 0) {
      setNotice("There are no missing records to restore.");
      return;
    }

    const confirmed = window.confirm(
      `Restore missing records for ${
        preview.fullName || preview.userCode
      } (${preview.userCode})?\n\n` +
        `Missing records: ${preview.recordsMissingFromProduction}\n\n` +
        "Please verify the account before continuing.",
    );

    if (!confirmed) return;

    setRestoring(true);
    setError("");
    setNotice("");
    setResult(null);

    try {
      const data = await adminRecoveryApi.restoreFullUser(
        preview.userCode,
      );

      setResult(data as RecoveryResult);

      if (data.success) {
        setNotice("Recovery completed successfully.");

        try {
          const refreshed =
            await adminRecoveryApi.previewFullUserRecovery(
              preview.userCode,
            );

          setPreview(refreshed as RecoveryPreview);
        } catch {
          setNotice(
            "Recovery completed, but the preview could not be refreshed. Please preview the User Code again.",
          );
        }
      } else {
        setError(
          data.messages?.join("\n") ||
            "The recovery operation was not fully successful.",
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to restore records.",
      );
    } finally {
      setRestoring(false);
    }
  }

  function handleClear() {
    if (loadingPreview || restoring) return;

    setUserCode("");
    setPreview(null);
    setResult(null);
    setError("");
    setNotice("");
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-800">
            Administration
          </p>

          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            Backup &amp; User Recovery
          </h1>

          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Review recovery records and restore missing user-related
            records from the recovery database to production.
          </p>
        </header>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold">
                Recovery Database
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Search for a user in the available recovery records.
              </p>
            </div>

            <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
              Recovery Tools
            </span>
          </div>

          <form
            className="mt-5 flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              void handlePreview();
            }}
          >
            <input
              value={userCode}
              onChange={(event) => setUserCode(event.target.value)}
              placeholder="Enter User Code (e.g. P26-001)"
              aria-label="User Code"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              disabled={loadingPreview || restoring}
            />

            <button
              type="submit"
              disabled={loadingPreview || restoring}
              className="rounded-lg bg-[#002b5c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingPreview ? "Loading Preview..." : "Preview Records"}
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={loadingPreview || restoring}
              className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Clear
            </button>
          </form>
        </section>

        {error && (
          <div
            role="alert"
            className="whitespace-pre-line rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <strong>Action failed</strong>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="whitespace-pre-line rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            {notice}
          </div>
        )}

        {preview && (
          <>
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <h2 className="text-lg font-semibold">
                    Recovery Preview
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Verify the account and review the record counts
                    before restoring.
                  </p>
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                    preview.userExistsInRecovery
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {preview.userExistsInRecovery
                    ? "Found in Recovery"
                    : "Not Found in Recovery"}
                </span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    User Code
                  </p>
                  <p className="mt-1 break-all font-semibold">
                    {preview.userCode || "—"}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Full Name
                  </p>
                  <p className="mt-1 break-words font-semibold">
                    {preview.fullName || "—"}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Email
                  </p>
                  <p className="mt-1 break-all font-semibold">
                    {preview.email || "—"}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Production Account
                  </p>
                  <p className="mt-1 font-semibold">
                    {preview.userExistsInProduction
                      ? "Exists"
                      : "Missing"}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">
                    Recovery Records
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    {preview.relatedRecordsFound}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">
                    Already in Production
                  </p>
                  <p className="mt-2 text-2xl font-bold text-green-700">
                    {preview.recordsAlreadyInProduction}
                  </p>
                </div>

                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm text-amber-800">
                    Missing from Production
                  </p>
                  <p className="mt-2 text-2xl font-bold text-amber-800">
                    {preview.recordsMissingFromProduction}
                  </p>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <h3 className="mb-3 font-semibold">
                  Related Record Details
                </h3>

                <table className="w-full min-w-[600px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-y border-slate-200 bg-slate-50 text-slate-600">
                      <th className="px-4 py-3 font-semibold">
                        Entity
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Recovery
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Existing
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Missing
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {preview.entities?.length ? (
                      preview.entities.map((entity, index) => (
                        <tr
                          key={`${entity.entityName}-${index}`}
                          className="border-b border-slate-100"
                        >
                          <td className="px-4 py-3 font-medium">
                            {entity.entityName}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {entity.sourceCount}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {entity.existingCount}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">
                            {entity.missingCount}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-slate-500"
                        >
                          No related entity details were returned.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {preview.warnings?.length > 0 && (
                <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <h3 className="font-semibold text-amber-900">
                    Warnings
                  </h3>

                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">
                    {preview.warnings.map((warning, index) => (
                      <li key={`${index}-${warning}`}>
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6 flex flex-col justify-between gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center">
                <p className="max-w-xl text-sm text-slate-500">
                  Restore only after verifying the user and reviewing
                  the missing records. Existing records should be
                  preserved by the backend restore logic.
                </p>

                <button
                  type="button"
                  onClick={() => void handleRestore()}
                  disabled={
                    restoring ||
                    loadingPreview ||
                    !preview.userExistsInRecovery ||
                    preview.recordsMissingFromProduction <= 0
                  }
                  className="rounded-lg bg-amber-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {restoring ? "Restoring Records..." : "Restore Records"}
                </button>
              </div>
            </section>

            {result && (
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-semibold">
                  Recovery Result
                </h2>

                <p
                  className={`mt-2 text-sm font-medium ${
                    result.success
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {result.success
                    ? "Recovery completed successfully."
                    : "Recovery reported a failure."}
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">
                      Restored
                    </p>
                    <p className="mt-1 text-2xl font-bold">
                      {result.restoredRecords}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">
                      Skipped
                    </p>
                    <p className="mt-1 text-2xl font-bold">
                      {result.skippedRecords}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">
                      Failed
                    </p>
                    <p className="mt-1 text-2xl font-bold">
                      {result.failedRecords}
                    </p>
                  </div>
                </div>

                {result.messages?.length > 0 && (
                  <div className="mt-5">
                    <h3 className="font-semibold">Messages</h3>

                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                      {result.messages.map((message, index) => (
                        <li key={`${index}-${message}`}>
                          {message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
