"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import Link from "next/link";

import {
  Eye,
  EyeOff,
  Upload,
  UserRound,
} from "lucide-react";

import {
  useForm,
} from "react-hook-form";

import {
  useRegisterTrainer,
  RegisterTrainerFormValues,
} from "@/hooks/useRegisterTrainer";

import {
  authApi,
} from "@/lib/api";


export default function TrainerRegisterForm() {

  const router =
    useRouter();


  // =========================================================
  // REGISTER HOOK
  // =========================================================

  const {
    registerTrainer,
    isLoading,
    error,
  } =
    useRegisterTrainer(
      authApi
    );


  // =========================================================
  // FORM
  // =========================================================

  const {
    register,
    handleSubmit,

    formState: {
      errors,
    },

  } =
    useForm<RegisterTrainerFormValues>({
      defaultValues: {

        firstName: "",

        middleName: "",

        lastName: "",

        email: "",

        mobileNumber: "",

        password: "",

        confirmPassword: "",

        specialization: "",

        yearsOfExperience:
          undefined,

        certificationName: "",

        certificationNumber: "",

        profileImage:
          undefined,
      },
    });


  // =========================================================
  // IMAGE
  // =========================================================

  const [
    profileImage,
    setProfileImage,
  ] = useState<File | undefined>();


  const [
    preview,
    setPreview,
  ] = useState<string | null>(
    null
  );


  // =========================================================
  // PASSWORD VISIBILITY
  // =========================================================

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);


  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);


  // =========================================================
  // TERMS
  // =========================================================

  const [
    agreeTerms,
    setAgreeTerms,
  ] = useState(false);


  // =========================================================
  // IMAGE
  // =========================================================

  const handleImageChange = (
    event:
      React.ChangeEvent<HTMLInputElement>
  ) => {

    const file =
      event.target.files?.[0];


    if (!file) {
      return;
    }


    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];


    if (
      !allowedTypes.includes(
        file.type
      )
    ) {

      alert(
        "Please select a JPG, PNG, or WEBP image."
      );

      return;
    }


    if (
      file.size >
      5 * 1024 * 1024
    ) {

      alert(
        "Image must not exceed 5MB."
      );

      return;
    }


    setProfileImage(
      file
    );


    setPreview(
      URL.createObjectURL(
        file
      )
    );

  };


  // =========================================================
  // SUBMIT
  // =========================================================

  const onSubmit = async (
    data: RegisterTrainerFormValues
  ) => {

    if (!agreeTerms) {

      alert(
        "Please agree to the Terms and Conditions."
      );

      return;
    }


    // -------------------------------------------------------
    // REGISTER
    // -------------------------------------------------------

    const registration =
      await registerTrainer({

        ...data,

        profileImage,

      });


    if (!registration) {

      return;
    }


    // -------------------------------------------------------
    // SEND OTP
    // -------------------------------------------------------

    try {

      const otpResponse =
        await authApi.sendOtp({

          email:
            data.email
              .trim()
              .toLowerCase(),

        });


      if (
        !otpResponse.success
      ) {

        alert(
          otpResponse.message ||
          "Unable to send OTP."
        );

        return;
      }


      // -----------------------------------------------------
      // GO TO OTP
      // -----------------------------------------------------

      router.push(
        `/verify-otp?email=${encodeURIComponent(
          data.email
            .trim()
            .toLowerCase()
        )}`
      );

    }
    catch (error) {

      alert(
        error instanceof Error
          ? error.message
          : "Unable to send OTP."
      );

    }

  };


  // =========================================================
  // UI
  // =========================================================

  return (

    <div
      className="
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-6
        shadow-xl
        sm:p-8
      "
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="
          mb-8
        "
      >

        <span
          className="
            inline-flex
            rounded-full
            bg-teal-50
            px-3
            py-1
            text-xs
            font-bold
            uppercase
            tracking-wider
            text-teal-700
          "
        >
          Trainer Registration
        </span>


        <h1
          className="
            mt-4
            text-3xl
            font-bold
            text-slate-900
          "
        >
          Create your trainer account
        </h1>


        <p
          className="
            mt-2
            text-sm
            leading-6
            text-slate-500
          "
        >
          Submit your information for trainer
          application and verification.
        </p>

      </div>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <div
          className="
            mb-6
            rounded-xl
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            text-red-700
          "
        >

          {error}

        </div>

      )}


      <form
        onSubmit={
          handleSubmit(
            onSubmit
          )
        }
        className="
          space-y-8
        "
      >

        {/* ===================================================
            PROFILE IMAGE
        =================================================== */}

        <section>

          <h2
            className="
              text-lg
              font-bold
              text-slate-900
            "
          >
            Profile Photo
          </h2>


          <div
            className="
              mt-4
              flex
              flex-col
              items-center
              gap-5
              rounded-2xl
              border
              border-dashed
              border-slate-300
              bg-slate-50
              p-6
              sm:flex-row
            "
          >

            <div
              className="
                flex
                h-28
                w-28
                shrink-0
                items-center
                justify-center
                overflow-hidden
                rounded-full
                bg-white
                ring-1
                ring-slate-200
              "
            >

              {preview ? (

                <img
                  src={preview}
                  alt="Profile preview"
                  className="
                    h-full
                    w-full
                    object-cover
                  "
                />

              ) : (

                <UserRound
                  className="
                    h-10
                    w-10
                    text-slate-300
                  "
                />

              )}

            </div>


            <div>

              <label
                htmlFor="profileImage"
                className="
                  inline-flex
                  cursor-pointer
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-300
                  bg-white
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-slate-700
                  hover:bg-slate-50
                "
              >

                <Upload
                  className="
                    h-4
                    w-4
                  "
                />

                Choose Photo

              </label>


              <input
                id="profileImage"
                type="file"
                accept="
                  image/jpeg,
                  image/png,
                  image/webp
                "
                className="hidden"
                onChange={
                  handleImageChange
                }
              />


              <p
                className="
                  mt-2
                  text-xs
                  text-slate-500
                "
              >
                JPG, PNG or WEBP · Maximum 5MB
              </p>


              {profileImage && (

                <p
                  className="
                    mt-2
                    text-xs
                    font-medium
                    text-teal-700
                  "
                >
                  {profileImage.name}
                </p>

              )}

            </div>

          </div>

        </section>


        {/* ===================================================
            NAME
        =================================================== */}

        <section>

          <h2
            className="
              text-lg
              font-bold
            "
          >
            Personal Information
          </h2>


          <div
            className="
              mt-4
              grid
              gap-4
              md:grid-cols-3
            "
          >

            <Field
              label="First Name"
              error={
                errors.firstName?.message
              }
            >

              <input
                {...register(
                  "firstName",
                  {
                    required:
                      "First name is required.",
                  }
                )}
                placeholder="Juan"
                className="
                  input
                "
              />

            </Field>


            <Field
              label="Middle Name"
              error={
                errors.middleName?.message
              }
            >

              <input
                {...register(
                  "middleName"
                )}
                placeholder="Dela"
                className="
                  input
                "
              />

            </Field>


            <Field
              label="Last Name"
              error={
                errors.lastName?.message
              }
            >

              <input
                {...register(
                  "lastName",
                  {
                    required:
                      "Last name is required.",
                  }
                )}
                placeholder="Cruz"
                className="
                  input
                "
              />

            </Field>

          </div>

        </section>


        {/* ===================================================
            CONTACT
        =================================================== */}

        <section>

          <h2
            className="
              text-lg
              font-bold
            "
          >
            Account Information
          </h2>


          <div
            className="
              mt-4
              grid
              gap-4
              md:grid-cols-2
            "
          >

            <Field
              label="Email"
              error={
                errors.email?.message
              }
            >

              <input
                type="email"
                {...register(
                  "email",
                  {
                    required:
                      "Email is required.",
                  }
                )}
                placeholder="juan@email.com"
                className="
                  input
                "
              />

            </Field>


            <Field
              label="Mobile Number"
              error={
                errors.mobileNumber?.message
              }
            >

              <input
                type="tel"
                {...register(
                  "mobileNumber"
                )}
                placeholder="09123456789"
                className="
                  input
                "
              />

            </Field>

          </div>

        </section>


        {/* ===================================================
            PROFESSIONAL
        =================================================== */}

        <section>

          <h2
            className="
              text-lg
              font-bold
            "
          >
            Professional Information
          </h2>


          <div
            className="
              mt-4
              grid
              gap-4
              md:grid-cols-2
            "
          >

            <Field
              label="Specialization"
              error={
                errors.specialization?.message
              }
            >

              <input
                {...register(
                  "specialization",
                  {
                    required:
                      "Specialization is required.",
                  }
                )}
                placeholder="Web Development"
                className="
                  input
                "
              />

            </Field>


            <Field
              label="Years of Experience"
              error={
                errors.yearsOfExperience?.message
              }
            >

              <input
                type="number"
                min="0"
                {...register(
                  "yearsOfExperience",
                  {
                    setValueAs:
                      value =>
                        value === ""
                          ? undefined
                          : Number(value),
                  }
                )}
                placeholder="5"
                className="
                  input
                "
              />

            </Field>


            <Field
              label="Certification Name"
              error={
                errors.certificationName?.message
              }
            >

              <input
                {...register(
                  "certificationName"
                )}
                placeholder="TESDA NC II"
                className="
                  input
                "
              />

            </Field>


            <Field
              label="Certification Number"
              error={
                errors.certificationNumber?.message
              }
            >

              <input
                {...register(
                  "certificationNumber"
                )}
                placeholder="Certification number"
                className="
                  input
                "
              />

            </Field>

          </div>

        </section>


        {/* ===================================================
            PASSWORD
        =================================================== */}

        <section>

          <h2
            className="
              text-lg
              font-bold
            "
          >
            Password
          </h2>


          <div
            className="
              mt-4
              grid
              gap-4
              md:grid-cols-2
            "
          >

            <Field
              label="Password"
              error={
                errors.password?.message
              }
            >

              <div
                className="
                  relative
                "
              >

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  {...register(
                    "password",
                    {
                      required:
                        "Password is required.",

                      minLength: {
                        value: 8,

                        message:
                          "Password must be at least 8 characters.",
                      },
                    }
                  )}
                  placeholder="Password"
                  className="
                    input
                    pr-12
                  "
                />


                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      value => !value
                    )
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                >

                  {showPassword ? (

                    <EyeOff
                      className="
                        h-5
                        w-5
                      "
                    />

                  ) : (

                    <Eye
                      className="
                        h-5
                        w-5
                      "
                    />

                  )}

                </button>

              </div>

            </Field>


            <Field
              label="Confirm Password"
              error={
                errors.confirmPassword?.message
              }
            >

              <div
                className="
                  relative
                "
              >

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  {...register(
                    "confirmPassword",
                    {
                      required:
                        "Please confirm your password.",
                    }
                  )}
                  placeholder="Confirm password"
                  className="
                    input
                    pr-12
                  "
                />


                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      value => !value
                    )
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                >

                  {showConfirmPassword ? (

                    <EyeOff
                      className="
                        h-5
                        w-5
                      "
                    />

                  ) : (

                    <Eye
                      className="
                        h-5
                        w-5
                      "
                    />

                  )}

                </button>

              </div>

            </Field>

          </div>

        </section>


        {/* ===================================================
            TERMS
        =================================================== */}

        <label
          className="
            flex
            cursor-pointer
            items-start
            gap-3
            rounded-xl
            bg-slate-50
            p-4
          "
        >

          <input
            type="checkbox"
            checked={
              agreeTerms
            }
            onChange={
              event =>
                setAgreeTerms(
                  event.target.checked
                )
            }
            className="
              mt-1
              h-4
              w-4
            "
          />


          <span
            className="
              text-sm
              leading-6
              text-slate-600
            "
          >
            I agree to the Terms and Conditions
            and Privacy Policy.
          </span>

        </label>


        {/* ===================================================
            SUBMIT
        =================================================== */}

        <button
          type="submit"
          disabled={
            isLoading ||
            !agreeTerms
          }
          className="
            w-full
            rounded-xl
            bg-teal-600
            px-5
            py-3.5
            text-sm
            font-bold
            text-white
            transition
            hover:bg-teal-700
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >

          {isLoading
            ? "Creating Account..."
            : "Create Trainer Account"}

        </button>


        {/* ===================================================
            LOGIN
        =================================================== */}

        <p
          className="
            text-center
            text-sm
            text-slate-500
          "
        >

          Already have an account?{" "}

          <Link
            href="/login"
            className="
              font-semibold
              text-teal-700
              hover:underline
            "
          >
            Sign in
          </Link>

        </p>

      </form>

    </div>
  );
}


// ===========================================================
// FIELD
// ===========================================================

interface FieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}


function Field({
  label,
  error,
  children,
}: FieldProps) {

  return (

    <div>

      <label
        className="
          mb-2
          block
          text-sm
          font-semibold
          text-slate-700
        "
      >
        {label}
      </label>


      {children}


      {error && (

        <p
          className="
            mt-1.5
            text-xs
            text-red-500
          "
        >
          {error}
        </p>

      )}

    </div>
  );
}