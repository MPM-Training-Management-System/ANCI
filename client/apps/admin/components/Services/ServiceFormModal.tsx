"use client";

import { useEffect, useState } from "react";

import type {
  CreateService,
  Service,
  UpdateService,
} from "@repo/types";

interface ServiceFormModalProps {
  open: boolean;
  service: Service | null;
  isSubmitting: boolean;
  onSubmit: (
    data: CreateService | UpdateService
  ) => Promise<void>;
  onClose: () => void;
}

interface RequirementForm {
  id?: string;
  name: string;
  description: string;
  isRequired: boolean;
  displayOrder: number;
}

export function ServiceFormModal({
  open,
  service,
  isSubmitting,
  onSubmit,
  onClose,
}: ServiceFormModalProps) {
  const isEdit = Boolean(service);

  // ============================================================
  // FORM STATE
  // ============================================================

  const [serviceCode, setServiceCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [requiresTraining, setRequiresTraining] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [requirements, setRequirements] = useState<
    RequirementForm[]
  >([]);

  const [formError, setFormError] = useState<string | null>(null);

  // ============================================================
  // IMAGE STATE
  // ============================================================

  // Actual image file that will be uploaded to Cloudinary
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Image used only for preview
  const [imagePreview, setImagePreview] = useState<string | null>(
    null
  );

  // ============================================================
  // INITIALIZE FORM
  // ============================================================

  useEffect(() => {
    if (service) {
      setServiceCode(service.serviceCode);
      setName(service.name);
      setDescription(service.description ?? "");
      setCategory(service.category);
      setRequiresTraining(service.requiresTraining);
      setIsActive(service.isActive);

      setRequirements(
        (service.requirements ?? []).map(
          (requirement, index) => ({
            id: requirement.id,
            name: requirement.name,
            description: requirement.description ?? "",
            isRequired: requirement.isRequired,
            displayOrder:
              requirement.displayOrder ?? index + 1,
          })
        )
      );

      // Existing Cloudinary image is only for preview.
      // We do NOT put the URL into imageFile.
      setImageFile(null);
      setImagePreview(service.imageUrl ?? null);
    } else {
      setServiceCode("");
      setName("");
      setDescription("");
      setCategory("");
      setRequiresTraining(false);
      setIsActive(true);
      setRequirements([]);

      setImageFile(null);
      setImagePreview(null);
    }

    setFormError(null);
  }, [service]);

  // ============================================================
  // IMAGE PREVIEW CLEANUP
  // ============================================================

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // ============================================================
  // ADD REQUIREMENT
  // ============================================================

  const handleAddRequirement = () => {
    setRequirements((current) => [
      ...current,
      {
        name: "",
        description: "",
        isRequired: true,
        displayOrder: current.length + 1,
      },
    ]);
  };

  // ============================================================
  // REMOVE REQUIREMENT
  // ============================================================

  const handleRemoveRequirement = (index: number) => {
    setRequirements((current) =>
      current
        .filter(
          (_, itemIndex) => itemIndex !== index
        )
        .map((item, itemIndex) => ({
          ...item,
          displayOrder: itemIndex + 1,
        }))
    );
  };

  // ============================================================
  // UPDATE REQUIREMENT
  // ============================================================

  const handleRequirementChange = (
    index: number,
    field: keyof RequirementForm,
    value: string | boolean
  ) => {
    setRequirements((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  // ============================================================
  // IMAGE CHANGE
  // ============================================================

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Validate image type
    if (
      ![
        "image/jpeg",
        "image/png",
        "image/webp",
      ].includes(file.type)
    ) {
      setFormError(
        "Please select a JPG, PNG, or WEBP image."
      );

      event.target.value = "";
      return;
    }

    // Validate image size
    if (file.size > 5 * 1024 * 1024) {
      setFormError(
        "Image size must not exceed 5MB."
      );

      event.target.value = "";
      return;
    }

    setFormError(null);

    // IMPORTANT:
    // Save the actual File object.
    setImageFile(file);

    // Create preview
    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);

    // Allow selecting the same file again
    event.target.value = "";
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setFormError(null);

    // ----------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------

    if (!isEdit && !serviceCode.trim()) {
      setFormError(
        "Service code is required."
      );
      return;
    }

    if (!name.trim()) {
      setFormError(
        "Service name is required."
      );
      return;
    }

    if (!category.trim()) {
      setFormError(
        "Category is required."
      );
      return;
    }

    const hasEmptyRequirement = requirements.some(
      (requirement) =>
        !requirement.name.trim()
    );

    if (hasEmptyRequirement) {
      setFormError(
        "All requirements must have a name."
      );
      return;
    }

    // ==========================================================
    // CREATE SERVICE
    // ==========================================================

    if (!isEdit) {
      const payload: CreateService = {
        serviceCode: serviceCode.trim(),

        name: name.trim(),

        description:
          description.trim() || null,

        category: category.trim(),

        // IMPORTANT:
        // This was missing before.
        image: imageFile,

        requiresTraining,

        requirements: requirements.map(
          (requirement, index) => ({
            name: requirement.name.trim(),

            description:
              requirement.description.trim() ||
              null,

            isRequired:
              requirement.isRequired,

            displayOrder: index + 1,
          })
        ),
      };

      console.log(
        "========== CREATE SERVICE =========="
      );

      console.log(
        "IMAGE FILE:",
        imageFile
      );

      if (imageFile) {
        console.log({
          name: imageFile.name,
          type: imageFile.type,
          size: imageFile.size,
        });
      }

      console.log(
        "===================================="
      );

      await onSubmit(payload);

      return;
    }

    // ==========================================================
    // UPDATE SERVICE
    // ==========================================================

    const payload: UpdateService = {
      name: name.trim(),

      description:
        description.trim() || null,

      category: category.trim(),

      // IMPORTANT:
      // New selected image is sent here.
      // If null, backend keeps the existing image.
      image: imageFile,

      requiresTraining,

      isActive,

      requirements: requirements.map(
        (requirement, index) => ({
          id: requirement.id,

          name: requirement.name.trim(),

          description:
            requirement.description.trim() ||
            null,

          isRequired:
            requirement.isRequired,

          displayOrder: index + 1,
        })
      ),
    };

    console.log(
      "========== UPDATE SERVICE =========="
    );

    console.log(
      "IMAGE FILE:",
      imageFile
    );

    if (imageFile) {
      console.log({
        name: imageFile.name,
        type: imageFile.type,
        size: imageFile.size,
      });
    }

    console.log(
      "===================================="
    );

    await onSubmit(payload);
  };

  // ============================================================
  // RENDER
  // ============================================================

  if (!open) {
    return null;
  }

  return (
    <div
      className="
        fixed inset-0 z-[100]
        flex items-center justify-center
        bg-black/40 p-3
        backdrop-blur-sm
        sm:p-5
      "
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !isSubmitting
        ) {
          onClose();
        }
      }}
    >
      <div
        className="
          flex max-h-[92vh] w-full max-w-3xl
          flex-col overflow-hidden
          rounded-2xl bg-white shadow-2xl
        "
      >
        {/* ======================================================
            HEADER
        ====================================================== */}

        <div
          className="
            flex shrink-0 items-start
            justify-between
            border-b border-gray-200
            bg-white px-6 py-5
          "
        >
          <div className="min-w-0 pr-4">
            <p
              className="
                mb-1 text-[10px]
                font-bold uppercase
                tracking-wider text-gray-400
              "
            >
              Administration / Services
            </p>

            <h2 className="text-xl font-bold text-gray-900">
              {isEdit
                ? "Edit Service"
                : "Create Service"}
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              {isEdit
                ? "Update the service information and requirements."
                : "Add a new service offered by ACE NextGen Consultancy Inc."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="
              flex h-9 w-9 shrink-0
              items-center justify-center
              rounded-xl bg-gray-100
              text-xl text-gray-500
              transition hover:bg-gray-200
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* ======================================================
            FORM
        ====================================================== */}

        <form
          onSubmit={handleSubmit}
          className="
            min-h-0 flex-1
            overflow-y-auto
          "
        >
          <div className="space-y-6 px-6 py-6">

            {/* ERROR */}

            {formError && (
              <div
                className="
                  rounded-xl
                  border border-red-200
                  bg-red-50 px-4 py-3
                "
              >
                <p className="text-xs font-medium text-red-700">
                  {formError}
                </p>
              </div>
            )}

            {/* ==================================================
                BASIC INFORMATION
            ================================================== */}

            <section>
              <div className="mb-4">
                <p
                  className="
                    text-[10px] font-bold
                    uppercase tracking-wider
                    text-gray-400
                  "
                >
                  Basic Information
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Provide the main information for
                  this service.
                </p>
              </div>

              <div
                className="
                  grid grid-cols-1
                  gap-4 sm:grid-cols-2
                "
              >
                {/* SERVICE CODE */}

                <FormField
                  label="Service Code"
                  required={!isEdit}
                >
                  <input
                    type="text"
                    value={serviceCode}
                    onChange={(event) =>
                      setServiceCode(
                        event.target.value
                      )
                    }
                    disabled={
                      isEdit ||
                      isSubmitting
                    }
                    placeholder="e.g. SRV-001"
                    className={inputClass}
                  />

                  {isEdit && (
                    <p className="mt-1.5 text-[10px] text-gray-400">
                      Service code cannot be
                      changed after creation.
                    </p>
                  )}
                </FormField>

                {/* SERVICE NAME */}

                <FormField
                  label="Service Name"
                  required
                >
                  <input
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(
                        event.target.value
                      )
                    }
                    disabled={isSubmitting}
                    placeholder="Enter service name"
                    className={inputClass}
                  />
                </FormField>

                {/* CATEGORY */}

                <FormField
                  label="Category"
                  required
                >
                  <input
                    type="text"
                    value={category}
                    onChange={(event) =>
                      setCategory(
                        event.target.value
                      )
                    }
                    disabled={isSubmitting}
                    placeholder="e.g. Training, Consultancy"
                    className={inputClass}
                  />
                </FormField>

                {/* DESCRIPTION */}

                <FormField label="Description">
                  <input
                    type="text"
                    value={description}
                    onChange={(event) =>
                      setDescription(
                        event.target.value
                      )
                    }
                    disabled={isSubmitting}
                    placeholder="Short service description"
                    className={inputClass}
                  />
                </FormField>
              </div>
            </section>

            {/* ==================================================
                SERVICE IMAGE
            ================================================== */}

            <section>
              <div className="mb-4">
                <p
                  className="
                    text-[10px] font-bold
                    uppercase tracking-wider
                    text-gray-400
                  "
                >
                  Service Image
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Upload an image that will be displayed
                  on the public landing page.
                </p>
              </div>

              <div
                className="
                  rounded-2xl
                  border border-dashed
                  border-gray-300
                  bg-gray-50 p-5
                "
              >
                {imagePreview ? (
                  <div className="space-y-4">

                    {/* PREVIEW */}

                    <div
                      className="
                        relative overflow-hidden
                        rounded-xl
                        border border-gray-200
                        bg-white
                      "
                    >
                      <img
                        src={imagePreview}
                        alt="Service preview"
                        className="
                          h-48 w-full
                          object-cover
                        "
                      />
                    </div>

                    {/* IMAGE INFO */}

                    <div
                      className="
                        flex items-center
                        justify-between
                        gap-3
                      "
                    >
                      <div className="min-w-0">
                        <p
                          className="
                            truncate text-xs
                            font-semibold
                            text-gray-700
                          "
                        >
                          {imageFile?.name ??
                            "Current service image"}
                        </p>

                        <p className="mt-1 text-[10px] text-gray-400">
                          Recommended: JPG, PNG, or WEBP
                          • Maximum 5MB
                        </p>
                      </div>

                      <label
                        className="
                          shrink-0 cursor-pointer
                          rounded-xl
                          border border-gray-200
                          bg-white px-4 py-2.5
                          text-xs font-semibold
                          text-gray-600
                          transition
                          hover:bg-gray-100
                        "
                      >
                        Change Image

                        <input
                          type="file"
                          accept="
                            image/png,
                            image/jpeg,
                            image/webp
                          "
                          onChange={
                            handleImageChange
                          }
                          disabled={
                            isSubmitting
                          }
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label
                    className="
                      flex cursor-pointer
                      flex-col items-center
                      justify-center
                      rounded-xl
                      border border-transparent
                      px-5 py-8
                      text-center
                      transition
                      hover:bg-white
                    "
                  >
                    <div
                      className="
                        flex h-12 w-12
                        items-center
                        justify-center
                        rounded-xl
                        bg-gray-200
                        text-xl text-gray-500
                      "
                    >
                      ↑
                    </div>

                    <p className="mt-3 text-sm font-semibold text-gray-700">
                      Upload Service Image
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      PNG, JPG, or WEBP up to 5MB
                    </p>

                    <span
                      className="
                        mt-4 rounded-xl
                        bg-[#17191c]
                        px-4 py-2.5
                        text-xs font-semibold
                        text-white
                      "
                    >
                      Choose Image
                    </span>

                    <input
                      type="file"
                      accept="
                        image/png,
                        image/jpeg,
                        image/webp
                      "
                      onChange={
                        handleImageChange
                      }
                      disabled={isSubmitting}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </section>

            {/* ==================================================
                SETTINGS
            ================================================== */}

            <section
              className="
                rounded-2xl
                border border-gray-200
                p-5
              "
            >
              <p
                className="
                  text-[10px] font-bold
                  uppercase tracking-wider
                  text-gray-400
                "
              >
                Service Settings
              </p>

              <div className="mt-4 space-y-3">
                <ToggleRow
                  title="Requires Training"
                  description="
                    Indicates whether this service
                    requires participant training.
                  "
                  checked={requiresTraining}
                  onChange={
                    setRequiresTraining
                  }
                  disabled={isSubmitting}
                />

                {isEdit && (
                  <ToggleRow
                    title="Active Service"
                    description="
                      Inactive services will no longer
                      be available for new requests.
                    "
                    checked={isActive}
                    onChange={setIsActive}
                    disabled={isSubmitting}
                  />
                )}
              </div>
            </section>

            {/* ==================================================
                REQUIREMENTS
            ================================================== */}

            <section>
              <div
                className="
                  flex flex-col gap-3
                  sm:flex-row
                  sm:items-end
                  sm:justify-between
                "
              >
                <div>
                  <p
                    className="
                      text-[10px] font-bold
                      uppercase tracking-wider
                      text-gray-400
                    "
                  >
                    Service Requirements
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Define the documents or
                    information required from
                    clients.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    handleAddRequirement
                  }
                  disabled={isSubmitting}
                  className="
                    rounded-xl
                    border border-gray-200
                    bg-white
                    px-4 py-2.5
                    text-xs font-semibold
                    text-gray-600
                    transition
                    hover:bg-gray-50
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  + Add Requirement
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {requirements.length === 0 && (
                  <div
                    className="
                      rounded-2xl
                      border border-dashed
                      border-gray-300
                      bg-gray-50
                      px-5 py-8
                      text-center
                    "
                  >
                    <p className="text-sm font-semibold text-gray-600">
                      No requirements added
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Add requirements if clients
                      need to submit documents or
                      information.
                    </p>
                  </div>
                )}

                {requirements.map(
                  (requirement, index) => (
                    <div
                      key={
                        requirement.id ??
                        `requirement-${index}`
                      }
                      className="
                        rounded-2xl
                        border border-gray-200
                        p-4
                      "
                    >
                      <div
                        className="
                          flex items-center
                          justify-between
                        "
                      >
                        <div
                          className="
                            flex items-center
                            gap-3
                          "
                        >
                          <div
                            className="
                              flex h-7 w-7
                              items-center
                              justify-center
                              rounded-lg
                              bg-gray-100
                              text-xs
                              font-bold
                              text-gray-500
                            "
                          >
                            {index + 1}
                          </div>

                          <p className="text-xs font-semibold text-gray-600">
                            Requirement
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveRequirement(
                              index
                            )
                          }
                          disabled={
                            isSubmitting
                          }
                          className="
                            text-xs
                            font-semibold
                            text-red-500
                            transition
                            hover:text-red-700
                            disabled:opacity-50
                          "
                        >
                          Remove
                        </button>
                      </div>

                      <div
                        className="
                          mt-3 grid
                          grid-cols-1
                          gap-3
                          sm:grid-cols-2
                        "
                      >
                        <input
                          type="text"
                          value={
                            requirement.name
                          }
                          onChange={(event) =>
                            handleRequirementChange(
                              index,
                              "name",
                              event.target.value
                            )
                          }
                          disabled={
                            isSubmitting
                          }
                          placeholder="Requirement name"
                          className={inputClass}
                        />

                        <input
                          type="text"
                          value={
                            requirement.description
                          }
                          onChange={(event) =>
                            handleRequirementChange(
                              index,
                              "description",
                              event.target.value
                            )
                          }
                          disabled={
                            isSubmitting
                          }
                          placeholder="Description"
                          className={inputClass}
                        />
                      </div>

                      <label
                        className="
                          mt-3 flex
                          cursor-pointer
                          items-center gap-2
                        "
                      >
                        <input
                          type="checkbox"
                          checked={
                            requirement.isRequired
                          }
                          onChange={(event) =>
                            handleRequirementChange(
                              index,
                              "isRequired",
                              event.target.checked
                            )
                          }
                          disabled={
                            isSubmitting
                          }
                          className="
                            h-4 w-4
                            rounded
                            border-gray-300
                          "
                        />

                        <span className="text-xs font-medium text-gray-600">
                          Required
                        </span>
                      </label>
                    </div>
                  )
                )}
              </div>
            </section>
          </div>

          {/* ====================================================
              FOOTER
          ==================================================== */}

          <div
            className="
              sticky bottom-0
              flex shrink-0
              justify-end gap-2
              border-t border-gray-200
              bg-gray-50
              px-6 py-4
            "
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="
                rounded-xl
                border border-gray-200
                bg-white
                px-5 py-3
                text-xs font-semibold
                text-gray-600
                transition
                hover:bg-gray-50
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="
                rounded-xl
                bg-[#17191c]
                px-5 py-3
                text-xs font-semibold
                text-white
                transition
                hover:bg-black
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {isSubmitting
                ? isEdit
                  ? "Saving..."
                  : "Creating..."
                : isEdit
                  ? "Save Changes"
                  : "Create Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// FORM FIELD
// ============================================================

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="
          mb-1.5 block
          text-xs font-semibold
          text-gray-700
        "
      >
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

// ============================================================
// TOGGLE ROW
// ============================================================

function ToggleRow({
  title,
  description,
  checked,
  onChange,
  disabled,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled: boolean;
}) {
  return (
    <label
      className="
        flex cursor-pointer
        items-center
        justify-between
        gap-4
        rounded-xl
        bg-gray-50
        p-4
      "
    >
      <div>
        <p className="text-sm font-semibold text-gray-800">
          {title}
        </p>

        <p className="mt-1 text-xs text-gray-400">
          {description}
        </p>
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
        disabled={disabled}
        className="
          h-5 w-5
          rounded
          border-gray-300
        "
      />
    </label>
  );
}

// ============================================================
// INPUT CLASS
// ============================================================

const inputClass =
  "h-11 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-4 text-sm outline-none transition placeholder:text-gray-400 focus:bg-white focus:ring-1 focus:ring-gray-300 disabled:cursor-not-allowed disabled:opacity-60";