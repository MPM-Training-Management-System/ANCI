const governanceItems = [
  {
    number: "01",
    title: "Organized Records",
    description:
      "Training, participant, attendance, assessment, and certificate information can be managed through structured records.",
  },
  {
    number: "02",
    title: "Role-Based Access",
    description:
      "System functions can be accessed according to the user's assigned role and responsibilities.",
  },
  {
    number: "03",
    title: "Transparent Workflow",
    description:
      "Registration, validation, approval, training, assessment, and certification follow defined processes.",
  },
  {
    number: "04",
    title: "Centralized Management",
    description:
      "Relevant operational information is organized within one integrated training management environment.",
  },
];

export default function Governance() {
  return (
    <section
      id="governance"
      className="bg-[#0b192c] py-20 text-white lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#6fd1d7]">
              Governance &amp; Management
            </span>

            <h2 className="mt-4 font-[var(--font-jakarta)] text-3xl font-extrabold leading-tight lg:text-4xl">
              Structured processes. Organized information.
            </h2>

            <p className="mt-6 text-base leading-8 text-blue-100">
              ACE NextGen's integrated platform is designed around organized
              workflows, role-based responsibilities, and centralized
              information management.
            </p>

            <a
              href="#contact"
              className="mt-8 inline-flex items-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#0b192c] transition hover:-translate-y-1 hover:bg-[#6fd1d7]"
            >
              Contact ACE NextGen
            </a>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
            {governanceItems.map((item) => (
              <div
                key={item.number}
                className="rounded-2xl border border-white/10 bg-white/5 p-7 transition hover:bg-white/10"
              >
                <span className="text-xs font-extrabold text-[#6fd1d7]">
                  {item.number}
                </span>

                <h3 className="mt-6 text-lg font-extrabold">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-blue-100">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}