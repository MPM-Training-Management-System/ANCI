import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Headphones,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Button, Input } from "@repo/ui/index";

export default function Contact() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-[#f4f8fc] py-24 lg:py-32"
    >
      {/* ========================================================= */}
      {/* BACKGROUND */}
      {/* ========================================================= */}

      <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-primary/10 blur-[120px]" />

      <div className="pointer-events-none absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-secondary/10 blur-[130px]" />

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
        {/* HEADER */}
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
              bg-white
              px-4
              py-2
              shadow-sm
              transition-all
              duration-300
              hover:-translate-y-1
              hover:shadow-md
            "
          >
            <Sparkles className="h-4 w-4 text-primary" />

            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Get Started
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
            Start Your
            <br />

            <span className="bg-gradient-to-r from-[#002b5c] via-primary to-secondary bg-clip-text text-transparent">
              Service Request
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Tell us what your organization needs. Our team will review
            your request and guide you through the appropriate service
            workflow.
          </p>
        </div>

        {/* ========================================================= */}
        {/* CONTACT PANEL */}
        {/* ========================================================= */}

        <div className="mx-auto mt-16 max-w-6xl">

          <div
            className="
              overflow-hidden
              rounded-[32px]
              border
              border-gray-200
              bg-white
              shadow-[0_30px_80px_rgba(0,43,92,0.12)]
              lg:flex
            "
          >

            {/* ===================================================== */}
            {/* LEFT SIDE */}
            {/* ===================================================== */}

            <div
              className="
                relative
                overflow-hidden
                bg-[#002b5c]
                p-8
                text-white
                sm:p-10
                lg:w-[42%]
                lg:p-12
              "
            >

              {/* Glow */}
              <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/30 blur-[100px]" />

              <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-secondary/10 blur-[100px]" />

              <div className="relative z-10">

                {/* Label */}
                <div className="flex items-center gap-2">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                    <Headphones className="h-4 w-4" />
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                    Let's Work Together
                  </span>
                </div>

                {/* Heading */}
                <h3 className="mt-7 text-3xl font-extrabold leading-tight sm:text-4xl">
                  Let's Build
                  <br />
                  Something
                  <br />

                  <span className="text-white/50">
                    That Lasts.
                  </span>
                </h3>

                <p className="mt-5 max-w-md text-sm leading-7 text-white/60">
                  Whether you need governance support, mediation,
                  sports development, or a training program, start
                  your request and let our team help identify the
                  right solution.
                </p>

                {/* ================================================= */}
                {/* SERVICE PROCESS */}
                {/* ================================================= */}

                <div className="mt-10">

                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                    What happens next
                  </p>

                  <div className="mt-5 space-y-5">

                    {/* Step 1 */}
                    <div className="flex items-start gap-4">

                      <div className="relative">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                          <Send className="h-4 w-4" />
                        </div>

                        <div className="absolute left-1/2 top-10 h-6 w-px -translate-x-1/2 bg-white/10" />
                      </div>

                      <div>
                        <p className="text-sm font-bold">
                          Submit Request
                        </p>

                        <p className="mt-1 text-xs leading-5 text-white/40">
                          Tell us about your service needs.
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-start gap-4">

                      <div className="relative">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                          <FileCheck2 className="h-4 w-4" />
                        </div>

                        <div className="absolute left-1/2 top-10 h-6 w-px -translate-x-1/2 bg-white/10" />
                      </div>

                      <div>
                        <p className="text-sm font-bold">
                          Request Review
                        </p>

                        <p className="mt-1 text-xs leading-5 text-white/40">
                          Our team evaluates your request.
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-start gap-4">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-sm font-bold">
                          Approval & Delivery
                        </p>

                        <p className="mt-1 text-xs leading-5 text-white/40">
                          Approved services proceed to delivery.
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* ================================================= */}
                {/* CONTACT DETAILS */}
                {/* ================================================= */}

                <div className="mt-10 border-t border-white/10 pt-8">

                  <div className="space-y-5">

                    {/* Email */}
                    <div className="flex items-center gap-4">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                        <Mail className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">
                          Email
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          contact@acenextgen.org
                        </p>
                      </div>
                    </div>

                    {/* Office */}
                    <div className="flex items-center gap-4">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                        <MapPin className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">
                          Office
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          Global Headquarters
                        </p>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-4">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                        <Phone className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">
                          Phone
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          +63 900 000 0000
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* ===================================================== */}
            {/* RIGHT SIDE - FORM */}
            {/* ===================================================== */}

            <div className="p-8 sm:p-10 lg:w-[58%] lg:p-12">

              {/* Form Header */}
              <div className="mb-8">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                      Service Inquiry
                    </p>

                    <h3 className="mt-2 text-2xl font-extrabold text-[#002b5c]">
                      Tell Us What You Need
                    </h3>
                  </div>

                  <div className="hidden h-11 w-11 items-center justify-center rounded-xl bg-primary/10 sm:flex">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>

                </div>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Complete the form below and our team can review
                  your service request.
                </p>
              </div>

              {/* ================================================= */}
              {/* FORM */}
              {/* ================================================= */}

              <form className="space-y-6">

                {/* Name + Email */}
                <div className="grid gap-5 sm:grid-cols-2">

                  <div>
                    <label
                      htmlFor="full-name"
                      className="
                        mb-2
                        block
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.15em]
                        text-[#002b5c]
                      "
                    >
                      Full Name
                    </label>

                    <Input
                      id="full-name"
                      name="fullName"
                      type="text"
                      placeholder="John Doe"
                      className="
                        rounded-xl
                        border-gray-200
                        px-4
                        py-3
                        transition-all
                        duration-300
                        focus:border-primary
                        focus:ring-2
                        focus:ring-primary/10
                      "
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="
                        mb-2
                        block
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.15em]
                        text-[#002b5c]
                      "
                    >
                      Email Address
                    </label>

                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      className="
                        rounded-xl
                        border-gray-200
                        px-4
                        py-3
                        transition-all
                        duration-300
                        focus:border-primary
                        focus:ring-2
                        focus:ring-primary/10
                      "
                    />
                  </div>

                </div>

                {/* Organization */}
                <div>

                  <label
                    htmlFor="organization"
                    className="
                      mb-2
                      block
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.15em]
                      text-[#002b5c]
                    "
                  >
                    Organization
                  </label>

                  <Input
                    id="organization"
                    name="organization"
                    type="text"
                    placeholder="Organization or Institution"
                    className="
                      rounded-xl
                      border-gray-200
                      px-4
                      py-3
                      transition-all
                      duration-300
                      focus:border-primary
                      focus:ring-2
                      focus:ring-primary/10
                    "
                  />
                </div>

                {/* Service Type */}
                <div>

                  <label
                    htmlFor="service"
                    className="
                      mb-2
                      block
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.15em]
                      text-[#002b5c]
                    "
                  >
                    Service Needed
                  </label>

                  <select
                    id="service"
                    name="service"
                    defaultValue=""
                    className="
                      w-full
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      px-4
                      py-3
                      text-sm
                      text-gray-600
                      outline-none
                      transition-all
                      duration-300
                      focus:border-primary
                      focus:ring-2
                      focus:ring-primary/10
                    "
                  >
                    <option value="" disabled>
                      Select a service
                    </option>

                    <option value="mediation">
                      Mediation & Peace
                    </option>

                    <option value="governance">
                      Governance & Institutional Support
                    </option>

                    <option value="sports">
                      Sports Development
                    </option>

                    <option value="training">
                      Training Program
                    </option>

                    <option value="other">
                      Other Service
                    </option>
                  </select>
                </div>

                {/* Service Type */}
                <div>

                  <label
                    htmlFor="service-type"
                    className="
                      mb-2
                      block
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.15em]
                      text-[#002b5c]
                    "
                  >
                    Service Type
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">

                    {/* Training */}
                    <label
                      className="
                        group
                        cursor-pointer
                        rounded-xl
                        border
                        border-gray-200
                        bg-gray-50
                        p-4
                        transition-all
                        duration-300
                        hover:border-primary/30
                        hover:bg-primary/5
                      "
                    >
                      <input
                        type="radio"
                        name="serviceType"
                        value="training"
                        className="sr-only"
                      />

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                          <GraduationIcon />
                        </div>

                        <div>
                          <p className="text-xs font-bold text-[#002b5c]">
                            Training-Based
                          </p>

                          <p className="mt-1 text-[10px] text-gray-400">
                            Leads to a training program
                          </p>
                        </div>
                      </div>
                    </label>

                    {/* Non-training */}
                    <label
                      className="
                        group
                        cursor-pointer
                        rounded-xl
                        border
                        border-gray-200
                        bg-gray-50
                        p-4
                        transition-all
                        duration-300
                        hover:border-primary/30
                        hover:bg-primary/5
                      "
                    >
                      <input
                        type="radio"
                        name="serviceType"
                        value="non-training"
                        className="sr-only"
                      />

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                          <ShieldCheck className="h-4 w-4 text-primary" />
                        </div>

                        <div>
                          <p className="text-xs font-bold text-[#002b5c]">
                            Non-Training
                          </p>

                          <p className="mt-1 text-[10px] text-gray-400">
                            Consultancy or direct service
                          </p>
                        </div>
                      </div>
                    </label>

                  </div>
                </div>

                {/* Message */}
                <div>

                  <label
                    htmlFor="message"
                    className="
                      mb-2
                      block
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.15em]
                      text-[#002b5c]
                    "
                  >
                    Tell Us About Your Needs
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    placeholder="Describe your organization's needs, objectives, or the service you are interested in..."
                    className="
                      w-full
                      resize-none
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      px-4
                      py-4
                      text-sm
                      text-gray-700
                      outline-none
                      transition-all
                      duration-300
                      placeholder:text-gray-400
                      focus:border-primary
                      focus:ring-2
                      focus:ring-primary/10
                    "
                  />
                </div>

                {/* Submit */}
                <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-center gap-2 text-[10px] text-gray-400">

                    <Clock3 className="h-3.5 w-3.5" />

                    <span>
                      Your request will be reviewed by our team.
                    </span>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="
                      group
                      rounded-xl
                      bg-[#002b5c]
                      px-7
                      py-4
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
                    Submit Service Request

                    <ArrowRight
                      className="
                        ml-2
                        h-4
                        w-4
                        transition-transform
                        duration-300
                        group-hover:translate-x-1
                      "
                    />
                  </Button>

                </div>

              </form>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM TRUST BAR */}
        {/* ========================================================= */}

        <div className="mx-auto mt-10 max-w-5xl">

          <div className="grid gap-4 sm:grid-cols-3">

            <div
              className="
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-4
                shadow-sm
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-md
              "
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                <ShieldCheck className="h-5 w-5 text-green-600" />
              </div>

              <div>
                <p className="text-xs font-extrabold text-[#002b5c]">
                  Structured Process
                </p>

                <p className="mt-1 text-[10px] text-gray-400">
                  Every request is tracked
                </p>
              </div>
            </div>

            <div
              className="
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-4
                shadow-sm
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-md
              "
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <FileCheck2 className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <p className="text-xs font-extrabold text-[#002b5c]">
                  Transparent Workflow
                </p>

                <p className="mt-1 text-[10px] text-gray-400">
                  Track service status
                </p>
              </div>
            </div>

            <div
              className="
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-4
                shadow-sm
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-md
              "
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
                <Headphones className="h-5 w-5 text-purple-600" />
              </div>

              <div>
                <p className="text-xs font-extrabold text-[#002b5c]">
                  Expert Support
                </p>

                <p className="mt-1 text-[10px] text-gray-400">
                  Guidance throughout the process
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

/* ========================================================= */
/* SMALL ICON COMPONENT */
/* ========================================================= */

function GraduationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4 text-primary"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.5 9.5 12 4l9.5 5.5L12 15 2.5 9.5Z"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 12v4.5c0 1.5 2.7 3 6 3s6-1.5 6-3V12"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.5 10v5"
      />
    </svg>
  );
}