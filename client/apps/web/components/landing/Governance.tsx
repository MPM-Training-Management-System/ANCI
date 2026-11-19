
"use client";


import Tony from "@/assets/image/leader/tony.jpg";
import Danilo from "@/assets/image/leader/danilo.jpg";
import Leny from "@/assets/image/leader/leny.jpg";
import Image, { StaticImageData } from "next/image";
type OrganizationalMember = {
  number: string;
  name: string;
  position: string;
    image: string | StaticImageData;
  featured?: boolean;
};

const organizationalMembers: OrganizationalMember[] = [
  {
    number: "01",
    name: "Antonio T. Ortega",
    position: "President",
    image: Tony,
    featured: true,
  },
  {
    number: "02",
    name: "Dr. Danilo J. Carandang",
    position: "Chairman",
    image: Danilo,
  },
  {
    number: "03",
    name: "Ptr. Alexander T. Talaue",
    position: "Treasurer",
    image: "/images/leadership/alexander-talaue.jpg",
  },
  {
    number: "04",
    name: "Eleanor T. Ortega",
    position: "Secretary",
    image: Leny,
  },
  {
    number: "05",
    name: "Joie Catleya Ortega",
    position: "Board of Directors",
    image: "/images/leadership/joie-ortega.jpg",
  },
];

function MemberCard({
  member,
}: {
  member: OrganizationalMember;
}) {
  return (
    <article
      className={`group overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
        member.featured
          ? "border-[#2563eb]/30 bg-white shadow-xl"
          : "border-slate-200 bg-white shadow-sm hover:border-[#2563eb]/40"
      }`}
    >
      {/* Profile Image */}
      <div
        className={`relative overflow-hidden bg-[#eaf0f8] ${
          member.featured ? "aspect-[5/4]" : "aspect-[4/3]"
        }`}
      >
       <Image
  src={member.image}
  alt={member.name}
  fill
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
  priority={member.featured}
/>

        {/* Image Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#07172b]/50 to-transparent" />

        {/* Number */}
        <span className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-[#002b5c]/85 text-xs font-extrabold text-white backdrop-blur-sm">
          {member.number}
        </span>

        {member.featured && (
          <span className="absolute bottom-4 left-4 rounded-full bg-[#6fd1d7] px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#002b5c]">
            Company Leadership
          </span>
        )}
      </div>

      {/* Member Information */}
      <div className={`p-6 ${member.featured ? "sm:p-7" : ""}`}>
        <div className="mb-3 h-1 w-10 rounded-full bg-[#2563eb] transition-all duration-300 group-hover:w-16" />

        <h3 className="font-[var(--font-jakarta)] text-lg font-extrabold leading-snug text-[#0b1c30]">
          {member.name}
        </h3>

        <p className="mt-2 text-xs font-bold uppercase tracking-[0.15em] text-[#2563eb]">
          {member.position}
        </p>

        {member.featured && (
          <p className="mt-4 text-sm leading-6 text-slate-500">
            Providing leadership, strategic direction, and general
            supervision of ACE NextGen Consultancy Inc.
          </p>
        )}
      </div>
    </article>
  );
}

export default function Governance() {
  const president = organizationalMembers[0];

  if (!president) return null;

  const officers = organizationalMembers.slice(1);

  return (
    <section
      id="governance"
      className="relative overflow-hidden bg-[#f5f8fc] py-20 lg:py-28"
    >
      {/* Background Decorations */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-[#2563eb]/5 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#6fd1d7]/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">

        {/* Section Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.2em] text-[#2563eb]">
            <span className="h-px w-8 bg-[#2563eb]" />
            Leadership &amp; Governance
            <span className="h-px w-8 bg-[#2563eb]" />
          </span>

          <h2 className="mt-5 font-[var(--font-jakarta)] text-3xl font-extrabold leading-tight text-[#0b1c30] sm:text-4xl lg:text-5xl">
            Meet the People Behind ACE NextGen
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Guided by leadership, integrity, and a commitment to
            service, our organizational leaders support the
            company's mission of building peaceful communities
            and empowering the next generation.
          </p>
        </div>

        {/* President */}
        <div className="mx-auto mt-14 max-w-sm sm:max-w-md">
          <MemberCard member={president} />
        </div>

        {/* Leadership Connector */}
        <div className="mx-auto flex h-16 max-w-md items-center justify-center">
          <div className="h-full w-px bg-gradient-to-b from-[#2563eb] to-[#6fd1d7]" />
        </div>

        {/* Board and Officers */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {officers.map((member) => (
            <MemberCard
              key={member.number}
              member={member}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 border-t border-slate-200 pt-10 text-center">
          <p className="font-[var(--font-jakarta)] text-sm font-extrabold text-[#002b5c]">
            ACE NextGen Consultancy Inc.
          </p>

          <p className="mt-2 text-xs leading-6 text-slate-500">
            Leadership, Integrity, Professionalism, and Service.
          </p>

          <a
            href="#contact"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#002b5c] px-6 py-3 text-sm font-bold text-white transition duration-300 hover:-translate-y-1 hover:bg-[#2563eb]"
          >
            Contact ACE NextGen
            <span aria-hidden="true">→</span>
          </a>
        </div>

      </div>
    </section>
  );
}
