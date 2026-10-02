const programs = [
  {
    category: "Training",
    title: "Professional Mediation & ADR Training",
    description:
      "Structured learning opportunities focused on mediation, alternative dispute resolution, communication, and practical professional development.",
    icon: "⚖",
  },
  {
    category: "Training",
    title: "Management & Professional Development",
    description:
      "Programs designed to strengthen leadership, workplace communication, organizational skills, and professional capabilities.",
    icon: "↗",
  },
  {
    category: "Capacity Building",
    title: "Institutional Training Programs",
    description:
      "Customized training and capacity-building programs designed around the needs of organizations and their personnel.",
    icon: "▣",
  },
];

export default function Programs() {
  return (
    <section
      id="programs"
      className="bg-[#f8f9ff] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563eb]">
              Training Programs
            </span>

            <h2 className="mt-3 max-w-2xl font-[var(--font-jakarta)] text-3xl font-extrabold text-[#0b1c30] lg:text-4xl">
              Programs designed for practical professional growth.
            </h2>

            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Explore training and capacity-building opportunities offered
              through ACE NextGen Consultancy Inc.
            </p>
          </div>

          <a
            href="#apply"
            className="inline-flex h-fit items-center justify-center rounded-xl bg-[#002b5c] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0d2142]"
          >
            View Opportunities →
          </a>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {programs.map((program) => (
            <article
              key={program.title}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="h-2 bg-[#2563eb]" />

              <div className="p-8">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#dce9ff] text-xl text-[#2563eb]">
                    {program.icon}
                  </div>

                  <span className="rounded-full bg-[#eff4ff] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#2563eb]">
                    {program.category}
                  </span>
                </div>

                <h3 className="mt-8 text-xl font-extrabold text-[#0b1c30]">
                  {program.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {program.description}
                </p>

                <a
                  href="#contact"
                  className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#2563eb]"
                >
                  Learn more
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}