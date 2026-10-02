const benefits = [
  {
    number: "01",
    title: "Structured Learning",
    description:
      "Organized training programs, learning materials, assessments, attendance, and completion tracking.",
  },
  {
    number: "02",
    title: "Professional Development",
    description:
      "Build practical knowledge and skills through structured professional training and development activities.",
  },
  {
    number: "03",
    title: "Integrated Services",
    description:
      "Access training, mediation-related services, consultancy, and organizational support through one platform.",
  },
  {
    number: "04",
    title: "Digital Experience",
    description:
      "A modern platform for registration, learning, attendance, assessments, certificates, and participant records.",
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
              A more connected way to learn, develop, and grow.
            </h2>

            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
              ACE NextGen brings professional training and consultancy
              activities into an organized experience designed around
              participants, trainers, and organizations.
            </p>

            <a
              href="#programs"
              className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#2563eb] hover:underline"
            >
              Explore our training programs
              <span>→</span>
            </a>
          </div>

          {/* Benefits */}
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