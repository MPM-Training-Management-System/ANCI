import Image from "next/image";

export default function Mission() {
  return (
    <section
      id="mission"
      className="overflow-hidden bg-white py-20 lg:py-32"
    >
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col items-center gap-16 lg:flex-row">
          {/* Left Image */}
          <div className="relative lg:w-1/2">
            <div className="absolute inset-0 scale-90 rounded-full bg-[#C5A059]/10 blur-[80px]" />

            <div className="relative overflow-hidden rounded-[40px] shadow-2xl">
              {/* <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxUWozaZaBfkUQVZvx4GjwwaB-V635q7Peoj59dmmLsNfmnXGS4X1xxlN37Rb-26mibNt6mICdCtGnUTitPswKgYomFma1QXAXBxnoygubJVnA9Mck1Oqe6Ka2XPP3IbgibRhE6jcNZvtS5exDWxEWYIPRW8edUiyxzVzBPVWwmWDQeYHmPmrSRRqrUkjXtLUbS2TCcUA31CMONH5zS8Y-d8OO6Vz09tUo-Q-L7iR6hAFVniIfp4dHbO7EQ49jmEu0EIWacikocrpA"
                alt="Institutional Excellence"
                width={700}
                height={800}
                className="h-auto w-full object-cover"
              /> */}
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:w-1/2">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-secondary">
              Championing Harmony
            </p>

            <h2 className="mb-8 text-4xl font-extrabold leading-tight text-[#002b5c] lg:text-5xl">
              Integrity and Excellence at Scale
            </h2>

            <p className="mb-10 text-lg leading-8 text-gray-600">
              ACE NEXTGEN operates at the intersection of professional
              ethics and leadership. We believe that true institutional
              growth requires a foundation of{" "}
              <strong>Restorative Ethics</strong> and the cultivation of{" "}
              <strong>Youth Leadership</strong> that understands the
              weight of responsibility.
            </p>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-8">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
                <h3 className="text-4xl font-extrabold text-[#002b5c]">
                  200+
                </h3>
                <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Policies Drafted
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
                <h3 className="text-4xl font-extrabold text-[#002b5c]">
                  15+
                </h3>
                <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Years Experience
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}