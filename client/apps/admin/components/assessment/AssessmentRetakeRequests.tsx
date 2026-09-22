"use client";

import type {
  AssessmentRetakeRequest,
} from "@repo/types";

interface AssessmentRetakeRequestsProps {
  requests: AssessmentRetakeRequest[];
  isLoading: boolean;
  reviewingId: string | null;
  onRefresh: () => void;
  onReview: (
    request: AssessmentRetakeRequest,
    approve: boolean,
  ) => void;
}

export default function AssessmentRetakeRequests({
  requests,
  isLoading,
  reviewingId,
  onRefresh,
  onReview,
}: AssessmentRetakeRequestsProps) {
  const pendingRequests =
    requests.filter(
      request =>
        request.status === "Pending",
    );

  return (
    <section
      className="
        overflow-hidden
        rounded-3xl
        border
        border-[#e7e9ec]
        bg-white
        shadow-[0_2px_12px_rgba(0,0,0,0.025)]
      "
    >
      <div
        className="
          border-b
          border-[#eceef1]
          p-5
          sm:p-6
        "
      >
        <div
          className="
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <div className="flex items-center gap-2">
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-gray-400
                "
              >
                Notifications
              </p>

              {pendingRequests.length > 0 && (
                <span
                  className="
                    rounded-full
                    bg-amber-100
                    px-2
                    py-0.5
                    text-[10px]
                    font-bold
                    text-amber-700
                  "
                >
                  {pendingRequests.length} new
                </span>
              )}
            </div>

            <h2
              className="
                mt-1
                text-xl
                font-bold
                tracking-tight
                text-[#111827]
              "
            >
              Retake Requests
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Review participants requesting
              another written assessment attempt.
            </p>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="
              rounded-xl
              border
              border-[#dfe3e8]
              bg-white
              px-4
              py-2.5
              text-sm
              font-semibold
              text-gray-700
              transition
              hover:bg-gray-50
              disabled:opacity-50
            "
          >
            {isLoading
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6">

        {isLoading ? (
          <EmptyState
            title="Loading requests"
            description="Please wait a moment."
          />
        ) : requests.length === 0 ? (
          <EmptyState
            title="All caught up"
            description="There are currently no retake requests waiting for review."
          />
        ) : (
          <div className="space-y-3">

            {pendingRequests.length > 0 && (
              <>
                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.14em]
                    text-amber-600
                  "
                >
                  Needs your attention
                </p>

                {pendingRequests.map(
                  request => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      isReviewing={
                        reviewingId ===
                        request.id
                      }
                      onReview={
                        onReview
                      }
                    />
                  ),
                )}
              </>
            )}

            {requests.some(
              request =>
                request.status !==
                "Pending",
            ) && (
              <div className="pt-5">
                <p
                  className="
                    mb-3
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.14em]
                    text-gray-400
                  "
                >
                  Request History
                </p>

                <div
                  className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-[#eceef1]
                  "
                >
                  <div className="divide-y divide-[#eceef1]">
                    {requests
                      .filter(
                        request =>
                          request.status !==
                          "Pending",
                      )
                      .map(request => (
                        <div
                          key={request.id}
                          className="
                            flex
                            flex-col
                            gap-3
                            px-4
                            py-4
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                          "
                        >
                          <div>
                            <p className="text-sm font-semibold text-[#111827]">
                              {
                                request.assessmentTitle
                              }
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              Participant{" "}
                              {
                                request.participantId
                              }{" "}
                              · Attempt #
                              {
                                request.attemptNumber
                              }{" "}
                              ·{" "}
                              {
                                request.percentage
                              }%
                            </p>
                          </div>

                          <StatusBadge
                            status={
                              request.status
                            }
                          />
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function RequestCard({
  request,
  isReviewing,
  onReview,
}: {
  request: AssessmentRetakeRequest;
  isReviewing: boolean;
  onReview: (
    request: AssessmentRetakeRequest,
    approve: boolean,
  ) => void;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-amber-200
        bg-amber-50/40
        p-4
        sm:p-5
      "
    >
      <div
        className="
          flex
          flex-col
          gap-5
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold text-[#111827]">
              Participant
            </p>

            <span
              className="
                rounded-md
                bg-white
                px-2
                py-1
                text-[10px]
                font-semibold
                text-gray-500
              "
            >
              {request.participantId}
            </span>

            <StatusBadge status="Pending" />
          </div>

          <p className="mt-2 text-sm font-semibold text-gray-700">
            {request.assessmentTitle}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Info
              label="Attempt"
              value={`#${request.attemptNumber}`}
            />

            <Info
              label="Score"
              value={`${request.percentage}%`}
            />

            <Info
              label="Result"
              value="Failed"
            />

            <Info
              label="Status"
              value="Review"
            />
          </div>

          {request.reason && (
            <div className="mt-3 rounded-xl bg-white/70 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                Participant's reason
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-600">
                {request.reason}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2 lg:w-[190px] lg:flex-col">
          <button
            type="button"
            onClick={() =>
              onReview(request, true)
            }
            disabled={isReviewing}
            className="
              flex-1
              rounded-xl
              bg-[#111827]
              px-4
              py-2.5
              text-xs
              font-bold
              text-white
              hover:bg-black
              disabled:opacity-50
            "
          >
            {isReviewing
              ? "Processing..."
              : "Approve"}
          </button>

          <button
            type="button"
            onClick={() =>
              onReview(request, false)
            }
            disabled={isReviewing}
            className="
              flex-1
              rounded-xl
              border
              border-red-200
              bg-white
              px-4
              py-2.5
              text-xs
              font-bold
              text-red-600
              hover:bg-red-50
              disabled:opacity-50
            "
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white/80 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-gray-800">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: AssessmentRetakeRequest["status"];
}) {
  const classes = {
    Pending:
      "border-amber-200 bg-amber-100 text-amber-700",
    Approved:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    Rejected:
      "border-red-200 bg-red-50 text-red-700",
    Consumed:
      "border-gray-200 bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`
        inline-flex
        rounded-full
        border
        px-2.5
        py-1
        text-[10px]
        font-bold
        ${classes[status]}
      `}
    >
      {status}
    </span>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-dashed
        border-[#dfe3e8]
        px-5
        py-14
        text-center
      "
    >
      <div
        className="
          mx-auto
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          bg-gray-100
          text-lg
          font-bold
          text-gray-400
        "
      >
        ✓
      </div>

      <h3 className="mt-4 text-sm font-bold text-[#111827]">
        {title}
      </h3>

      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-gray-400">
        {description}
      </p>
    </div>
  );
}