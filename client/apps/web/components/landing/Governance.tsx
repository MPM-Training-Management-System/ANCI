
"use client";

type OrganizationalMember = {
  number: string;
  name: string;
  position: string;
  initials: string;
  featured?: boolean;
};

const organizationalMembers: OrganizationalMember[] = [
  {
    number: "01",
    name: "Antonio T. Ortega",
    position: "President",
    initials: "ATO",
    featured: true,
  },
  {
    number: "02",
    name: "Dr. Danilo J. Carandang",
    position: "Chairman",
    initials: "DJC",
  },
  {
    number: "03",
    name: "Ptr. Alexander T. Talaue",
    position: "Treasurer",
    initials: "ATT",
  },
  {
    number: "04",
    name: "Eleanor T. Ortega",
    position: "Secretary",
    initials: "ETO",
  },
  {
    number: "05",
    name: "Joie Catleya Ortega",
    position: "Board of Directors",
    initials: "JCO",
  },
];

function MemberCard({
  member,
}: {
  member: OrganizationalMember;
}) {
  return (
    <div
      className={`group relative flex h-full flex-col items-center justify-center overflow-hidden rounded-2xl border p-6 text-center transition duration-300 hover:-translate-y-1 hover:border-[#6fd1d7]/60 hover:bg-[#123968] ${
        member.featured
          ? "border-[#1671bd]/70 bg-gradient-to-br from-[#123c70] to-[#071d3c]"
          : "border-white/10 bg-white/[0.04]"
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#6fd1d7]/50 to-transparent" />

      <span className="absolute right-4 top-4 text-xs font-bold tracking-widest text-[#6fd1d7]/70">
        {member.number}
      </span>

      <div
        className={`flex h-20 w-20 items-center justify-center rounded-full border-2 bg-[#0b2547] font-[var(--font-jakarta)] text-xl font-extrabold text-[#6fd1d7] shadow-lg ${
          member.featured
            ? "border-[#6fd1d7] sm:h-24 sm:w-24"
            : "border-[#2779a5]/80"
        }`}
      >
        {member.initials}
      </div>

      <h3 className="mt-5 text-base font-extrabold leading-6 text-white sm:text-lg">
        {member.name}
      </h3>

      <p className="mt-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#6fd1d7] sm:text-sm">
        {member.position}
      </p>
    </div>
  );
}

export default function Governance() {
  const president = organizationalMembers[0];

  if (!president) {
    return null;
  }

  const officers = organizationalMembers.slice(1);

  return (
    <section
      id="governance"
      className="relative isolate overflow-hidden bg-[#07172b] py-20 text-white lg:py-28"
    >
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 -top-40 -z-10 h-96 w-96 rounded-full bg-[#174a85]/25 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 -right-40 -z-10 h-96 w-96 rounded-full bg-[#087c99]/15 blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        {/* Section heading */}
        <div className="mx-auto mb-14 max-w-3xl text-center lg:mb-16">
          <span className="inline-flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.22em] text-[#6fd1d7]">
            <span className="h-px w-8 bg-[#6fd1d7]" />
            Leadership &amp; Organization
            <span className="h-px w-8 bg-[#6fd1d7]" />
          </span>

          <h2 className="mt-5 font-[var(--font-jakarta)] text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
            Organizational Chart
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-blue-100/70 sm:text-base">
            Meet the leadership team of ACE NextGen Consultancy Inc.
            and the officers responsible for guiding the organization.
          </p>
        </div>

        {/* President */}
        <div className="mx-auto max-w-md">
          <MemberCard member={president} />
        </div>

        {/* Organizational connectors */}
        <div
          aria-hidden="true"
          className="relative mx-auto h-16 max-w-5xl"
        >
          <div className="absolute left-1/2 top-0 h-8 w-px -translate-x-1/2 bg-[#36c5d3]" />

          <div className="absolute left-[12.5%] right-[12.5%] top-8 h-px bg-[#36c5d3]" />

          <div className="absolute left-[12.5%] top-8 h-8 w-px bg-[#36c5d3]" />

          <div className="absolute left-[37.5%] top-8 h-8 w-px bg-[#36c5d3]" />

          <div className="absolute left-[62.5%] top-8 h-8 w-px bg-[#36c5d3]" />

          <div className="absolute left-[87.5%] top-8 h-8 w-px bg-[#36c5d3]" />
        </div>

        {/* Board and officers */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {officers.map((member) => (
            <MemberCard
              key={member.number}
              member={member}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          <div className="h-px w-16 bg-[#6fd1d7]/50" />

          <p className="text-xs leading-6 text-blue-100/50 sm:text-sm">
            ACE NextGen Consultancy Inc.
            <span className="mx-2 text-[#6fd1d7]">•</span>
            Leadership and Governance
          </p>

          <a
            href="#contact"
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#07172b] transition duration-300 hover:-translate-y-1 hover:bg-[#6fd1d7]"
          >
            Contact ACE NextGen
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
