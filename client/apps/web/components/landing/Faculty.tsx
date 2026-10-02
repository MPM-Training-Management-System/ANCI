const faculty = [
  {
    role: "Training Facilitators",
    title: "Experienced Trainers",
    description:
      "Professional trainers facilitate structured learning activities and support participants throughout their training experience.",
    icon: "01",
  },
  {
    role: "Mediation Professionals",
    title: "ADR Practitioners",
    description:
      "Professionals with knowledge and experience in mediation and alternative dispute resolution contribute to relevant learning and services.",
    icon: "02",
  },
  {
    role: "Consultancy",
    title: "Professional Consultants",
    description:
      "Consultants provide organizational and professional development support aligned with client and institutional needs.",
    icon: "03",
  },
];

export default function Faculty() {
  return (
    <section
      id="faculty"
      className="bg-[#f8f9ff] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563eb]">
            Faculty &amp; Professionals
          </span>

          <h2 className="mt-3 font-[var(--font-jakarta)] text-3xl font-extrabold text-[#0b1c30] lg:text-4xl">
            Professionals supporting every learning journey.
          </h2>

          <p className="mt-5 text-base leading-7 text-slate-600">
            ACE NextGen brings together trainers, professionals, and
            consultants who support training and organizational development
            activities.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {faculty.map((item) => (
            <article
              key={item.icon}
              className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#002b5c] text-xs font-extrabold text-white">
                {item.icon}
              </div>

              <p className="mt-7 text-xs font-bold uppercase tracking-wide text-[#2563eb]">
                {item.role}
              </p>

              <h3 className="mt-2 text-xl font-extrabold text-[#0b1c30]">
                {item.title}
              </h3>

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