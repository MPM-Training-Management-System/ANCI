import Image, { StaticImageData } from "next/image";

import Governance from "@/assets/image/governance.jpg";
import Mediation from "@/assets/image/train.jpg";
import Sport from "@/assets/image/sport.jpg";

import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileCheck2,
  GraduationCap,
  Handshake,
  Layers3,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@repo/ui/index";

type Service = {
  title: string;
  description: string;
  image: StaticImageData;
  category: "Training-Based" | "Non-Training";
  features: string[];
};

const services: Service[] = [
  {
    title: "Mediation & Peace",
    description:
      "Structured mediation and alternative dispute resolution services designed to help organizations manage conflict and build sustainable peace.",
    image: Mediation,
    category: "Training-Based",
    features: [
      "ADR Implementation",
      "Conflict Analysis",
      "Peace Building",
    ],
  },
  {
    title: "Governance",
    description:
      "Institutional and governance support focused on policy development, organizational integrity, ethical leadership, and capacity building.",
    image: Governance,
    category: "Training-Based",
    features: [
      "Policy Design",
      "Compliance Support",
      "Leadership Development",
    ],
  },
  {
    title: "Sports Development",
    description:
      "Structured sports development programs that support athlete development, talent pathways, organizational growth, and excellence.",
    image: Sport,
    category: "Training-Based",
    features: [
      "Youth Development",
      "Talent Pathways",
      "Athlete Development",
    ],
  },
];

const workflowSteps = [
  {
    number: "01",
    title: "Request",
    description: "Submit a service request",
    icon: Send,
  },
  {
    number: "02",
    title: "Review",
    description: "Request is evaluated",
    icon: FileCheck2,
  },
  {
    number: "03",
    title: "Approval",
    description: "Service is approved",
    icon: CheckCircle2,
  },
  {
    number: "04",
    title: "Schedule",
    description: "Service is scheduled",
    icon: CalendarCheck,
  },
  {
    number: "05",
    title: "Delivery",
    description: "Service is completed",
    icon: Handshake,
  },
];

export default function Services() {
  return (
    <section
      id="services"
      className="relative overflow-hidden bg-surface py-24 lg:py-32"
    >
      {/* ========================================================= */}
      {/* BACKGROUND DECORATION */}
      {/* ========================================================= */}

      <div className="pointer-events-none absolute -left-52 top-20 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[130px]" />

      <div className="pointer-events-none absolute -right-52 top-[40%] h-[450px] w-[450px] rounded-full bg-secondary/10 blur-[140px]" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#002b5c 1px, transparent 1px), linear-gradient(90deg, #002b5c 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="container relative z-10 mx-auto px-6 lg:px-12">

        {/* ========================================================= */}
        {/* SECTION HEADER */}
        {/* ========================================================= */}

        <div className="mx-auto max-w-3xl text-center">

          <div
            className="
              mb-5
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-primary/20
              bg-primary/5
              px-4
              py-2
              text-primary
              transition-all
              duration-300
              hover:-translate-y-1
              hover:bg-primary/10
            "
          >
            <Sparkles className="h-4 w-4" />

            <span className="text-xs font-bold uppercase tracking-[0.2em]">
              Service Management
            </span>
          </div>

          <h2
            className="
              text-4xl
              font-extrabold
              leading-tight
              tracking-tight
              text-[#002b5c]
              sm:text-5xl
              lg:text-6xl
            "
          >
            Services Designed
            <br />

            <span className="bg-gradient-to-r from-[#002b5c] via-primary to-secondary bg-clip-text text-transparent">
              Around Your Needs
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Request, manage, and track professional services through a
            structured digital workflow — from initial request and approval
            to scheduling, delivery, and completion.
          </p>
        </div>

        {/* ========================================================= */}
        {/* SERVICE MANAGEMENT PREVIEW */}
        {/* ========================================================= */}

        <div className="mx-auto mt-16 max-w-6xl">

          <div
            className="
              group
              relative
              overflow-hidden
              rounded-[32px]
              border
              border-gray-200
              bg-white
              p-6
              shadow-[0_25px_70px_rgba(0,43,92,0.08)]
              transition-all
              duration-500
              hover:shadow-[0_30px_90px_rgba(0,43,92,0.13)]
              sm:p-8
              lg:p-10
            "
          >

            {/* Decorative Glow */}
            <div
              className="
                pointer-events-none
                absolute
                -right-24
                -top-24
                h-64
                w-64
                rounded-full
                bg-primary/10
                blur-[90px]
                transition-transform
                duration-700
                group-hover:scale-125
              "
            />

            {/* Header */}
            <div
              className="
                relative
                flex
                flex-col
                justify-between
                gap-5
                sm:flex-row
                sm:items-center
              "
            >
              <div>
                <div className="flex items-center gap-2">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                    <Layers3 className="h-4 w-4 text-primary" />
                  </div>

                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                    How Service Management Works
                  </span>
                </div>

                <h3 className="mt-3 text-2xl font-extrabold text-[#002b5c] sm:text-3xl">
                  From Service Request to Delivery
                </h3>

                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                  Every service request follows its own workflow, allowing
                  multiple services to remain active at the same time.
                </p>
              </div>

              {/* Active Status */}
              <div
                className="
                  flex
                  w-fit
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-green-100
                  bg-green-50
                  px-4
                  py-2
                  text-xs
                  font-bold
                  text-green-600
                "
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
                  <span className="relative h-2 w-2 rounded-full bg-green-500" />
                </span>

                Active Workflow
              </div>
            </div>

            {/* Workflow */}
            <div className="relative mt-10">

              {/* Desktop connector */}
              <div className="absolute left-[8%] right-[8%] top-8 hidden h-px bg-gray-200 lg:block" />

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

                {workflowSteps.map((step, index) => {
                  const Icon = step.icon;

                  return (
                    <div
                      key={step.number}
                      className="
                        group/step
                        relative
                        rounded-2xl
                        border
                        border-gray-100
                        bg-gray-50
                        p-5
                        transition-all
                        duration-500
                        hover:-translate-y-2
                        hover:border-primary/20
                        hover:bg-white
                        hover:shadow-xl
                      "
                    >
                      {/* Number */}
                      <div className="flex items-center justify-between">

                        <div
                          className="
                            flex
                            h-11
                            w-11
                            items-center
                            justify-center
                            rounded-xl
                            bg-primary/10
                            transition-all
                            duration-300
                            group-hover/step:scale-110
                            group-hover/step:bg-[#002b5c]
                          "
                        >
                          <Icon className="h-5 w-5 text-primary transition-colors group-hover/step:text-white" />
                        </div>

                        <span className="text-[10px] font-extrabold text-gray-300">
                          {step.number}
                        </span>
                      </div>

                      <h4 className="mt-5 text-sm font-extrabold text-[#002b5c]">
                        {step.title}
                      </h4>

                      <p className="mt-1 text-xs leading-5 text-gray-400">
                        {step.description}
                      </p>

                      {/* Arrow */}
                      {index < workflowSteps.length - 1 && (
                        <ChevronRight
                          className="
                            absolute
                            -right-3
                            top-1/2
                            z-10
                            hidden
                            h-5
                            w-5
                            -translate-y-1/2
                            rounded-full
                            bg-white
                            text-gray-300
                            lg:block
                          "
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Workflow Footer */}
            <div className="relative mt-8 flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                </div>

                <p className="text-xs text-gray-500">
                  Each service request can have its own status and workflow.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-primary">
                Track your service
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SERVICE OFFERINGS */}
        {/* ========================================================= */}

        <div className="mt-20">

          {/* Heading */}
          <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Service Offerings
              </p>

              <h3 className="mt-2 text-3xl font-extrabold text-[#002b5c] sm:text-4xl">
                Choose a Service
              </h3>
            </div>

            <p className="max-w-md text-sm leading-6 text-gray-500 sm:text-right">
              Clients can request different services based on their
              institutional needs. Each request is managed independently.
            </p>
          </div>

          {/* Cards */}
          <div className="grid gap-7 lg:grid-cols-3">

            {services.map((service, index) => (
              <Card
                key={service.title}
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-[28px]
                  border
                  border-gray-200
                  bg-white
                  p-0
                  shadow-sm
                  transition-all
                  duration-500
                  hover:-translate-y-3
                  hover:border-primary/20
                  hover:shadow-[0_30px_70px_rgba(0,43,92,0.14)]
                "
              >

                {/* Image */}
                <div className="relative h-60 overflow-hidden">

                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="
                      (max-width: 768px) 100vw,
                      (max-width: 1024px) 50vw,
                      33vw
                    "
                    className="
                      object-cover
                      transition-transform
                      duration-700
                      group-hover:scale-110
                    "
                  />

                  {/* Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#002b5c]/90 via-[#002b5c]/10 to-transparent" />

                  {/* Number */}
                  <div
                    className="
                      absolute
                      left-5
                      top-5
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white/30
                      bg-white/20
                      text-xs
                      font-bold
                      text-white
                      backdrop-blur-md
                    "
                  >
                    0{index + 1}
                  </div>

                  {/* Category */}
                  <div className="absolute bottom-5 left-5">

                    <div
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-full
                        bg-white/15
                        px-3
                        py-1.5
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-wider
                        text-white
                        backdrop-blur-md
                      "
                    >
                      <GraduationCap className="h-3 w-3" />

                      {service.category}
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <CardContent className="p-7">

                  <CardTitle className="text-2xl font-extrabold text-[#002b5c]">
                    {service.title}
                  </CardTitle>

                  <CardDescription className="mt-4 min-h-[88px] text-sm leading-7 text-gray-500">
                    {service.description}
                  </CardDescription>

                  {/* Features */}
                  <div className="mt-6 space-y-3 border-t border-gray-100 pt-6">

                    {service.features.map((feature) => (
                      <div
                        key={feature}
                        className="
                          flex
                          items-center
                          gap-3
                          text-sm
                          text-gray-600
                          transition-transform
                          duration-300
                          group-hover:translate-x-1
                        "
                      >
                        <span
                          className="
                            flex
                            h-6
                            w-6
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-primary/10
                          "
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                        </span>

                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* Bottom CTA */}
                  <div
                    className="
                      mt-7
                      flex
                      items-center
                      justify-between
                      border-t
                      border-gray-100
                      pt-6
                    "
                  >
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
                      Explore Service
                    </span>

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        bg-[#002b5c]
                        text-white
                        transition-all
                        duration-300
                        group-hover:translate-x-1
                        group-hover:bg-primary
                      "
                    >
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* MULTIPLE SERVICES */}
        {/* ========================================================= */}

        <div className="mx-auto mt-16 max-w-5xl">

          <div
            className="
              rounded-[28px]
              border
              border-gray-200
              bg-white
              p-6
              shadow-sm
              sm:p-8
            "
          >

            <div className="grid gap-8 md:grid-cols-3 md:items-center">

              {/* Text */}
              <div className="md:col-span-1">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Layers3 className="h-5 w-5 text-primary" />
                </div>

                <h3 className="mt-4 text-2xl font-extrabold text-[#002b5c]">
                  Multiple Services.
                  <br />
                  One Platform.
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  Different service requests can remain active
                  simultaneously without interfering with one another.
                </p>
              </div>

              {/* Service Status Cards */}
              <div className="space-y-3 md:col-span-2">

                {/* Service 1 */}
                <div
                  className="
                    group
                    flex
                    items-center
                    justify-between
                    rounded-2xl
                    border
                    border-gray-100
                    bg-gray-50
                    p-4
                    transition-all
                    duration-300
                    hover:-translate-x-1
                    hover:bg-white
                    hover:shadow-md
                  "
                >
                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                      <Handshake className="h-5 w-5 text-blue-600" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-[#002b5c]">
                        Governance Consultancy
                      </p>

                      <p className="text-[10px] text-gray-400">
                        Service Request #SR-00124
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

                    <span className="text-[9px] font-bold text-green-600">
                      IN PROGRESS
                    </span>
                  </div>
                </div>

                {/* Service 2 */}
                <div
                  className="
                    group
                    flex
                    items-center
                    justify-between
                    rounded-2xl
                    border
                    border-gray-100
                    bg-gray-50
                    p-4
                    transition-all
                    duration-300
                    hover:-translate-x-1
                    hover:bg-white
                    hover:shadow-md
                  "
                >
                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
                      <GraduationCap className="h-5 w-5 text-purple-600" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-[#002b5c]">
                        Mediation Training
                      </p>

                      <p className="text-[10px] text-gray-400">
                        Service Request #SR-00127
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />

                    <span className="text-[9px] font-bold text-blue-600">
                      APPROVED
                    </span>
                  </div>
                </div>

                {/* Service 3 */}
                <div
                  className="
                    group
                    flex
                    items-center
                    justify-between
                    rounded-2xl
                    border
                    border-gray-100
                    bg-gray-50
                    p-4
                    transition-all
                    duration-300
                    hover:-translate-x-1
                    hover:bg-white
                    hover:shadow-md
                  "
                >
                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
                      <Clock3 className="h-5 w-5 text-orange-600" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-[#002b5c]">
                        Sports Development
                      </p>

                      <p className="text-[10px] text-gray-400">
                        Service Request #SR-00131
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />

                    <span className="text-[9px] font-bold text-yellow-600">
                      PENDING
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SERVICE → TRAINING */}
        {/* ========================================================= */}

        <div className="mx-auto mt-20 max-w-5xl">

          <div
            className="
              relative
              overflow-hidden
              rounded-[32px]
              bg-[#002b5c]
              px-7
              py-10
              text-white
              shadow-[0_25px_70px_rgba(0,43,92,0.2)]
              sm:px-10
              lg:px-14
              lg:py-12
            "
          >

            {/* Background Glow */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/30 blur-[110px]" />

            <div className="relative">

              {/* Header */}
              <div className="text-center">

                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2">
                  <Sparkles className="h-4 w-4 text-white" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                    Integrated Workflow
                  </span>
                </div>

                <h3 className="mt-5 text-3xl font-extrabold sm:text-4xl">
                  When a Service Becomes a Training
                </h3>

                <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/60">
                  Training-based services seamlessly connect service
                  management with the training lifecycle.
                </p>
              </div>

              {/* Connection */}
              <div className="mt-10 grid gap-5 md:grid-cols-3 md:items-center">

                {/* Service */}
                <div
                  className="
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/5
                    p-6
                    text-center
                    transition-all
                    duration-300
                    hover:-translate-y-2
                    hover:bg-white/10
                  "
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <Handshake className="h-6 w-6" />
                  </div>

                  <p className="mt-4 text-xs font-bold uppercase tracking-wider text-white/40">
                    Service
                  </p>

                  <h4 className="mt-1 text-xl font-extrabold">
                    Service Request
                  </h4>

                  <p className="mt-2 text-xs text-white/50">
                    Client requests a training-based service.
                  </p>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <div
                    className="
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white/10
                      bg-white/10
                    "
                  >
                    <ArrowRight className="h-6 w-6 animate-pulse" />
                  </div>
                </div>

                {/* Training */}
                <div
                  className="
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/5
                    p-6
                    text-center
                    transition-all
                    duration-300
                    hover:-translate-y-2
                    hover:bg-white/10
                  "
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <GraduationCap className="h-6 w-6" />
                  </div>

                  <p className="mt-4 text-xs font-bold uppercase tracking-wider text-white/40">
                    Training
                  </p>

                  <h4 className="mt-1 text-xl font-extrabold">
                    Training Program
                  </h4>

                  <p className="mt-2 text-xs text-white/50">
                    Approved requests proceed into training management.
                  </p>
                </div>
              </div>

              {/* Training Lifecycle */}
              <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">

                <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                  Training Lifecycle
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">

                  {[
                    "Enrollment",
                    "Schedule",
                    "Attendance",
                    "Learning",
                    "Assessment",
                    "Certificate",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="flex items-center"
                    >
                      <div
                        className="
                          rounded-full
                          border
                          border-white/10
                          bg-white/10
                          px-3
                          py-2
                          text-[9px]
                          font-semibold
                          text-white/70
                          transition-all
                          duration-300
                          hover:bg-white/20
                          hover:text-white
                        "
                      >
                        {item}
                      </div>

                      {index < 5 && (
                        <ChevronRight className="mx-1 h-3 w-3 text-white/20" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-7 flex items-center justify-center gap-2 text-xs text-white/50">
                <Users className="h-4 w-4" />

                One integrated ecosystem for services and people development.
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* FINAL CTA */}
        {/* ========================================================= */}

        <div className="mt-16 text-center">

          <p className="text-sm text-gray-500">
            Ready to work with ACE NextGen?
          </p>

          <button
            type="button"
            className="
              group
              mt-4
              inline-flex
              items-center
              gap-3
              rounded-xl
              bg-[#002b5c]
              px-7
              py-4
              text-sm
              font-bold
              text-white
              shadow-lg
              transition-all
              duration-300
              hover:-translate-y-1
              hover:bg-[#001f42]
              hover:shadow-xl
            "
          >
            Request a Service

            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}