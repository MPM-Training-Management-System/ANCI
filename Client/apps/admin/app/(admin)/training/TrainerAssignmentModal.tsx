"use client";

import {
  useEffect,
  useState,
} from "react";

import type {
  TrainerProfile,
  TrainingBatch,
} from "@repo/types";


// ============================================================
// PROPS
// ============================================================

interface TrainerAssignmentModalProps {
  batch: TrainingBatch;

  trainers: TrainerProfile[];

  currentTrainerId?: string | null;

  isLoading?: boolean;

  isAssigning?: boolean;

  onAssign: (
    trainerProfileId: string,
    trainingBatchId: string
  ) => Promise<void>;

  onRemove?: () => Promise<void>;

  onClose: () => void;
}


// ============================================================
// COMPONENT
// ============================================================

export default function TrainerAssignmentModal({
  batch,
  trainers,
  currentTrainerId = null,
  isLoading = false,
  isAssigning = false,
  onAssign,
  onRemove,
  onClose,
}: TrainerAssignmentModalProps) {

  const [
    selectedTrainerId,
    setSelectedTrainerId,
  ] = useState(
    currentTrainerId ?? ""
  );


  // ==========================================================
  // SYNC CURRENT TRAINER
  // ==========================================================

  useEffect(() => {

    setSelectedTrainerId(
      currentTrainerId ?? ""
    );

  }, [
    currentTrainerId,
  ]);


  // ==========================================================
  // ACTIVE TRAINERS ONLY
  // ==========================================================

  const activeTrainers =
    trainers.filter(
      trainer =>
        trainer.isActive
    );


  // ==========================================================
  // SELECTED TRAINER
  // ==========================================================

  const selectedTrainer =
    activeTrainers.find(
      trainer =>
        trainer.id ===
        selectedTrainerId
    ) ?? null;


  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleAssign =
    async () => {

      if (
        !selectedTrainerId
      ) {

        alert(
          "Please select a trainer."
        );

        return;
      }


      try {

        await onAssign(
          selectedTrainerId,
          batch.id
        );

      } catch (error) {

        console.error(
          "ASSIGN TRAINER MODAL ERROR:",
          error
        );

      }

    };


  // ==========================================================
  // REMOVE
  // ==========================================================

  const handleRemove =
    async () => {

      if (!onRemove) {
        return;
      }


      const confirmed =
        window.confirm(
          `Remove the trainer assignment from ${batch.batchCode}?`
        );


      if (!confirmed) {
        return;
      }


      try {

        await onRemove();

      } catch (error) {

        console.error(
          "REMOVE TRAINER MODAL ERROR:",
          error
        );

      }

    };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      className="
        fixed
        inset-0
        z-[160]
        flex
        items-center
        justify-center
        bg-black/40
        p-4
        backdrop-blur-sm
      "
      onMouseDown={(event) => {

        if (
          event.target ===
          event.currentTarget
        ) {

          onClose();

        }

      }}
    >

      <div
        className="
          flex
          max-h-[90vh]
          w-full
          max-w-xl
          flex-col
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
        "
      >

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div
          className="
            flex
            shrink-0
            items-start
            justify-between
            border-b
            border-[#eef0f2]
            px-6
            py-5
          "
        >

          <div>

            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.1em]
                text-gray-400
              "
            >
              Trainer Assignment
            </p>

            <h2
              className="
                mt-1
                text-xl
                font-bold
                tracking-tight
                text-gray-900
              "
            >
              Assign Trainer
            </h2>

            <p
              className="
                mt-1
                text-xs
                text-gray-500
              "
            >
              {batch.programName}
            </p>

          </div>


          <button
            type="button"
            onClick={onClose}
            disabled={isAssigning}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              bg-gray-100
              text-lg
              text-gray-500
              hover:bg-gray-200
              disabled:opacity-50
            "
          >
            ×
          </button>

        </div>


        {/* ================================================== */}
        {/* BODY */}
        {/* ================================================== */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            px-6
            py-6
          "
        >

          <div className="space-y-5">


            {/* ============================================== */}
            {/* BATCH INFORMATION */}
            {/* ============================================== */}

            <div
              className="
                rounded-2xl
                bg-[#f7f8fa]
                p-5
              "
            >

              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-4
                "
              >

                <div>

                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wide
                      text-gray-400
                    "
                  >
                    Training Batch
                  </p>

                  <p
                    className="
                      mt-1
                      font-mono
                      text-sm
                      font-bold
                      text-gray-900
                    "
                  >
                    {batch.batchCode}
                  </p>

                </div>


                <div className="text-right">

                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wide
                      text-gray-400
                    "
                  >
                    Capacity
                  </p>

                  <p
                    className="
                      mt-1
                      text-sm
                      font-semibold
                      text-gray-800
                    "
                  >
                    {batch.enrolledCount} /{" "}
                    {batch.capacity}
                  </p>

                </div>

              </div>


              <div
                className="
                  mt-4
                  grid
                  grid-cols-1
                  gap-3
                  sm:grid-cols-2
                "
              >

                <BatchInfo
                  label="Start Date"
                  value={formatDate(batch.startDate)}
                />

                <BatchInfo
                  label="End Date"
                  value={formatDate(batch.endDate)}
                />

                <BatchInfo
                  label="Location"
                  value={
                    batch.location ??
                    "Not configured"
                  }
                />

                <BatchInfo
                  label="Status"
                  value={batch.status}
                />

              </div>

            </div>


            {/* ============================================== */}
            {/* TRAINER SELECTION */}
            {/* ============================================== */}

            <div>

              <label
                className="
                  mb-1.5
                  block
                  text-[11px]
                  font-bold
                  text-gray-600
                "
              >
                Select Trainer
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>


              {isLoading ? (

                <div
                  className="
                    rounded-xl
                    border
                    border-[#e7e9ec]
                    bg-[#fafbfc]
                    p-5
                    text-center
                    text-xs
                    text-gray-500
                  "
                >
                  Loading active trainers...
                </div>

              ) : activeTrainers.length === 0 ? (

                <div
                  className="
                    rounded-xl
                    border
                    border-dashed
                    border-gray-300
                    bg-gray-50
                    p-6
                    text-center
                  "
                >

                  <p
                    className="
                      text-xs
                      font-semibold
                      text-gray-700
                    "
                  >
                    No active trainers available
                  </p>

                  <p
                    className="
                      mt-1
                      text-[11px]
                      leading-5
                      text-gray-500
                    "
                  >
                    There are currently no active
                    trainers available for assignment.
                  </p>

                </div>

              ) : (

                <select
                  value={selectedTrainerId}
                  onChange={(event) =>
                    setSelectedTrainerId(
                      event.target.value
                    )
                  }
                  disabled={isAssigning}
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-[#e7e9ec]
                    bg-[#fafbfc]
                    px-3
                    text-xs
                    outline-none
                    focus:border-gray-300
                    focus:bg-white
                    disabled:opacity-50
                  "
                >

                  <option value="">
                    Select a trainer
                  </option>

                  {activeTrainers.map(
                    (trainer) => (

                      <option
                        key={trainer.id}
                        value={trainer.id}
                      >
                        {trainer.fullName}
                        {" — "}
                        {trainer.specialization}
                      </option>

                    )
                  )}

                </select>

              )}

            </div>


            {/* ============================================== */}
            {/* SELECTED TRAINER PREVIEW */}
            {/* ============================================== */}

            {selectedTrainer && (

              <div
                className="
                  rounded-2xl
                  border
                  border-[#e7e9ec]
                  bg-white
                  p-5
                "
              >

                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-gray-400
                  "
                >
                  Selected Trainer
                </p>


                <div
                  className="
                    mt-4
                    flex
                    items-center
                    gap-4
                  "
                >

                  {/* PROFILE IMAGE */}

                  <div
                    className="
                      h-14
                      w-14
                      shrink-0
                      overflow-hidden
                      rounded-2xl
                      bg-gray-900
                    "
                  >

                    {selectedTrainer.profileImageUrl ? (

                      <img
                        src={
                          selectedTrainer.profileImageUrl
                        }
                        alt={
                          selectedTrainer.fullName
                        }
                        className="
                          h-full
                          w-full
                          object-cover
                        "
                      />

                    ) : (

                      <div
                        className="
                          flex
                          h-full
                          w-full
                          items-center
                          justify-center
                          text-sm
                          font-bold
                          text-white
                        "
                      >
                        {getInitials(
                          selectedTrainer
                        )}
                      </div>

                    )}

                  </div>


                  {/* DETAILS */}

                  <div className="min-w-0 flex-1">

                    <p
                      className="
                        truncate
                        text-sm
                        font-bold
                        text-gray-900
                      "
                    >
                      {selectedTrainer.fullName}
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-gray-500
                      "
                    >
                      {selectedTrainer.specialization ||
                        "No specialization provided"}
                    </p>

                    <p
                      className="
                        mt-1
                        text-[10px]
                        text-gray-400
                      "
                    >
                      {selectedTrainer.yearsOfExperience ??
                        0}{" "}
                      years of experience
                    </p>

                  </div>


                  {/* ACTIVE */}

                  <span
                    className="
                      rounded-full
                      bg-green-50
                      px-2.5
                      py-1
                      text-[10px]
                      font-bold
                      text-green-700
                    "
                  >
                    Active
                  </span>

                </div>

              </div>

            )}


            {/* ============================================== */}
            {/* INFORMATION */}
            {/* ============================================== */}

            <div
              className="
                flex
                items-start
                gap-3
                rounded-2xl
                border
                border-blue-100
                bg-blue-50/70
                p-4
              "
            >

              <div
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-100
                  text-xs
                  font-bold
                  text-blue-700
                "
              >
                i
              </div>

              <div>

                <p
                  className="
                    text-xs
                    font-semibold
                    text-blue-900
                  "
                >
                  Trainer assignment
                </p>

                <p
                  className="
                    mt-1
                    text-[11px]
                    leading-5
                    text-blue-700
                  "
                >
                  The selected trainer will be
                  assigned to this training batch.
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* ================================================== */}
        {/* FOOTER */}
        {/* ================================================== */}

        <div
          className="
            flex
            shrink-0
            flex-col
            gap-2
            border-t
            border-[#eef0f2]
            bg-white
            px-6
            py-4
            sm:flex-row
            sm:justify-end
          "
        >

          {currentTrainerId &&
            onRemove && (

            <button
              type="button"
              onClick={handleRemove}
              disabled={isAssigning}
              className="
                rounded-xl
                border
                border-red-200
                bg-red-50
                px-5
                py-3
                text-xs
                font-semibold
                text-red-700
                hover:bg-red-100
                disabled:opacity-50
                sm:mr-auto
              "
            >
              Remove Assignment
            </button>

          )}


          <button
            type="button"
            onClick={onClose}
            disabled={isAssigning}
            className="
              rounded-xl
              border
              border-[#e7e9ec]
              px-5
              py-3
              text-xs
              font-semibold
              text-gray-600
              disabled:opacity-50
            "
          >
            Cancel
          </button>


          <button
            type="button"
            onClick={handleAssign}
            disabled={
              isAssigning ||
              isLoading ||
              !selectedTrainerId
            }
            className="
              rounded-xl
              bg-[#191c1e]
              px-5
              py-3
              text-xs
              font-semibold
              text-white
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {isAssigning
              ? "Assigning..."
              : currentTrainerId
                ? "Change Trainer"
                : "Assign Trainer"}
          </button>

        </div>

      </div>

    </div>
  );
}


// ============================================================
// BATCH INFO
// ============================================================

function BatchInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {

  return (
    <div>

      <p
        className="
          text-[9px]
          font-bold
          uppercase
          tracking-wide
          text-gray-400
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          truncate
          text-xs
          font-semibold
          text-gray-800
        "
      >
        {value}
      </p>

    </div>
  );
}


// ============================================================
// DATE FORMAT
// ============================================================

function formatDate(
  value: string
): string {

  if (!value) {
    return "Not configured";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}


// ============================================================
// INITIALS
// ============================================================

function getInitials(
  trainer: TrainerProfile
): string {

  const first =
    trainer.firstName
      ?.charAt(0)
      .toUpperCase() ?? "";

  const last =
    trainer.lastName
      ?.charAt(0)
      .toUpperCase() ?? "";

  return (
    `${first}${last}` ||
    "TR"
  );
}