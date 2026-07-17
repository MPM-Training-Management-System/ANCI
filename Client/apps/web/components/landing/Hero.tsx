import { Button } from "@repo/ui/index";


export default function Hero() {
  return (
    <section className="flex overflow-hidden bg-surface lg:pt-32 ">
      {/* Background Blur */}
      <div className="absolute top-0 right-0 h-[800px] w-[500px] translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/40 blur-[120px]" />
      <div className="absolute bottom-0 left-0 h-[100px] w-[200px] -translate-x-1/3 translate-y-1/3 rounded-full bg-primary blur-[100px]" />

      <div className="container relative z-10 mx-auto px-6 lg:px-12">
        <div className="mx-auto max-w-5xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-5 py-2 shadow backdrop-blur-md">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-xs font-bold uppercase tracking-[0.25em] text-transparent">
              Sovereign Peace & Progress
            </span>
          </div>

          {/* Title */}
          <h1 className="text-5xl font-extrabold  leading-tight text-[#002b5c] lg:text-7xl">
            Institutional Capacity
            <br />
            <span className="bg-gradient-to-r from-[#002b5c] to-secondary bg-clip-text text-transparent">
              Built to Last
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-gray-600 lg:text-xl">
            Transforming governance through expert alternative dispute
            resolution, restorative justice, and elite sports development
            frameworks.
          </p>

          {/* Buttons */}
          <div className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
            <Button variant="primary"
              className="rounded-xl bg-[#002b5c] px-10 py-5 text-lg font-bold text-white shadow-xl transition hover:-translate-y-1 hover:bg-[#001f42]"
            >
              Book a Strategy Call
            </Button>

            <Button
              variant="outline"
            >
              See Our Work
            </Button>
          </div>

          {/* Hero Image */}
          <div className="relative mx-auto mt-20 max-w-6xl">
            <div className="overflow-hidden rounded-[30px] border border-gray-200 bg-white shadow-2xl">
              {/* <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxUWozaZaBfkUQVZvx4GjwwaB-V635q7Peoj59dmmLsNfmnXGS4X1xxlN37Rb-26mibNt6mICdCtGnUTitPswKgYomFma1QXAXBxnoygubJVnA9Mck1Oqe6Ka2XPP3IbgibRhE6jcNZvtS5exDWxEWYIPRW8edUiyxzVzBPVWwmWDQeYHmPmrSRRqrUkjXtLUbS2TCcUA31CMONH5zS8Y-d8OO6Vz09tUo-Q-L7iR6hAFVniIfp4dHbO7EQ49jmEu0EIWacikocrpA"
                alt="Institutional Excellence"
                width={1200}
                height={700}
                priority
                className="h-auto w-full object-cover"
              /> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}