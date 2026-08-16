
import { Button, Input } from "@repo/ui/index"



export default function Contact() {
  return (
    <section
      id="contact"
      className="bg-gray-50 py-20 lg:py-32"
    >
      <div className="container mx-auto px-6 lg:px-12">
        <div className="overflow-hidden rounded-[40px] border border-white/50 bg-white shadow-2xl lg:flex">
          {/* Left Side */}
          <div className="relative bg-[#002b5c] p-10 text-white lg:w-2/5 lg:p-14">
            <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-[#C5A059]/10 blur-[80px]" />

            <div className="relative z-10">
              <h2 className="mb-6 text-3xl font-bold">
                Start Your Consultation
              </h2>

              <p className="leading-8 text-gray-300">
                We look forward to discussing how we can help build
                institutional capacity and sustainable leadership
                for your organization.
              </p>

              <div className="mt-12 space-y-8">
                {/* Email */}
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                    📧
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">
                      Email Address
                    </p>

                    <p className="font-semibold">
                      contact@acenextgen.org
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                    📍
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">
                      Office
                    </p>

                    <p className="font-semibold">
                      Global Headquarters
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                    ☎️
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">
                      Phone
                    </p>

                    <p className="font-semibold">
                      +63 900 000 0000
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="bg-white p-10 lg:w-3/5 lg:p-14">
            <form className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-[#002b5c]">
                  Full Name
                </label>

                <Input
                  type="text"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-[#002b5c]">
                  Email Address
                </label>

                <Input
                  type="email"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-[#002b5c]">
                  Area of Interest
                </label>

                <select className="w-full rounded-xl border border-gray-200 px-5 py-4 outline-none transition focus:border-[#C5A059]">
                  <option>Mediation Frameworks</option>
                  <option>Governance & Policy</option>
                  <option>Sports Development</option>
                  <option>Certification</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-[#002b5c]">
                  Message
                </label>

                <textarea
                  rows={5}
                  placeholder="How can we help?"
                  className="w-full rounded-xl border border-gray-200 px-5 py-4 outline-none transition focus:border-[#C5A059]"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
              >
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}