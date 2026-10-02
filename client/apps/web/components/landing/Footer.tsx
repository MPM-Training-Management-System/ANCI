import Link from "next/link";

const platformLinks = [
  {
    label: "Why ACE NextGen",
    href: "#why-join",
  },
  {
    label: "Training Programs",
    href: "#programs",
  },
  {
    label: "Services",
    href: "#services",
  },
  {
    label: "Faculty",
    href: "#faculty",
  },
  {
    label: "Contact",
    href: "#contact",
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-[#eff4ff]">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link
              href="#home"
              className="flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-[#002b5c]">
                <img
                  src="/ANCILOGO.png"
                  alt="ACE NextGen"
                  className="h-full w-full object-contain"
                />
              </div>

              <div>
                <p className="text-sm font-extrabold text-[#0b1c30]">
                  ACE NEXTGEN
                </p>

                <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">
                  Consultancy Inc.
                </p>
              </div>
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-7 text-slate-600">
              Integrated professional training, mediation-related services,
              consultancy, and organizational capacity building.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0b1c30]">
              Platform
            </h3>

            <nav className="mt-5 flex flex-col gap-3">
              {platformLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm text-slate-500 transition hover:text-[#2563eb]"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0b1c30]">
              Services
            </h3>

            <nav className="mt-5 flex flex-col gap-3">
              <a
                href="#services"
                className="text-sm text-slate-500 transition hover:text-[#2563eb]"
              >
                Training
              </a>

              <a
                href="#services"
                className="text-sm text-slate-500 transition hover:text-[#2563eb]"
              >
                Mediation Services
              </a>

              <a
                href="#services"
                className="text-sm text-slate-500 transition hover:text-[#2563eb]"
              >
                Consultancy
              </a>

              <a
                href="#services"
                className="text-sm text-slate-500 transition hover:text-[#2563eb]"
              >
                Capacity Building
              </a>
            </nav>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0b1c30]">
              Account
            </h3>

            <nav className="mt-5 flex flex-col gap-3">
              <Link
                href="/login"
                className="text-sm text-slate-500 transition hover:text-[#2563eb]"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="text-sm text-slate-500 transition hover:text-[#2563eb]"
              >
                Register
              </Link>

              <a
                href="#contact"
                className="text-sm text-slate-500 transition hover:text-[#2563eb]"
              >
                Contact Us
              </a>
            </nav>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-slate-200 pt-8 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} ACE NextGen Consultancy Inc. All
            rights reserved.
          </p>

          <div className="flex gap-6">
            <a
              href="#governance"
              className="transition hover:text-[#2563eb]"
            >
              Governance
            </a>

            <a
              href="#contact"
              className="transition hover:text-[#2563eb]"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}