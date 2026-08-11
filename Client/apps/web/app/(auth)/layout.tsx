import Image from "next/image";
import Logo from "@/assets/image/ANCILOGO.png";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen overflow-y-auto bg-[#0A1E42] lg:flex lg:items-center lg:justify-center lg:p-8">

      <div className="w-full lg:max-w-6xl lg:overflow-hidden lg:rounded-3xl lg:bg-white lg:shadow-2xl">

        <div className="grid lg:grid-cols-2">

   

          <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#0d2142] via-[#13366B] to-[#0A5FB8] px-10 py-10 text-white lg:block lg:min-h-[760px]">

            {/* Decorations */}

            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-400/20" />

            <div className="absolute bottom-0 left-0 h-44 w-44 rounded-full bg-white/10" />

            {/* Logo */}

            <Image
              src={Logo}
              alt="ACE NextGen"
              width={72}
              height={72}
              priority
            />

            <p className="mt-8 text-sm uppercase tracking-[0.35em] text-cyan-200">
              Trainer Portal
            </p>

            <h1 className="mt-5 text-5xl font-bold leading-tight">
              Empower
              <br />
              Every
              <br />
              Learning Session.
            </h1>

            <p className="mt-8 max-w-md text-lg leading-8 text-white/80">
              Access your training workspace to manage
              training sessions, monitor trainee
              progress, record attendance, evaluate
              performance, and issue certifications—
              all from one secure platform.
            </p>

            <div className="absolute bottom-10 left-10 right-10">

              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">

                <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">
                  ACE NEXTGEN
                </p>

                <p className="mt-2 text-sm leading-7 text-white/80">
                  Secure • Reliable • Built for Trainers
                </p>

              </div>

            </div>

          </div>

          {/* ========================= */}
          {/* RIGHT PANEL */}
          {/* ========================= */}

          <div className="flex min-h-screen items-start justify-center bg-white p-6 sm:p-8 lg:min-h-[760px] lg:items-center lg:p-12">

            <div className="w-full max-w-xl py-6 lg:py-0">

              {/* Mobile Branding */}

              <div className="mb-10 flex flex-col items-center lg:hidden">

                <Image
                  src={Logo}
                  alt="ACE NextGen"
                  width={64}
                  height={64}
                  priority
                />

                <h2 className="mt-5 text-center text-2xl font-bold text-slate-900">
                  ACE NextGen
                </h2>

                <p className="mt-2 text-center text-sm uppercase tracking-[0.25em] text-slate-500">
                  Trainer Portal
                </p>

              </div>

              {/* Login/Register */}

              {children}

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}