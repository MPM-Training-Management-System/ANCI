import Image from "next/image";

import {
  BadgeCheck,
  CheckCircle2,
  FileCheck2,
  Globe2,
  QrCode,
  ScanLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import certificate from "@/assets/image/Certificate.png";

export default function Certificate() {
  return (
    <section
      id="certificate"
      className="relative overflow-hidden bg-[#f4f8fc] py-24 lg:py-32"
    >
      {/* ========================================================= */}
      {/* BACKGROUND */}
      {/* ========================================================= */}

      <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-primary/10 blur-[120px]" />

      <div className="pointer-events-none absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-secondary/10 blur-[130px]" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#002b5c 1px, transparent 1px), linear-gradient(90deg, #002b5c 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="container relative z-10 mx-auto px-6 lg:px-12">
        {/* ========================================================= */}
        {/* HEADER */}
        {/* ========================================================= */}

        <div className="mx-auto max-w-3xl text-center">
          <div
            className="
              mb-5
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-primary/20
              bg-white
              px-4
              py-2
              shadow-sm
              transition-all
              duration-300
              hover:-translate-y-1
              hover:shadow-md
            "
          >
            <Sparkles className="h-4 w-4 text-primary" />

            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Digital Certification
            </span>
          </div>

          <h2
            className="
              text-4xl
              font-extrabold
              leading-tight
              tracking-tight
              text-[#002b5c]
              sm:text-5xl
              lg:text-6xl
            "
          >
            Credentials You Can
            <br />

            <span className="bg-gradient-to-r from-[#002b5c] via-primary to-secondary bg-clip-text text-transparent">
              Trust & Verify
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Recognize professional achievement with digitally verifiable
            certificates designed to provide authenticity, transparency,
            and confidence.
          </p>
        </div>

        {/* ========================================================= */}
        {/* MAIN CONTENT */}
        {/* ========================================================= */}

        <div className="mx-auto mt-16 grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          {/* ======================================================= */}
          {/* CERTIFICATE PREVIEW */}
          {/* ======================================================= */}

          <div className="relative">
            {/* Floating Verification Badge */}
            <div
              className="
                absolute
                -right-2
                top-4
                z-20
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-gray-200
                bg-white
                px-4
                py-3
                shadow-xl
                transition-all
                duration-500
                hover:-translate-y-2
                sm:-right-5
              "
            >
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-green-50">
                <BadgeCheck className="h-5 w-5 text-green-600" />

                <span className="absolute inset-0 animate-ping rounded-xl bg-green-400/10" />
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                  Credential
                </p>

                <p className="text-xs font-extrabold text-green-600">
                  Digitally Verifiable
                </p>
              </div>
            </div>

            {/* Certificate */}
            <div
              className="
                relative
                mx-auto
                max-w-xl
                transition-transform
                duration-700
                hover:rotate-0
                hover:scale-[1.02]
              "
            >
              {/* Shadow */}
              <div
                className="
                  absolute
                  inset-5
                  rounded-[28px]
                  bg-primary/20
                  blur-2xl
                "
              />

              {/* Certificate Frame */}
              <div
                className="
                  relative
                  rotate-[-2deg]
                  rounded-[28px]
                  border
                  border-white
                  bg-white
                  p-4
                  shadow-[0_30px_80px_rgba(0,43,92,0.18)]
                  transition-transform
                  duration-700
                  sm:p-6
                "
              >
                <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                  <Image
                    src={certificate}
                    alt="ACE NextGen Professional Certificate"
                    width={700}
                    height={500}
                    className="h-auto w-full object-cover"
                  />
                </div>

                {/* Certificate Bottom Bar */}
                <div className="mt-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <FileCheck2 className="h-4 w-4 text-primary" />
                    </div>

                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                        Credential
                      </p>

                      <p className="text-xs font-bold text-[#002b5c]">
                        Certified Professional
                      </p>
                    </div>
                  </div>

                  <div className="hidden items-center gap-2 sm:flex">
                    <QrCode className="h-6 w-6 text-[#002b5c]" />

                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                      Digital Verification
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating QR Card */}
            <div
              className="
                absolute
                -bottom-7
                left-0
                z-20
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-3
                shadow-xl
                transition-all
                duration-500
                hover:-translate-y-2
                sm:-left-4
              "
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#002b5c]">
                <QrCode className="h-6 w-6 text-white" />
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                  Scan to verify
                </p>

                <p className="text-xs font-extrabold text-[#002b5c]">
                  Certificate Authenticity
                </p>
              </div>
            </div>
          </div>

          {/* ======================================================= */}
          {/* CONTENT */}
          {/* ======================================================= */}

          <div>
            <div className="mb-7">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Global Validation
              </p>

              <h3 className="mt-3 text-3xl font-extrabold leading-tight text-[#002b5c] sm:text-4xl">
                Your Achievement.
                <br />

                <span className="text-primary">
                  Digitally Verified.
                </span>
              </h3>

              <p className="mt-5 text-base leading-7 text-gray-600">
                Professional credentials should be easy to validate.
                ACE NextGen certificates can include a unique
                verification identifier that helps organizations and
                stakeholders confirm certificate authenticity.
              </p>
            </div>

            {/* ===================================================== */}
            {/* FEATURES */}
            {/* ===================================================== */}

            <div className="space-y-4">
              {/* Feature 1 */}
              <div
                className="
                  group
                  flex
                  gap-4
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  p-5
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-primary/20
                  hover:shadow-lg
                "
              >
                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-primary/10
                    transition-all
                    duration-300
                    group-hover:bg-primary
                  "
                >
                  <ShieldCheck className="h-5 w-5 text-primary group-hover:text-white" />
                </div>

                <div>
                  <h4 className="text-sm font-extrabold text-[#002b5c]">
                    Authentic & Secure
                  </h4>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Each credential can be associated with a unique
                    verification record.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div
                className="
                  group
                  flex
                  gap-4
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  p-5
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-primary/20
                  hover:shadow-lg
                "
              >
                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-primary/10
                    transition-all
                    duration-300
                    group-hover:bg-primary
                  "
                >
                  <Globe2 className="h-5 w-5 text-primary group-hover:text-white" />
                </div>

                <div>
                  <h4 className="text-sm font-extrabold text-[#002b5c]">
                    Digital Verification
                  </h4>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Certificate information can be validated through
                    the system's verification process.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div
                className="
                  group
                  flex
                  gap-4
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  p-5
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-primary/20
                  hover:shadow-lg
                "
              >
                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-primary/10
                    transition-all
                    duration-300
                    group-hover:bg-primary
                  "
                >
                  <ScanLine className="h-5 w-5 text-primary group-hover:text-white" />
                </div>

                <div>
                  <h4 className="text-sm font-extrabold text-[#002b5c]">
                    Certificate Lookup
                  </h4>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Certificates can be checked using their unique
                    verification identifier once the verification
                    feature is available.
                  </p>
                </div>
              </div>
            </div>

            {/* ===================================================== */}
            {/* INFORMATION CTA */}
            {/* ===================================================== */}

            <div className="mt-8 rounded-2xl border border-primary/10 bg-primary/5 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                  <FileCheck2 className="h-5 w-5 text-primary" />
                </div>

                <div>
                  <p className="text-sm font-extrab800 text-[#002b5c]">
                    Digital Certificate Management
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Certificates generated through the training
                    process can be managed and verified through the
                    integrated system.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* VERIFICATION MINI PANEL */}
        {/* ========================================================= */}

        <div
          id="certificate-verification"
          className="mx-auto mt-20 max-w-5xl"
        >
          <div
            className="
              relative
              overflow-hidden
              rounded-[28px]
              bg-[#002b5c]
              p-7
              text-white
              shadow-[0_25px_70px_rgba(0,43,92,0.18)]
              sm:p-9
            "
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/30 blur-[100px]" />

            <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              {/* Text */}
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                    <BadgeCheck className="h-4 w-4" />
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                    Verification Portal
                  </span>
                </div>

                <h3 className="mt-4 text-2xl font-extrabold sm:text-3xl">
                  Certificate Verification
                </h3>

                <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">
                  Professional credentials can be verified using a
                  unique certificate verification code.
                </p>
              </div>

              {/* Verification Preview */}
              <div
                className="
                  w-full
                  max-w-sm
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/10
                  p-4
                  backdrop-blur
                "
              >
                <div className="rounded-xl bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                      </div>

                      <span className="text-xs font-bold text-[#002b5c]">
                        Certificate Verification
                      </span>
                    </div>

                    <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                  </div>

                  <div className="mt-4 flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                      <QrCode className="h-5 w-5 text-[#002b5c]" />
                    </div>

                    <div className="flex-1">
                      <p className="text-[8px] font-bold uppercase tracking-wider text-gray-400">
                        Verification Code
                      </p>

                      <p className="mt-1 text-xs font-extrabold tracking-wider text-[#002b5c]">
                        ANCI-CERT-••••••
                      </p>
                    </div>

                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-[9px] font-semibold text-green-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verification Ready
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* FINAL INFORMATION */}
        {/* ========================================================= */}

        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              value: "Digital",
              label: "Certificate Format",
            },
            {
              value: "Unique",
              label: "Certificate Identifier",
            },
            {
              value: "Secure",
              label: "Credential Validation",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-5
                text-center
                shadow-sm
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-md
              "
            >
              <p className="text-2xl font-extrabold text-[#002b5c]">
                {stat.value}
              </p>

              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}