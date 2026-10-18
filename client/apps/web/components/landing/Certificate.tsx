"use client";

import Link from "next/link";

export default function Certificate() {
  return (
    <section className="bg-[#eff4ff] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="overflow-hidden rounded-3xl bg-[#002b5c] shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Text Content */}
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
                  className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#002b5c] transition duration-300 hover:-translate-y-1 hover:bg-[#6fd1d7]"
                >
                  Start Your Journey
                  <span className="ml-2" aria-hidden="true">
                    →
                  </span>
                </Link>

                <a
                  href="#contact"
                  className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3 text-sm font-bold text-white transition duration-300 hover:-translate-y-1 hover:bg-white/10"
                >
                  Contact Us
                </a>
              </div>
            </div>

            {/* Certificate Visual */}
            <div className="relative flex min-h-[480px] items-center justify-center overflow-hidden bg-[#0d2142] p-8 sm:p-12">
              {/* Background Decorations */}
              <div
                aria-hidden="true"
                className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#1671bd]/20 blur-3xl"
              />

              <div
                aria-hidden="true"
                className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#6fd1d7]/10 blur-3xl"
              />

              {/* Certificate */}
              <div className="relative w-full max-w-md rotate-[-2deg] rounded-lg bg-white p-2 shadow-2xl transition duration-500 hover:rotate-0">
                <div className="border border-slate-200 p-6 sm:p-10">
                  <div className="text-center">
                    {/* Logo */}
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#6fd1d7] bg-[#002b5c] text-sm font-extrabold text-white">
                      A
                    </div>

                    <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500">
                      ACE NextGen Consultancy Inc.
                    </p>

                    <div className="mx-auto mt-4 h-px w-20 bg-[#6fd1d7]" />

                    <p className="mt-5 font-serif text-xl font-bold leading-tight text-[#0b1c30] sm:text-2xl">
                      Certificate of Completion
                    </p>

                    <p className="mt-5 text-[10px] text-slate-500">
                      This certificate is presented to
                    </p>

                    <p className="mt-2 break-words text-lg font-bold text-[#0b1c30]">
                      PARTICIPANT NAME
                    </p>

                    <div className="mx-auto mt-3 h-px w-40 bg-slate-300" />

                    <p className="mt-5 text-[10px] leading-5 text-slate-500">
                      for successfully completing the required training,
                      learning activities, and assessments of the specified
                      training program.
                    </p>

                    {/* Training Details */}
                    <div className="mt-7 grid grid-cols-2 gap-4 text-left">
                      <div>
                        <p className="text-[8px] font-semibold uppercase tracking-wider text-slate-400">
                          Training
                        </p>

                        <p className="mt-1 text-[10px] font-bold text-[#0b1c30]">
                          Training Title
                        </p>
                      </div>

                      <div>
                        <p className="text-[8px] font-semibold uppercase tracking-wider text-slate-400">
                          Batch
                        </p>

                        <p className="mt-1 text-[10px] font-bold text-[#0b1c30]">
                          Batch Code
                        </p>
                      </div>
                    </div>

                    {/* Certificate Verification */}
                    <div className="mt-7 border-t border-slate-200 pt-4">
                      <div className="flex flex-col justify-between gap-3 text-left sm:flex-row">
                        <div>
                          <p className="text-[8px] uppercase tracking-wider text-slate-400">
                            Certificate No.
                          </p>

                          <p className="mt-1 text-[9px] font-bold text-[#0b1c30]">
                            CERT-000001
                          </p>
                        </div>

                        <div className="sm:text-right">
                          <p className="text-[8px] uppercase tracking-wider text-slate-400">
                            Verification Code
                          </p>

                          <p className="mt-1 text-[9px] font-bold text-[#0b1c30]">
                            ACE-VERIFY-001
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Certificate Seal */}
                    <div className="mt-6 flex justify-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#6fd1d7] text-lg font-bold text-[#002b5c]">
                        ✓
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Badge */}
              <div className="absolute bottom-5 right-5 rounded-xl border border-white/10 bg-white/10 px-4 py-3 shadow-lg backdrop-blur-md sm:bottom-8 sm:right-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6fd1d7]/20 text-[#6fd1d7]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>

                  <div>
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
        </div>
      </div>
    </section>
  );
}