"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { Input } from "@repo/ui/index";

import type { RegisterTrainerSchema } from "@/hooks/schema";

export default function AccountInformationStep() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<RegisterTrainerSchema>();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const password = watch("password") ?? "";

  const getStrength = () => {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    switch (score) {
      case 1:
        return {
          label: "Weak",
          color: "bg-red-500",
        };

      case 2:
        return {
          label: "Fair",
          color: "bg-yellow-500",
        };

      case 3:
        return {
          label: "Good",
          color: "bg-blue-500",
        };

      case 4:
        return {
          label: "Strong",
          color: "bg-green-500",
        };

      default:
        return null;
    }
  };

  const strength = getStrength();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">
          Account Information
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Create your trainer account credentials.
        </p>
      </div>

      {/* Email */}

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Email Address
        </label>

        <Input
          type="email"
          placeholder="trainer@email.com"
          {...register("email")}
        />

        <p className="text-sm text-red-500">
          {errors.email?.message}
        </p>
      </div>

      {/* Username */}

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Username
        </label>

        <Input
          placeholder="Enter username"
          {...register("username")}
        />

        <p className="text-sm text-red-500">
          {errors.username?.message}
        </p>
      </div>

      {/* Password */}

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Password
        </label>

        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Create password"
            className="pr-12"
            {...register("password")}
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(!showPassword)
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>

        <p className="text-sm text-red-500">
          {errors.password?.message}
        </p>

        {strength && (
          <>
            <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
              <div
                className={`h-2 rounded-full transition-all ${strength.color}`}
                style={{
                  width: `${
                    (password.length >= 8 ? 25 : 0) +
                    (/[A-Z]/.test(password) ? 25 : 0) +
                    (/[0-9]/.test(password) ? 25 : 0) +
                    (/[^A-Za-z0-9]/.test(password)
                      ? 25
                      : 0)
                  }%`,
                }}
              />
            </div>

            <p className="text-xs text-slate-500">
              Password Strength:
              <span className="ml-1 font-medium">
                {strength.label}
              </span>
            </p>
          </>
        )}
      </div>

      {/* Confirm Password */}

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Confirm Password
        </label>

        <div className="relative">
          <Input
            type={showConfirm ? "text" : "password"}
            className="pr-12"
            placeholder="Confirm password"
            {...register("confirmPassword")}
          />

          <button
            type="button"
            onClick={() =>
              setShowConfirm(!showConfirm)
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
          >
            {showConfirm ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>

        <p className="text-sm text-red-500">
          {errors.confirmPassword?.message}
        </p>
      </div>
    </div>
  );
}