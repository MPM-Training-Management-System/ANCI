import Link from "next/link";

export default function Certificate() {
  return (
    <section className="bg-[#eff4ff] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="overflow-hidden rounded-3xl bg-[#002b5c] shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Text */}002b5c
            <div className="p-8 sm:p-12 lg:p-16">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#6fd1d7]">
                Digital Certification
              </span>

              <h2 className="mt-4 font-[var(--font-jakarta)] text-3xl font-extrabold leading-tight text-white lg:text-4xl">
                A complete learning journey deserves a complete record.
              </h2>

              <p className="mt-6 text-base leading-8 text-blue-100">
                Training completion can be supported by digitally generated
                certificates containing relevant participant, training, batch,
                and verification information.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#002b5c] transition hover:-translate-y-1 hover:bg-[#6fd1d7]"
                >
                  Start Your Journey
                </Link>

                <a
                  href="#contact"
                  className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Contact Us
                </a>
              </div>
            </div>

            {/* Certificate Visual */}
            <div className="relative flex items-center justify-center bg-[#0d2142] p-8 sm:p-12">
              <div className="relative w-full max-w-md rotate-[-2deg] rounded-lg bg-white p-2 shadow-2xl">
                <div className="border border-slate-200 p-8 sm:p-10">
                  <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#002b5c] text-sm font-bold text-white">
                      A
                    </div>

                    <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500">
                      ACE NextGen Consultancy Inc.
                    </p>

                    <p className="mt-7 font-serif text-2xl font-bold text-[#0b1c30]">
                      Certificate of Completion
                    </p>

                    <p className="mt-5 text-[10px] text-slate-500">
                      This certificate is presented to
                    </p>

                    <p className="mt-2 text-lg font-bold text-[#0b1c30]">
                      PARTICIPANT NAME
                    </p>

                    <div className="mx-auto mt-4 h-px w-40 bg-slate-300" />

                    <p className="mt-5 text-[10px] leading-5 text-slate-500">
                      for successfully completing the required training,
                      learning activities, and assessments of the specified
                      training program.
                    </p>

                    <div className="mt-8 grid grid-cols-2 gap-5 text-left">
                      <div>
                        <p className="text-[8px] uppercase text-slate-400">
                          Training
                        </p>

                        <p className="mt-1 text-[10px] font-bold text-[#0b1c30]">
                          Training Title
                        </p>
                      </div>

                      <div>
                        <p className="text-[8px] uppercase text-slate-400">
                          Batch
                        </p>

                        <p className="mt-1 text-[10px] font-bold text-[#0b1c30]">
                          Batch Code
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-between text-[8px] text-slate-400">
                      <span>Certificate No.</span>
                      <span>Verification Code</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-8 right-8 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-md">
                <p className="text-[9px] text-blue-100">
                  Digital Record
                </p>

                <p className="mt-1 text-xs font-bold text-white">
                  Verifiable Certificate
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}