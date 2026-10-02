const stages = [
  "Request",
  "Validation",
  "Training",
  "Assessment",
  "Certification",
];

export default function Mission() {
  return (
    <section
      id="about"
      className="bg-white py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12">
          {/* Left */}
          <div className="lg:col-span-6">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563eb]">
              About ACE NextGen
            </span>

            <h2 className="mt-3 font-[var(--font-jakarta)] text-3xl font-extrabold leading-tight text-[#0b1c30] lg:text-4xl">
              Connecting professional services with meaningful learning.
            </h2>

            <p className="mt-6 text-base leading-8 text-slate-600">
              ACE NextGen Consultancy Inc. focuses on providing integrated
              professional services and training opportunities that help
              individuals and organizations develop knowledge, skills, and
              capabilities.
            </p>

            <p className="mt-4 text-base leading-8 text-slate-600">
              Through structured programs and organized service delivery, the
              organization supports participants throughout the learning and
              professional development lifecycle.
            </p>

            <a
              href="#services"
              className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#2563eb]"
            >
              Discover our services
              <span>→</span>
            </a>
          </div>

          {/* Right */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl bg-[#0b192c] p-7 text-white shadow-2xl lg:p-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#6fd1d7]">
                  Integrated Lifecycle
                </span>

                <h3 className="mt-3 text-2xl font-extrabold">
                  From registration to certification.
                </h3>

                <p className="mt-4 text-sm leading-7 text-blue-100">
                  A structured process helps participants and administrators
                  monitor each stage of a training program.
                </p>
              </div>

              <div className="mt-10 grid grid-cols-5 gap-2">
                {stages.map((stage, index) => (
                  <div
                    key={stage}
                    className="text-center"
                  >
                    <div
                      className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full text-xs font-extrabold ${
                        index === 0
                          ? "bg-[#2563eb] text-white"
                          : "bg-white/10 text-blue-100"
                      }`}
                    >
                      {index + 1}
                    </div>

                    <p className="mt-3 text-[10px] font-semibold text-blue-100 sm:text-xs">
                      {stage}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-100">
                    Participant Journey
                  </span>

                  <span className="text-xs font-bold text-[#6fd1d7]">
                    Integrated
                  </span>
                </div>

                <div className="mt-4 h-2 rounded-full bg-white/10">
                  <div className="h-full w-[85%] rounded-full bg-[#6fd1d7]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}