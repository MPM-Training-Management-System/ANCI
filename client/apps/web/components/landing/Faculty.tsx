
const expertise = [
  {
    number: "01",
    category: "Peacebuilding",
    title: "Mediation and ADR",
    description:
      "Promoting peaceful conflict resolution through mediation, dialogue, negotiation, and restorative practices for government institutions, churches, and the private sector.",
  },
  {
    number: "02",
    category: "Professional Development",
    title: "Consultancy and Training",
    description:
      "Providing professional consultancy and training in governance, leadership, ethics, negotiation, and conflict management.",
  },
  {
    number: "03",
    category: "Capacity Building",
    title: "Institutional Development",
    description:
      "Strengthening organizational performance and individual capabilities through professional development, leadership, and capacity-building programs.",
  },
  {
    number: "04",
    category: "Sports Excellence",
    title: "Roll Ball and Skate Ball",
    description:
      "Supporting the promotion and development of Roll Ball and Skate Ball in the Philippines and Southeast Asia through sports initiatives and opportunities.",
  },
  {
    number: "05",
    category: "Next Generation",
    title: "Youth Empowerment",
    description:
      "Encouraging young individuals to develop leadership, discipline, teamwork, sportsmanship, and meaningful community participation.",
  },
];

export default function Faculty() {
  return (
    <section
      id="faculty"
      className="bg-[#f8f9ff] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-12">

        {/* Section Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563eb]">
            Our Areas of Expertise
          </span>

          <h2 className="mt-3 font-[var(--font-jakarta)] text-3xl font-extrabold text-[#0b1c30] lg:text-4xl">
            Advancing peace, leadership, development, and sports excellence.
          </h2>

          <p className="mt-5 text-base leading-7 text-slate-600">
            ACE NextGen Consultancy Inc. delivers professional services
            and development initiatives that empower individuals,
            strengthen institutions, promote peaceful communities,
            and create opportunities for the next generation.
          </p>
        </div>

        {/* Expertise Cards */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {expertise.map((item) => (
            <article
              key={item.number}
              className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-[#2563eb]/40 hover:shadow-xl"
            >
              {/* Number */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#002b5c] text-xs font-extrabold text-white transition duration-300 group-hover:bg-[#2563eb]">
                {item.number}
              </div>

              {/* Category */}
              <p className="mt-7 text-xs font-bold uppercase tracking-wide text-[#2563eb]">
                {item.category}
              </p>

              {/* Title */}
              <h3 className="mt-2 text-xl font-extrabold text-[#0b1c30]">
                {item.title}
              </h3>

              {/* Description */}
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {item.description}
              </p>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
