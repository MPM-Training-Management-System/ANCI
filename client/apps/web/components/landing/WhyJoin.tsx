
const benefits = [
  {
    number: "01",
    title: "Peacebuilding and Mediation",
    description:
      "Promoting peaceful conflict resolution through mediation, dialogue, negotiation, and restorative practices for government institutions, churches, and the private sector.",
  },
  {
    number: "02",
    title: "Professional Consultancy and Training",
    description:
      "Providing professional consultancy and training in governance, leadership, ethics, negotiation, and conflict management.",
  },
  {
    number: "03",
    title: "Institutional and Human Development",
    description:
      "Strengthening individuals and organizations through capacity-building programs, professional development, leadership, and improved institutional performance.",
  },
  {
    number: "04",
    title: "Sports Development and Youth Empowerment",
    description:
      "Promoting Roll Ball and Skate Ball while encouraging discipline, teamwork, sportsmanship, leadership, and opportunities for the next generation.",
  },
];

export default function WhyJoin() {
  return (
    <section
      id="why-join"
      className="bg-white py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">

          {/* Heading */}
          <div className="lg:col-span-5">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563eb]">
              Why ACE NextGen
            </span>

            <h2 className="mt-3 font-[var(--font-jakarta)] text-3xl font-extrabold leading-tight text-[#0b1c30] lg:text-4xl">
              Building peace, developing leaders, and empowering communities.
            </h2>

            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
              ACE NextGen Consultancy Inc. is committed to honoring God
              and serving the Nation through professional consultancy,
              training, peacebuilding, institutional development, and
              sports initiatives that create meaningful opportunities
              for individuals and communities.
            </p>

            <a
              href="#programs"
              className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#2563eb] hover:underline"
            >
              Explore our services
              <span>→</span>
            </a>
          </div>

          {/* Core Areas of Service */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
            {benefits.map((item) => (
              <div
                key={item.number}
                className="group rounded-2xl border border-slate-200 bg-[#f8f9ff] p-7 transition duration-300 hover:-translate-y-1 hover:border-[#2563eb]/40 hover:bg-white hover:shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-extrabold text-[#2563eb]">
                    {item.number}
                  </span>

                  <span className="text-slate-300 transition group-hover:text-[#2563eb]">
                    ↗
                  </span>
                </div>

                <h3 className="mt-8 text-lg font-extrabold text-[#0b1c30]">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
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
