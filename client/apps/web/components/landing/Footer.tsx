import {
  ArrowUpRight,
  CheckCircle2,
  Headphones,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#071a30] text-white">

      {/* ========================================================= */}
      {/* BACKGROUND */}
      {/* ========================================================= */}

      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />

      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-secondary/10 blur-[130px]" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="container relative z-10 mx-auto px-6 lg:px-12">

        {/* ========================================================= */}
        {/* MAIN FOOTER */}
        {/* ========================================================= */}

        <div className="grid gap-12 border-b border-white/10 py-16 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] lg:py-20">

          {/* ===================================================== */}
          {/* BRAND */}
          {/* ===================================================== */}

          <div className="max-w-sm">

            {/* Brand */}
            <a
              href="#"
              className="group inline-flex items-center gap-3"
            >
              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/10
                  bg-white/10
                  text-sm
                  font-extrabold
                  text-white
                  transition-all
                  duration-300
                  group-hover:scale-105
                  group-hover:bg-white/15
                "
              >
                ACE
              </div>

              <div>
                <p className="text-base font-extrabold tracking-wide">
                  ACE NextGen
                </p>

                <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/40">
                  Consultancy Inc.
                </p>
              </div>
            </a>

            {/* Description */}
            <p className="mt-6 text-sm leading-7 text-white/50">
              Building institutional capacity through professional
              services, training, governance, mediation, leadership,
              and sports development.
            </p>

            {/* Platform Status */}
            <div
              className="
                mt-7
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-white/10
                bg-white/5
                px-3
                py-2
              "
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
                <span className="relative h-2 w-2 rounded-full bg-green-400" />
              </span>

              <span className="text-[9px] font-bold uppercase tracking-wider text-white/50">
                Integrated Services & Training Platform
              </span>
            </div>
          </div>

          {/* ===================================================== */}
          {/* PLATFORM */}
          {/* ===================================================== */}

          <div>

            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
              Platform
            </h3>

            <ul className="mt-6 space-y-4">

              <li>
                <a
                  href="#services"
                  className="
                    group
                    flex
                    items-center
                    gap-2
                    text-sm
                    text-white/50
                    transition-colors
                    hover:text-white
                  "
                >
                  Service Management

                  <ArrowUpRight
                    className="
                      h-3
                      w-3
                      opacity-0
                      transition-all
                      group-hover:translate-x-0.5
                      group-hover:opacity-100
                    "
                  />
                </a>
              </li>

              <li>
                <a
                  href="#training"
                  className="
                    group
                    flex
                    items-center
                    gap-2
                    text-sm
                    text-white/50
                    transition-colors
                    hover:text-white
                  "
                >
                  Training Management

                  <ArrowUpRight
                    className="
                      h-3
                      w-3
                      opacity-0
                      transition-all
                      group-hover:translate-x-0.5
                      group-hover:opacity-100
                    "
                  />
                </a>
              </li>

              <li>
                <a
                  href="#certificate"
                  className="
                    group
                    flex
                    items-center
                    gap-2
                    text-sm
                    text-white/50
                    transition-colors
                    hover:text-white
                  "
                >
                  Digital Certificates

                  <ArrowUpRight
                    className="
                      h-3
                      w-3
                      opacity-0
                      transition-all
                      group-hover:translate-x-0.5
                      group-hover:opacity-100
                    "
                  />
                </a>
              </li>

              <li>
                <a
                  href="#contact"
                  className="
                    group
                    flex
                    items-center
                    gap-2
                    text-sm
                    text-white/50
                    transition-colors
                    hover:text-white
                  "
                >
                  Contact Us

                  <ArrowUpRight
                    className="
                      h-3
                      w-3
                      opacity-0
                      transition-all
                      group-hover:translate-x-0.5
                      group-hover:opacity-100
                    "
                  />
                </a>
              </li>

            </ul>
          </div>

          {/* ===================================================== */}
          {/* SERVICES */}
          {/* ===================================================== */}

          <div>

            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
              Services
            </h3>

            <ul className="mt-6 space-y-4">

              <li>
                <a
                  href="#services"
                  className="
                    text-sm
                    text-white/50
                    transition-colors
                    hover:text-white
                  "
                >
                  Mediation & Peace
                </a>
              </li>

              <li>
                <a
                  href="#services"
                  className="
                    text-sm
                    text-white/50
                    transition-colors
                    hover:text-white
                  "
                >
                  Governance
                </a>
              </li>

              <li>
                <a
                  href="#services"
                  className="
                    text-sm
                    text-white/50
                    transition-colors
                    hover:text-white
                  "
                >
                  Sports Development
                </a>
              </li>

              <li>
                <a
                  href="#services"
                  className="
                    text-sm
                    text-white/50
                    transition-colors
                    hover:text-white
                  "
                >
                  Training Programs
                </a>
              </li>

            </ul>
          </div>

          {/* ===================================================== */}
          {/* CONTACT */}
          {/* ===================================================== */}

          <div>

            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
              Get in Touch
            </h3>

            <div className="mt-6 space-y-5">

              {/* Email */}
              <div className="flex items-start gap-3">

                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-white/5
                  "
                >
                  <Mail className="h-4 w-4 text-white/60" />
                </div>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-white/30">
                    Email
                  </p>

                  <a
                    href="mailto:contact@acenextgen.org"
                    className="
                      mt-1
                      block
                      text-sm
                      text-white/60
                      transition-colors
                      hover:text-white
                    "
                  >
                    contact@acenextgen.org
                  </a>
                </div>

              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">

                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-white/5
                  "
                >
                  <Phone className="h-4 w-4 text-white/60" />
                </div>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-white/30">
                    Phone
                  </p>

                  <p className="mt-1 text-sm text-white/60">
                    +63 900 000 0000
                  </p>
                </div>

              </div>

              {/* Office */}
              <div className="flex items-start gap-3">

                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-white/5
                  "
                >
                  <MapPin className="h-4 w-4 text-white/60" />
                </div>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-white/30">
                    Office
                  </p>

                  <p className="mt-1 text-sm text-white/60">
                    Global Headquarters
                  </p>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TRUST BAR */}
        {/* ========================================================= */}

        <div
          className="
            flex
            flex-col
            gap-6
            border-b
            border-white/10
            py-7
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          <div className="flex items-center gap-3">

            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                bg-white/5
              "
            >
              <ShieldCheck className="h-4 w-4 text-white/60" />
            </div>

            <div>
              <p className="text-xs font-bold text-white/70">
                Structured & Connected
              </p>

              <p className="mt-1 text-[9px] text-white/30">
                From service request to professional certification
              </p>
            </div>

          </div>

          <div className="flex flex-wrap items-center gap-5">

            <div className="flex items-center gap-2 text-[10px] text-white/40">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
              Service Tracking
            </div>

            <div className="flex items-center gap-2 text-[10px] text-white/40">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
              Training Management
            </div>

            <div className="flex items-center gap-2 text-[10px] text-white/40">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
              Digital Certification
            </div>

          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM FOOTER */}
        {/* ========================================================= */}

        <div
          className="
            flex
            flex-col
            gap-5
            py-7
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          {/* Copyright */}
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} ACE NextGen Consultancy Inc.
            All rights reserved.
          </p>

          {/* Social / Back to Top */}
          <div className="flex items-center gap-3">

            {/* Facebook */}
            <a
              href="#"
              aria-label="Facebook"
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                border
                border-white/10
                bg-white/5
                text-xs
                font-extrabold
                text-white/40
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-white/20
                hover:bg-white/10
                hover:text-white
              "
            >
              f
            </a>

            {/* LinkedIn */}
            <a
              href="#"
              aria-label="LinkedIn"
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                border
                border-white/10
                bg-white/5
                text-[10px]
                font-extrabold
                text-white/40
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-white/20
                hover:bg-white/10
                hover:text-white
              "
            >
              in
            </a>

            {/* Back to Top */}
            <a
              href="#"
              aria-label="Back to top"
              className="
                ml-2
                flex
                h-9
                items-center
                gap-2
                rounded-full
                border
                border-white/10
                bg-white/5
                px-4
                text-[9px]
                font-bold
                uppercase
                tracking-wider
                text-white/50
                transition-all
                duration-300
                hover:-translate-y-1
                hover:bg-white/10
                hover:text-white
              "
            >
              Back to top

              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>

          </div>
        </div>

      </div>
    </footer>
  );
}