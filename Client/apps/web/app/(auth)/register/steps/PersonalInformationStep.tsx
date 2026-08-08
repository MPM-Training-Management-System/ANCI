"use client";

import { useFormContext } from "react-hook-form";

import {
  FileUpload,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@repo/ui/index";

import type { RegisterTrainerForm } from "../../../../../../packages/types/src/trainer";

export default function PersonalInformationStep() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<RegisterTrainerForm>();

  return (
    <div className="space-y-8">
      {/* Header */}

      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Personal Information
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Please provide your personal information.
        </p>
      </div>

      {/* Profile Image

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Profile Image
        </label>

        <FileUpload
          accept="image/*"
          multiple={false}
          onChange={(files) =>
            setValue("profileImage", files[0])
          }
        />

        {errors.profileImage && (
          <p className="text-sm text-red-500">
            {String(errors.profileImage.message)}
          </p>
        )}
      </div> */}

      {/* Form */}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

        {/* First Name */}

        <div className="space-y-2">
          <label className="text-sm font-medium">
            First Name
          </label>

          <Input
            placeholder="Juan"
            {...register("firstName")}
          />

          {errors.firstName && (
            <p className="text-sm text-red-500">
              {errors.firstName.message}
            </p>
          )}
        </div>

        {/* Middle Name */}

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Middle Name
          </label>

          <Input
            placeholder="Santos"
            {...register("middleName")}
          />

          {errors.middleName && (
            <p className="text-sm text-red-500">
              {errors.middleName.message}
            </p>
          )}
        </div>

        {/* Last Name */}

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Last Name
          </label>

          <Input
            placeholder="Dela Cruz"
            {...register("lastName")}
          />

          {errors.lastName && (
            <p className="text-sm text-red-500">
              {errors.lastName.message}
            </p>
          )}
        </div>

        {/* Date Of Birth */}

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Date of Birth
          </label>

          <Input
            type="date"
            {...register("dateOfBirth")}
          />

          {errors.dateOfBirth && (
            <p className="text-sm text-red-500">
              {errors.dateOfBirth.message}
            </p>
          )}
        </div>

        {/* Gender */}

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Gender
          </label>

          <Select
            value={watch("gender")}
            onValueChange={(value) =>
              setValue("gender", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Gender" />
            </SelectTrigger>

            <SelectContent>

              <SelectItem value="Male">
                Male
              </SelectItem>

              <SelectItem value="Female">
                Female
              </SelectItem>

              <SelectItem value="Other">
                Other
              </SelectItem>

            </SelectContent>

          </Select>

          {errors.gender && (
            <p className="text-sm text-red-500">
              {errors.gender.message}
            </p>
          )}
        </div>

        {/* Civil Status */}

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Civil Status
          </label>

          <Select
            value={watch("civilStatus")}
            onValueChange={(value) =>
              setValue("civilStatus", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Civil Status" />
            </SelectTrigger>

            <SelectContent>

              <SelectItem value="Single">
                Single
              </SelectItem>

              <SelectItem value="Married">
                Married
              </SelectItem>

              <SelectItem value="Separated">
                Separated
              </SelectItem>

              <SelectItem value="Widowed">
                Widowed
              </SelectItem>

            </SelectContent>

          </Select>

          {errors.civilStatus && (
            <p className="text-sm text-red-500">
              {errors.civilStatus.message}
            </p>
          )}
        </div>

        {/* Mobile */}

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Mobile Number
          </label>

          <Input
            placeholder="09XXXXXXXXX"
            {...register("mobileNumber")}
          />

          {errors.mobileNumber && (
            <p className="text-sm text-red-500">
              {errors.mobileNumber.message}
            </p>
          )}
        </div>

        {/* Address */}

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Home Address
          </label>

          <Textarea
            rows={4}
            placeholder="Complete Address"
            {...register("homeAddress")}
          />

          {errors.homeAddress && (
            <p className="text-sm text-red-500">
              {errors.homeAddress.message}
            </p>
          )}
        </div>

      </div>
    </div>
  );
}