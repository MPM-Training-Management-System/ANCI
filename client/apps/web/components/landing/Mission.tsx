import Image from "next/image";
import Tony from "@/assets/image/tony.jpg";
import {
  ArrowRight,
  CheckCircle2,
  HeartHandshake,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";

export default function Mission() {
  return (
    <section
      id="mission"
      className="relative overflow-hidden bg-white py-20 lg:py-32"
    >
      {/* ========================================================= */}
      {/* BACKGROUND */}
      {/* ========================================================= */}

      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#C5A059]/10 blur-[120px]" />

      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-[#002b5c]/5 blur-[120px]" />

      <div className="container relative z-10 mx-auto px-6 lg:px-12">

        {/* ========================================================= */}
        {/* MAIN CONTENT */}
        {/* ========================================================= */}

        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">

          {/* ===================================================== */}
          {/* LEFT - IMAGE */}
          {/* ===================================================== */}

          <div className="relative">

            {/* Glow */}
            <div className="absolute -inset-6 rounded-[50px] bg-[#C5A059]/10 blur-3xl" />

            {/* Image */}
            <div
              className="
                relative
                overflow-hidden
                rounded-[40px]
                border
                border-gray-100
                bg-gray-100
                shadow-2xl
              "
            >
              <Image
                src={Tony}
                alt="ACE NextGen leadership and institutional excellence"
                width={700}
                height={800}
                priority={false}
                className="
                  h-auto
                  w-full
                  object-cover
                  transition-transform
                  duration-700
                  hover:scale-105
                "
              />

              {/* Image Overlay */}
              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-[#002b5c]/70
                  via-transparent
                  to-transparent
                "
              />

              {/* Bottom Image Caption */}
              <div className="absolute bottom-0 left-0 right-0 p-7 lg:p-9">

                <div className="flex items-center gap-3">

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-xl
                      bg-white/15
                      backdrop-blur-md
                    "
                  >
                    <HeartHandshake className="h-5 w-5 text-white" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-white">
                      People. Institutions. Communities.
                    </p>

                    <p className="mt-1 text-xs text-white/60">
                      Creating meaningful and sustainable impact.
                    </p>
                  </div>

                </div>
              </div>
            </div>

            {/* ================================================= */}
            {/* FLOATING CARD */}
            {/* ================================================= */}

            <div
              className="
                absolute
                -bottom-7
                -right-5
                hidden
                rounded-2xl
                border
                border-white/70
                bg-white
                p-5
                shadow-xl
                sm:block
                lg:-right-10
              "
            >
              <div className="flex items-center gap-3">

                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-green-50
                  "
                >
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                </div>

                <div>
                  <p className="text-xs font-bold text-[#002b5c]">
                    Professional Excellence
                  </p>

                  <p className="mt-1 text-[10px] text-gray-400">
                    Built around integrity
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* ===================================================== */}
          {/* RIGHT - CONTENT */}
          {/* ===================================================== */}

          <div>

            {/* Eyebrow */}
            <div className="mb-5 flex items-center gap-3">

              <span className="h-px w-10 bg-[#C5A059]" />

              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#C5A059]">
                Our Mission
              </p>

            </div>

            {/* Heading */}
            <h2
              className="
                max-w-2xl
                text-4xl
                font-extrabold
                leading-[1.1]
                tracking-tight
                text-[#002b5c]
                sm:text-5xl
                lg:text-[54px]
              "
            >
              Empowering People.
              <br />
              <span className="text-[#C5A059]">
                Strengthening Institutions.
              </span>
            </h2>

            {/* Description */}
            <p className="mt-7 max-w-xl text-base leading-8 text-gray-600 lg:text-lg">
              ACE NextGen Consultancy Inc. is committed to helping
              organizations and communities build stronger people,
              better systems, and sustainable institutions through
              professional services, training, and capacity development.
            </p>

            <p className="mt-5 max-w-xl text-base leading-8 text-gray-500">
              Our approach connects professional service delivery with
              structured training, assessment, and certification—creating
              a complete pathway from organizational needs to measurable
              professional development.
            </p>

            {/* ================================================= */}
            {/* MISSION POINTS */}
            {/* ================================================= */}

            <div className="mt-9 grid gap-5 sm:grid-cols-2">

              {/* Item 1 */}
              <div
                className="
                  group
                  rounded-2xl
                  border
                  border-gray-100
                  bg-gray-50
                  p-5
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:bg-white
                  hover:shadow-lg
                "
              >
                <div className="flex items-start gap-4">

                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-[#002b5c]/5
                      transition-colors
                      group-hover:bg-[#002b5c]
                    "
                  >
                    <Target
                      className="
                        h-5
                        w-5
                        text-[#002b5c]
                        transition-colors
                        group-hover:text-white
                      "
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#002b5c]">
                      Purpose-Driven Services
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-gray-500">
                      Professional services designed around real
                      organizational needs.
                    </p>
                  </div>

                </div>
              </div>

              {/* Item 2 */}
              <div
                className="
                  group
                  rounded-2xl
                  border
                  border-gray-100
                  bg-gray-50
                  p-5
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:bg-white
                  hover:shadow-lg
                "
              >
                <div className="flex items-start gap-4">

                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-[#C5A059]/10
                      transition-colors
                      group-hover:bg-[#C5A059]
                    "
                  >
                    <Users
                      className="
                        h-5
                        w-5
                        text-[#C5A059]
                        transition-colors
                        group-hover:text-white
                      "
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#002b5c]">
                      People Development
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-gray-500">
                      Building knowledge, skills, leadership, and
                      professional capability.
                    </p>
                  </div>

                </div>
              </div>

            </div>

            {/* ================================================= */}
            {/* VALUES */}
            {/* ================================================= */}

            <div className="mt-8 space-y-3">

              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#C5A059]" />

                <span className="text-sm font-medium text-gray-600">
                  Integrity in every engagement
                </span>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#C5A059]" />

                <span className="text-sm font-medium text-gray-600">
                  Excellence in professional development
                </span>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#C5A059]" />

                <span className="text-sm font-medium text-gray-600">
                  Sustainable impact for institutions and communities
                </span>
              </div>

            </div>

            {/* CTA */}
            <div className="mt-10">

              <a
                href="#services"
                className="
                  group
                  inline-flex
                  items-center
                  gap-3
                  rounded-full
                  bg-[#002b5c]
                  px-6
                  py-3.5
                  text-sm
                  font-bold
                  text-white
                  shadow-lg
                  shadow-[#002b5c]/20
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:bg-[#003b7d]
                  hover:shadow-xl
                "
              >
                Explore Our Services

                <ArrowRight
                  className="
                    h-4
                    w-4
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                />
              </a>

            </div>

          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM MISSION BAR */}
        {/* ========================================================= */}

        <div
          className="
            mt-24
            grid
            overflow-hidden
            rounded-3xl
            border
            border-gray-100
            bg-gray-50
            sm:grid-cols-3
          "
        >

          {/* Item */}
          <div
            className="
              flex
              items-center
              gap-4
              border-b
              border-gray-200
              p-6
              sm:border-b-0
              sm:border-r
              lg:p-8
            "
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#002b5c]">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>

            <div>
              <p className="text-sm font-bold text-[#002b5c]">
                Integrity
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Ethical and responsible practice
              </p>
            </div>
          </div>

          {/* Item */}
          <div
            className="
              flex
              items-center
              gap-4
              border-b
              border-gray-200
              p-6
              sm:border-b-0
              sm:border-r
              lg:p-8
            "
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#C5A059]">
              <Target className="h-5 w-5 text-white" />
            </div>

            <div>
              <p className="text-sm font-bold text-[#002b5c]">
                Excellence
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Quality-driven professional development
              </p>
            </div>
          </div>

          {/* Item */}
          <div className="flex items-center gap-4 p-6 lg:p-8">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#002b5c]">
              <Users className="h-5 w-5 text-white" />
            </div>

            <div>
              <p className="text-sm font-bold text-[#002b5c]">
                Impact
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Stronger people and institutions
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}