import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#062b5b]">
      {/* =====================================================
          BACKGROUND
      ====================================================== */}
      <div className="absolute inset-0">
        {/* Grid */}
        <div
          className="
            absolute inset-0
            bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)]
            bg-[size:44px_44px]
          "
        />

        {/* Decorative glow */}
        <div
          className="
            absolute
            -left-40
            -top-40
            h-[500px]
            w-[500px]
            rounded-full
            bg-blue-400/5
            blur-3xl
          "
        />

        <div
          className="
            absolute
            -bottom-40
            -right-40
            h-[500px]
            w-[500px]
            rounded-full
            bg-teal-400/5
            blur-3xl
          "
        />
      </div>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <div
        className="
          relative
          z-10
          mx-auto
          flex
          min-h-screen
          w-full
          max-w-7xl
          items-center
          px-6
          py-10
          lg:px-10
          xl:px-14
        "
      >
        <div
          className="
            grid
            w-full
            items-center
            gap-12
            lg:grid-cols-[1fr_440px]
            xl:gap-24
          "
        >
          {/* =================================================
              LEFT BRANDING
          ================================================== */}
          <section className="hidden lg:block">
            <div className="max-w-2xl">
              {/* Brand */}
              <div className="mb-10 flex items-center gap-4">
                <Image
                  src="/assets/image/ANCILOGO.png"
                  alt="ACE NextGen Consultancy Inc."
                  width={56}
                  height={56}
                  priority
                  className="h-14 w-14 object-contain"
                />

                <div className="h-10 w-px bg-white/20" />

                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white">
                    ACE NextGen
                  </h1>

                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-teal-300">
                    ISTMS Control Center
                  </p>
                </div>
              </div>

              {/* Eyebrow */}
              <p
                className="
                  mb-4
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.3em]
                  text-teal-300
                "
              >
                Integrated Service & Training Management
              </p>

              {/* Main heading */}
              <h2
                className="
                  max-w-xl
                  text-5xl
                  font-extrabold
                  leading-[1.08]
                  tracking-tight
                  text-white
                  xl:text-6xl
                "
              >
                Empowering
                <br />
                Institutional
                <br />
                Excellence
                <br />
                <span className="text-teal-300">
                  Through Precision.
                </span>
              </h2>

              {/* Description */}
              <p
                className="
                  mt-7
                  max-w-lg
                  text-base
                  leading-7
                  text-white/65
                  xl:text-lg
                "
              >
                Securely access the Integrated Service & Training
                Management System and manage institutional services,
                training programs, participants, assessments, and
                digital certifications from one centralized platform.
              </p>

              {/* Platform features */}
              <div className="mt-10 flex flex-wrap gap-3">
                {[
                  "Service Management",
                  "Training Management",
                  "Digital Certification",
                ].map((item) => (
                  <div
                    key={item}
                    className="
                      rounded-full
                      border
                      border-white/10
                      bg-white/5
                      px-4
                      py-2
                      text-xs
                      font-medium
                      text-white/60
                      backdrop-blur-sm
                    "
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* =================================================
              RIGHT SIDE
          ================================================== */}
          <section className="flex w-full justify-center lg:justify-end">
            {children}
          </section>
        </div>
      </div>

      {/* =====================================================
          MOBILE BRAND
      ====================================================== */}
      <div
        className="
          absolute
          left-6
          top-6
          z-20
          flex
          items-center
          gap-3
          lg:hidden
        "
      >
        <Image
          src="/assets/image/ANCILOGO.png"
          alt="ACE NextGen Consultancy Inc."
          width={42}
          height={42}
          priority
          className="h-[42px] w-[42px] object-contain"
        />

        <div>
          <p className="text-sm font-bold text-white">
            ACE NextGen
          </p>

          <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-teal-300">
            ISTMS Control Center
          </p>
        </div>
      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <footer
        className="
          absolute
          bottom-5
          left-0
          right-0
          z-20
          hidden
          lg:block
        "
      >
        <div
          className="
            mx-auto
            flex
            max-w-7xl
            items-center
            justify-between
            px-10
            text-[9px]
            font-semibold
            uppercase
            tracking-[0.18em]
            text-white/30
            xl:px-14
          "
        >
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="transition-colors hover:text-teal-300"
            >
              Privacy Protocol
            </a>

            <a
              href="#"
              className="transition-colors hover:text-teal-300"
            >
              Terms of Governance
            </a>

            <a
              href="#"
              className="transition-colors hover:text-teal-300"
            >
              Support
            </a>
          </div>

          <p>© 2026 ACE NextGen Consultancy Inc.</p>
        </div>
      </footer>
    </main>
  );
}