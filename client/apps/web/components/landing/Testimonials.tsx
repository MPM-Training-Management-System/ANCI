const testimonials = [
  {
    quote:
      "The platform gives participants a more organized experience from registration through training completion.",
    role: "Training Participant",
  },
  {
    quote:
      "Centralized training information makes it easier to monitor participants, schedules, attendance, and assessments.",
    role: "Training Facilitator",
  },
  {
    quote:
      "Integrated records help the organization manage training activities in a more structured way.",
    role: "Administrative Personnel",
  },
];

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="bg-white py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563eb]">
            Participant Experience
          </span>

          <h2 className="mt-3 font-[var(--font-jakarta)] text-3xl font-extrabold text-[#0b1c30] lg:text-4xl">
            Built around people and their learning journey.
          </h2>

          <p className="mt-5 text-base leading-7 text-slate-600">
            The integrated approach is designed to make training and service
            processes easier to understand, manage, and monitor.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {testimonials.map((item) => (
            <article
              key={item.role}
              className="rounded-2xl border border-slate-200 bg-[#f8f9ff] p-8"
            >
              <div className="text-3xl text-[#2563eb]">“</div>

              <p className="mt-3 text-base leading-8 text-[#0b1c30]">
                {item.quote}
              </p>

              <div className="mt-7 border-t border-slate-200 pt-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {item.role}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}