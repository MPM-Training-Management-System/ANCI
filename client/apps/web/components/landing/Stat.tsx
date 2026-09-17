export default function Stats() {
  return (
    <section className="relative overflow-hidden bg-gray-100 py-12 lg:py-14">
      {/* Background accents */}
      <div className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-[#C5A059]/10 blur-[100px]" />

      <div className="pointer-events-none absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-[#002b5c]/5 blur-[100px]" />

      <div className="container relative z-10 mx-auto px-6 lg:px-12">
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm md:grid-cols-3">
          {/* Stat 1 */}
          <div className="group relative p-8 text-center transition-all duration-300 hover:bg-gray-50 lg:p-10">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#002b5c]/5 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#002b5c]">
              <span className="text-lg font-extrabold text-[#002b5c] transition-colors duration-300 group-hover:text-white">
                +
              </span>
            </div>

            <h3 className="mt-5 text-3xl font-extrabold tracking-tight text-[#002b5c] sm:text-4xl">
              1,200+
            </h3>

            <p className="mt-2 text-sm font-medium text-gray-500">
              Professionals Certified
            </p>
          </div>

          {/* Divider */}
          <div className="hidden w-px bg-gray-200 md:block" />

          {/* Stat 2 */}
          <div className="group relative p-8 text-center transition-all duration-300 hover:bg-gray-50 lg:p-10">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C5A059]/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#C5A059]">
              <span className="text-lg font-extrabold text-[#C5A059] transition-colors duration-300 group-hover:text-white">
                %
              </span>
            </div>

            <h3 className="mt-5 text-3xl font-extrabold tracking-tight text-[#002b5c] sm:text-4xl">
              94%
            </h3>

            <p className="mt-2 text-sm font-medium text-gray-500">
              Completion Rate
            </p>
          </div>

          {/* Divider */}
          <div className="hidden w-px bg-gray-200 md:block" />

          {/* Stat 3 */}
          <div className="group relative p-8 text-center transition-all duration-300 hover:bg-gray-50 lg:p-10">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#002b5c]/5 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#002b5c]">
              <span className="text-sm font-extrabold text-[#002b5c] transition-colors duration-300 group-hover:text-white">
                ISO
              </span>
            </div>

            <h3 className="mt-5 text-3xl font-extrabold tracking-tight text-[#002b5c] sm:text-4xl">
              Global
            </h3>

            <p className="mt-2 text-sm font-medium text-gray-500">
              Industry Standards
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}