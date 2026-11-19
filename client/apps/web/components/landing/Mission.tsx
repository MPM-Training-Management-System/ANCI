
const principles = [
  "Faith",
  "Professionalism",
  "Integrity",
  "Service",
  "Patriotism",
  "Peacebuilding",
];

export default function Mission() {
  return (
    <section
      id="about"
      className="bg-white py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12">

          {/* Left - Company Mission */}
          <div className="lg:col-span-6">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563eb]">
              About ACE NextGen
            </span>

            <h2 className="mt-3 font-[var(--font-jakarta)] text-3xl font-extrabold leading-tight text-[#0b1c30] lg:text-4xl">
              Honoring God and serving the Nation through peace, leadership, and development.
            </h2>

            <p className="mt-6 text-base leading-8 text-slate-600">
              ACE NextGen Consultancy Inc. is a consultancy and development
              company founded by Pastor Antonio "Tony" Ortega. The company
              is committed to advancing peacebuilding, ethical leadership,
              institutional development, human capacity building, and
              sports excellence in the Philippines and Southeast Asia.
            </p>

            <p className="mt-4 text-base leading-8 text-slate-600">
              Through professional consultancy, training, mediation, and
              development initiatives, ACE NextGen seeks to empower
              individuals, strengthen institutions, and build peaceful
              and productive communities.
            </p>

            <a
              href="#services"
              className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#2563eb] hover:underline"
            >
              Discover our services
              <span>→</span>
            </a>
          </div>

          {/* Right - Corporate Principles */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl bg-[#0b192c] p-7 text-white shadow-2xl lg:p-10">

              <div>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#6fd1d7]">
                  Our Vision
                </span>

                <h3 className="mt-3 text-2xl font-extrabold">
                  Building a future guided by peace, integrity, and excellence.
                </h3>

                <p className="mt-4 text-sm leading-7 text-blue-100">
                  To be a leading force in the Philippines and Southeast
                  Asia for peaceful governance, ethical leadership,
                  human development, and sports excellence, honoring
                  God and giving glory to our Country.
                </p>
              </div>

              {/* Corporate Principles */}
              <div className="mt-10">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#6fd1d7]">
                  Our Corporate Principles
                </span>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {principles.map((principle, index) => (
                    <div
                      key={principle}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-4 text-center transition duration-300 hover:border-[#6fd1d7]/50 hover:bg-white/10"
                    >
                      <span className="text-xs font-extrabold text-[#6fd1d7]">
                        0{index + 1}
                      </span>

                      <p className="mt-2 text-xs font-bold text-white sm:text-sm">
                        {principle}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mission Statement */}
              <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#6fd1d7]">
                  Our Commitment
                </span>

                <p className="mt-3 text-sm leading-7 text-blue-100">
                  Integrating peacebuilding, development, and sports
                  as complementary pillars for sustainable growth,
                  social harmony, and national advancement.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
