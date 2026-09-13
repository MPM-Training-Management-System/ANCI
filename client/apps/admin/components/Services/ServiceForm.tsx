
"use client";

import { useEffect, useState } from "react";

import type {
  CreateService,
  Service,
  UpdateService,
} from "@repo/types";

interface ServiceFormProps {
  service?: Service | null;
  isSubmitting: boolean;
  onSubmit: (
    data: CreateService | UpdateService,
  ) => Promise<void>;
  onCancel: () => void;
}

interface RequirementForm {
  id?: string;
  name: string;
  description: string;
  isRequired: boolean;
  displayOrder: number;
}

export function ServiceForm({
  service,
  isSubmitting,
  onSubmit,
  onCancel,
}: ServiceFormProps) {
  const isEditing = !!service;

  const [serviceCode, setServiceCode] =
    useState("");

  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [requiresTraining, setRequiresTraining] =
    useState(false);

  const [isActive, setIsActive] =
    useState(true);

  const [requirements, setRequirements] =
    useState<RequirementForm[]>([]);

  const [formError, setFormError] =
    useState<string | null>(null);


  useEffect(() => {
    if (service) {
      setServiceCode(service.serviceCode);
      setName(service.name);
      setDescription(service.description ?? "");
      setCategory(service.category);
      setRequiresTraining(service.requiresTraining);
      setIsActive(service.isActive);

      setRequirements(
        service.requirements
          .sort(
            (a, b) =>
              a.displayOrder -
              b.displayOrder,
          )
          .map((requirement) => ({
            id: requirement.id,
            name: requirement.name,
            description:
              requirement.description ?? "",
            isRequired:
              requirement.isRequired,
            displayOrder:
              requirement.displayOrder,
          })),
      );

      return;
    }

    setServiceCode("");
    setName("");
    setDescription("");
    setCategory("");
    setRequiresTraining(false);
    setIsActive(true);
    setRequirements([]);
  }, [service]);


  const addRequirement = () => {
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


  const removeRequirement = (
    index: number,
  ) => {
    setRequirements((current) =>
      current
        .filter((_, i) => i !== index)
        .map((requirement, i) => ({
          ...requirement,
          displayOrder: i + 1,
        })),
    );
  };


  const updateRequirement = (
    index: number,
    field: keyof RequirementForm,
    value: string | boolean,
  ) => {
    setRequirements((current) =>
      current.map((requirement, i) =>
        i === index
          ? {
              ...requirement,
              [field]: value,
            }
          : requirement,
      ),
    );
  };


  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setFormError(null);

    if (!name.trim()) {
      setFormError(
        "Service name is required.",
      );
      return;
    }

    if (!category.trim()) {
      setFormError(
        "Category is required.",
      );
      return;
    }

    if (
      !isEditing &&
      !serviceCode.trim()
    ) {
      setFormError(
        "Service code is required.",
      );
      return;
    }

    const invalidRequirement =
      requirements.some(
        (requirement) =>
          !requirement.name.trim(),
      );

    if (invalidRequirement) {
      setFormError(
        "All requirements must have a name.",
      );
      return;
    }

    if (isEditing) {
      const data: UpdateService = {
        name: name.trim(),
        description:
          description.trim() || null,
        category: category.trim(),
        requiresTraining,
        isActive,
        requirements: requirements.map(
          (requirement) => ({
            id: requirement.id,
            name: requirement.name.trim(),
            description:
              requirement.description.trim() ||
              null,
            isRequired:
              requirement.isRequired,
            displayOrder:
              requirement.displayOrder,
          }),
        ),
      };

      await onSubmit(data);
      return;
    }

    const data: CreateService = {
      serviceCode: serviceCode.trim(),
      name: name.trim(),
      description:
        description.trim() || null,
      category: category.trim(),
      requiresTraining,
      requirements: requirements.map(
        (requirement) => ({
          name: requirement.name.trim(),
          description:
            requirement.description.trim() ||
            null,
          isRequired:
            requirement.isRequired,
          displayOrder:
            requirement.displayOrder,
        }),
      ),
    };

    await onSubmit(data);
  };


  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-6 py-4">
        <h2 className="font-semibold">
          {isEditing
            ? "Edit Service"
            : "Create Service"}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Configure the service and its requirements.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 p-6"
      >
        {formError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Service Code
            </label>

            <input
              value={serviceCode}
              onChange={(event) =>
                setServiceCode(
                  event.target.value,
                )
              }
              disabled={isEditing}
              placeholder="e.g. SRV-001"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:bg-muted"
            />

            {isEditing && (
              <p className="text-xs text-muted-foreground">
                Service code cannot be changed.
              </p>
            )}
          </div>


          <div className="space-y-2">
            <label className="text-sm font-medium">
              Category
            </label>

            <input
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value,
                )
              }
              placeholder="e.g. Training"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>


        <div className="space-y-2">
          <label className="text-sm font-medium">
            Service Name
          </label>

          <input
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="Enter service name"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>


        <div className="space-y-2">
          <label className="text-sm font-medium">
            Description
          </label>

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value,
              )
            }
            rows={4}
            placeholder="Describe the service..."
            className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>


        <div className="flex flex-wrap gap-6">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={requiresTraining}
              onChange={(event) =>
                setRequiresTraining(
                  event.target.checked,
                )
              }
              className="h-4 w-4"
            />

            Requires Training
          </label>


          {isEditing && (
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) =>
                  setIsActive(
                    event.target.checked,
                  )
                }
                className="h-4 w-4"
              />

              Active
            </label>
          )}
        </div>


        {/* REQUIREMENTS */}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">
                Service Requirements
              </h3>

              <p className="text-xs text-muted-foreground">
                Documents or information required from the client.
              </p>
            </div>

            <button
              type="button"
              onClick={addRequirement}
              className="rounded-md border px-3 py-2 text-xs font-medium hover:bg-muted"
            >
              + Add Requirement
            </button>
          </div>


          {requirements.length === 0 && (
            <div className="rounded-md border border-dashed p-6 text-center">
              <p className="text-sm text-muted-foreground">
                No requirements added.
              </p>
            </div>
          )}


          <div className="space-y-3">
            {requirements.map(
              (requirement, index) => (
                <div
                  key={
                    requirement.id ??
                    `new-${index}`
                  }
                  className="rounded-md border p-4"
                >
                  <div className="grid gap-4 md:grid-cols-[60px_1fr_1fr_auto]">
                    <div className="space-y-2">
                      <label className="text-xs font-medium">
                        #
                      </label>

                      <input
                        value={
                          requirement.displayOrder
                        }
                        readOnly
                        className="w-full rounded-md border bg-muted px-2 py-2 text-sm text-center"
                      />
                    </div>


                    <div className="space-y-2">
                      <label className="text-xs font-medium">
                        Requirement
                      </label>

                      <input
                        value={
                          requirement.name
                        }
                        onChange={(event) =>
                          updateRequirement(
                            index,
                            "name",
                            event.target.value,
                          )
                        }
                        placeholder="e.g. Valid ID"
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                      />
                    </div>


                    <div className="space-y-2">
                      <label className="text-xs font-medium">
                        Description
                      </label>

                      <input
                        value={
                          requirement.description
                        }
                        onChange={(event) =>
                          updateRequirement(
                            index,
                            "description",
                            event.target.value,
                          )
                        }
                        placeholder="Requirement description"
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                      />
                    </div>


                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() =>
                          removeRequirement(
                            index,
                          )
                        }
                        className="rounded-md border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>


                  <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={
                        requirement.isRequired
                      }
                      onChange={(event) =>
                        updateRequirement(
                          index,
                          "isRequired",
                          event.target.checked,
                        )
                      }
                      className="h-4 w-4"
                    />

                    Required
                  </label>
                </div>
              ),
            )}
          </div>
        </div>


        <div className="flex justify-end gap-3 border-t pt-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving..."
              : isEditing
                ? "Update Service"
                : "Create Service"}
          </button>
        </div>
      </form>
    </div>
  );
}

