import { Button } from "@repo/ui/index";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Home,
  Play,
  QrCode,
  User,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-surface">
      {/* Background Glow */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-[550px] w-[550px] rounded-full bg-primary/20 blur-[150px]" />

      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-secondary/20 blur-[150px]" />

      {/* Background Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#002b5c 1px, transparent 1px), linear-gradient(90deg, #002b5c 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="container relative z-10 mx-auto px-6 pb-24 pt-28 lg:px-12 lg:pb-32 lg:pt-36">
        <div className="mx-auto max-w-7xl text-center">

          {/* Badge */}
          <div
            className="
              mb-8
              inline-flex
              animate-[fadeInDown_0.7s_ease-out]
              items-center
              gap-3
              rounded-full
              border
              border-gray-200
              bg-white/80
              px-5
              py-2.5
              shadow-lg
              backdrop-blur-md
            "
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
            </span>

            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-xs font-bold uppercase tracking-[0.25em] text-transparent">
              Integrated Service & Training Platform
            </span>
          </div>

          {/* Hero Heading */}
          <h1
            className="
              animate-[fadeInUp_0.8s_ease-out]
              text-5xl
              font-extrabold
              leading-[1.05]
              tracking-tight
              text-[#002b5c]
              sm:text-6xl
              lg:text-8xl
            "
          >
            Manage Services.
            <br />

            <span className="bg-gradient-to-r from-[#002b5c] via-primary to-secondary bg-clip-text text-transparent">
              Develop People.
            </span>
          </h1>

          {/* Description */}
          <p
            className="
              mx-auto
              mt-8
              max-w-3xl
              animate-[fadeInUp_1s_ease-out]
              text-lg
              leading-8
              text-gray-600
              lg:text-xl
            "
          >
            A unified platform for managing consultancy services, training
            programs, participants, assessments, schedules, and
            certifications — across web and mobile.
          </p>

          {/* CTA */}
          <div
            className="
              mt-10
              flex
              animate-[fadeInUp_1.2s_ease-out]
              flex-col
              items-center
              justify-center
              gap-4
              sm:flex-row
            "
          >
            <Button
              variant="primary"
              className="
                group
                rounded-xl
                bg-[#002b5c]
                px-8
                py-6
                text-base
                font-bold
                text-white
                shadow-xl
                transition-all
                duration-300
                hover:-translate-y-1
                hover:bg-[#001f42]
                hover:shadow-2xl
              "
            >
              Book a Strategy Call

              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>

            <Button
              variant="outline"
              className="
                group
                rounded-xl
                px-8
                py-6
                text-base
                font-bold
                transition-all
                duration-300
                hover:-translate-y-1
              "
            >
              <Play className="mr-2 h-4 w-4 fill-current" />
              See How It Works
            </Button>
          </div>

          {/* Features */}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {[
              "Service Management",
              "Training Management",
              "Mobile Application",
              "Digital Certificates",
            ].map((item) => (
              <div
                key={item}
                className="
                  rounded-full
                  border
                  border-gray-200
                  bg-white/70
                  px-4
                  py-2
                  text-sm
                  font-medium
                  text-gray-600
                  shadow-sm
                  backdrop-blur
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-md
                "
              >
                {item}
              </div>
            ))}
          </div>

          {/* ================================================= */}
          {/* PRODUCT SHOWCASE */}
          {/* ================================================= */}

          <div className="relative mx-auto mt-24 max-w-6xl">

            {/* WEB DASHBOARD */}
            <div
              className="
                relative
                z-10
                overflow-hidden
                rounded-[30px]
                border
                border-gray-200
                bg-white
                text-left
                shadow-[0_35px_100px_rgba(0,43,92,0.15)]
                transition-all
                duration-500
                hover:-translate-y-2
              "
            >
              {/* Browser Header */}
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-4">
                <div className="flex gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-300" />
                  <span className="h-3 w-3 rounded-full bg-yellow-300" />
                  <span className="h-3 w-3 rounded-full bg-green-300" />
                </div>

                <div className="hidden rounded-lg bg-white px-8 py-2 text-xs text-gray-400 shadow-sm sm:block">
                  ancinextgen.com/dashboard
                </div>

                <div className="w-12" />
              </div>

              {/* Dashboard */}
              <div className="grid min-h-[440px] grid-cols-1 md:grid-cols-[190px_1fr]">

                {/* Sidebar */}
                <div className="hidden bg-[#002b5c] p-5 text-white md:block">
                  <div className="mb-8 text-xl font-extrabold">
                    ANCI
                  </div>

                  <div className="space-y-2">
                    {[
                      "Dashboard",
                      "Services",
                      "Training",
                      "Participants",
                      "Certificates",
                    ].map((item, index) => (
                      <div
                        key={item}
                        className={`
                          rounded-lg
                          px-3
                          py-2.5
                          text-xs
                          transition
                          ${
                            index === 0
                              ? "bg-white/15 font-semibold"
                              : "text-white/60 hover:bg-white/10 hover:text-white"
                          }
                        `}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-6 lg:p-8">

                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs font-semibold tracking-wider text-gray-400">
                        OVERVIEW
                      </p>

                      <h3 className="mt-1 text-2xl font-bold text-[#002b5c]">
                        Service & Training Management
                      </h3>
                    </div>

                    <div className="hidden h-fit items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-600 sm:flex">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                      System Active
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {[
                      ["12", "Active Services"],
                      ["08", "Trainings"],
                      ["248", "Participants"],
                      ["16", "Schedules"],
                    ].map(([value, label]) => (
                      <div
                        key={label}
                        className="
                          rounded-2xl
                          border
                          border-gray-100
                          bg-gray-50
                          p-4
                          transition-all
                          duration-300
                          hover:-translate-y-1
                          hover:bg-white
                          hover:shadow-lg
                        "
                      >
                        <p className="text-2xl font-extrabold text-[#002b5c]">
                          {value}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Service Workflow */}
                  <div className="mt-6 rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-gray-400">
                          SERVICE WORKFLOW
                        </p>

                        <h4 className="mt-1 font-bold text-[#002b5c]">
                          Consultancy Program
                        </h4>
                      </div>

                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>

                    <div className="mt-5 flex items-center">
                      {[
                        "Requested",
                        "Approved",
                        "Scheduled",
                        "Completed",
                      ].map((step, index) => (
                        <div
                          key={step}
                          className="flex flex-1 items-center"
                        >
                          <div className="flex flex-col items-center">
                            <div
                              className={`
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-full
                                text-xs
                                font-bold
                                ${
                                  index < 3
                                    ? "bg-[#002b5c] text-white"
                                    : "bg-gray-100 text-gray-400"
                                }
                              `}
                            >
                              {index < 3 ? "✓" : index + 1}
                            </div>

                            <span className="mt-2 hidden text-[10px] text-gray-400 sm:block">
                              {step}
                            </span>
                          </div>

                          {index < 3 && (
                            <div className="mx-2 h-[2px] flex-1 overflow-hidden bg-gray-100">
                              <div className="h-full w-full origin-left animate-[progress_2s_ease-out] bg-[#002b5c]" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ================================================= */}
            {/* ACTUAL MOBILE APP STYLE */}
            {/* ================================================= */}

            <div
              className="
                absolute
                -right-8
                bottom-[-105px]
                z-30
                hidden
                animate-[phoneFloat_5s_ease-in-out_infinite]
                lg:block
              "
            >
              {/* Phone Shadow */}
              <div
                className="
                  absolute
                  -bottom-5
                  left-1/2
                  h-10
                  w-44
                  -translate-x-1/2
                  rounded-full
                  bg-[#002b5c]/20
                  blur-xl
                "
              />

              {/* Phone Frame */}
              <div
                className="
                  relative
                  h-[610px]
                  w-[300px]
                  rounded-[42px]
                  border-[7px]
                  border-[#111827]
                  bg-[#111827]
                  p-2
                  shadow-[0_35px_80px_rgba(0,0,0,0.3)]
                "
              >
                {/* Dynamic Island / Notch */}
                <div
                  className="
                    absolute
                    left-1/2
                    top-2
                    z-30
                    h-6
                    w-28
                    -translate-x-1/2
                    rounded-full
                    bg-[#111827]
                  "
                />

                {/* Screen */}
                <div
                  className="
                    relative
                    h-full
                    overflow-hidden
                    rounded-[34px]
                    bg-[#f7fbff]
                  "
                >

                  {/* Status Bar */}
                  <div className="flex items-center justify-between px-5 pb-2 pt-5 text-[9px] font-semibold text-[#14213d]">
                    <span>9:41</span>

                    <div className="flex gap-1">
                      <span>●</span>
                      <span>●</span>
                      <span>▰</span>
                    </div>
                  </div>

                  {/* App Header */}
                  <div className="px-5 pb-4 pt-3">
                    <div className="flex items-start justify-between">

                      <div>
                        <p className="text-[11px] text-gray-500">
                          Welcome back,
                        </p>

                        <h2 className="mt-0.5 text-[22px] font-extrabold text-[#14213d]">
                          User
                        </h2>

                        <p className="mt-1 text-[9px] text-gray-400">
                          Continue your training journey.
                        </p>
                      </div>

                      {/* Profile */}
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gray-200 shadow-sm">
                        <User className="h-6 w-6 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Your Training */}
                  <div className="px-5">
                    <h3 className="text-[15px] font-extrabold text-[#14213d]">
                      Your Training
                    </h3>

                    <p className="text-[9px] text-gray-400">
                      Current assigned program
                    </p>

                    {/* Training Card */}
                    <div
                      className="
                        mt-3
                        rounded-[24px]
                        border
                        border-gray-200
                        bg-white
                        p-4
                        shadow-sm
                      "
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-blue-600">
                            Current Training
                          </p>

                          <h4 className="mt-2 text-[17px] font-extrabold leading-tight text-[#14213d]">
                            Introduction to Mediation
                          </h4>

                          <p className="mt-1 text-[8px] font-semibold text-gray-400">
                            Batch: ACNG-MED-001-B01
                          </p>
                        </div>

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50">
                          <GraduationCap className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>

                      <p className="mt-4 text-[9px] leading-4 text-gray-500">
                        Your enrollment has been approved. You are now
                        officially enrolled in this training batch.
                      </p>

                      {/* Batch */}
                      <div className="mt-4 rounded-2xl bg-[#f7fbff] p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                            <GraduationCap className="h-4 w-4 text-blue-600" />
                          </div>

                          <div>
                            <p className="text-[7px] font-bold uppercase tracking-wider text-gray-400">
                              Training Batch
                            </p>

                            <p className="text-[9px] font-bold text-[#14213d]">
                              ACNG-MED-001-B01
                            </p>

                            <p className="text-[7px] text-gray-400">
                              Introduction to Mediation
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Trainer */}
                      <div className="mt-2 rounded-2xl bg-[#f7fbff] p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>

                          <div>
                            <p className="text-[7px] font-bold uppercase tracking-wider text-gray-400">
                              Trainer
                            </p>

                            <p className="text-[9px] font-bold text-[#14213d]">
                              Trainer
                            </p>

                            <p className="text-[7px] text-gray-400">
                              TRN-000001
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gray-50">
                            <CalendarDays className="h-3.5 w-3.5 text-gray-500" />
                          </div>

                          <div>
                            <p className="text-[6px] font-bold uppercase text-gray-400">
                              Enrolled Date
                            </p>

                            <p className="text-[7px] font-bold text-gray-600">
                              Sep 5, 2026
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gray-50">
                            <CheckCircle2 className="h-3.5 w-3.5 text-gray-500" />
                          </div>

                          <div>
                            <p className="text-[6px] font-bold uppercase text-gray-400">
                              Approved Date
                            </p>

                            <p className="text-[7px] font-bold text-gray-600">
                              Sep 5, 2026
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mt-4">
                        <div className="flex justify-between">
                          <p className="text-[8px] font-semibold text-gray-500">
                            Training Progress
                          </p>

                          <p className="text-[8px] font-bold text-blue-600">
                            68%
                          </p>
                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
                          <div className="h-full w-[68%] animate-[mobileProgress_2s_ease-out] rounded-full bg-blue-600" />
                        </div>
                      </div>

                      {/* Status */}
                      <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3">
                        <span className="h-2 w-2 rounded-full bg-green-600" />

                        <span className="text-[8px] font-bold text-green-600">
                          APPROVED
                        </span>
                      </div>
                    </div>

                    {/* Training Overview */}
                    <div className="mt-5">
                      <h3 className="text-[15px] font-extrabold text-[#14213d]">
                        Training Overview
                      </h3>

                      <p className="text-[9px] text-gray-400">
                        Your current progress
                      </p>

                      <div className="mt-3 grid grid-cols-2 gap-3">
                        {/* Progress */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50">
                            <GraduationCap className="h-4 w-4 text-blue-600" />
                          </div>

                          <p className="mt-3 text-[8px] text-gray-400">
                            Progress
                          </p>

                          <p className="text-xl font-extrabold text-[#14213d]">
                            68%
                          </p>
                        </div>

                        {/* Attendance */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50">
                            <CalendarDays className="h-4 w-4 text-blue-600" />
                          </div>

                          <p className="mt-3 text-[8px] text-gray-400">
                            Attendance
                          </p>

                          <p className="text-xl font-extrabold text-[#14213d]">
                            92%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ========================================= */}
                  {/* MOBILE BOTTOM NAVIGATION */}
                  {/* ========================================= */}

                  <div
                    className="
                      absolute
                      bottom-0
                      left-0
                      right-0
                      z-20
                      h-[74px]
                      rounded-t-[26px]
                      border-t
                      border-gray-200
                      bg-white/95
                      px-2
                      shadow-[0_-8px_25px_rgba(0,43,92,0.08)]
                      backdrop-blur
                    "
                  >
                    <div className="grid h-full grid-cols-5 items-end pb-3">

                      {/* Home */}
                      <div className="flex flex-col items-center gap-1 text-blue-600">
                        <Home className="h-5 w-5" />
                        <span className="text-[7px] font-bold">
                          Home
                        </span>
                      </div>

                      {/* Training */}
                      <div className="flex flex-col items-center gap-1 text-gray-400">
                        <GraduationCap className="h-5 w-5" />
                        <span className="text-[7px] font-semibold">
                          Training
                        </span>
                      </div>

                      {/* Attend */}
                      <div className="relative flex flex-col items-center gap-1 text-gray-500">

                        {/* QR Circle */}
                        <div
                          className="
                            absolute
                            -top-[42px]
                            flex
                            h-[62px]
                            w-[62px]
                            items-center
                            justify-center
                            rounded-full
                            border-[5px]
                            border-white
                            bg-blue-600
                            shadow-[0_8px_25px_rgba(37,99,235,0.35)]
                            animate-[qrPulse_3s_ease-in-out_infinite]
                          "
                        >
                          <QrCode className="h-7 w-7 text-white" />
                        </div>

                        <div className="h-7" />

                        <span className="text-[7px] font-bold">
                          ATTEND
                        </span>
                      </div>

                      {/* Learn */}
                      <div className="flex flex-col items-center gap-1 text-gray-400">
                        <BookOpen className="h-5 w-5" />
                        <span className="text-[7px] font-semibold">
                          Learn
                        </span>
                      </div>

                      {/* Profile */}
                      <div className="flex flex-col items-center gap-1 text-gray-400">
                        <User className="h-5 w-5" />
                        <span className="text-[7px] font-semibold">
                          Profile
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Floating Service Notification */}
            <div
              className="
                absolute
                -left-12
                bottom-20
                z-30
                hidden
                animate-[float_4s_ease-in-out_infinite]
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-4
                shadow-2xl
                lg:block
              "
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-green-100 p-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>

                <div className="text-left">
                  <p className="text-[10px] font-semibold text-gray-400">
                    SERVICE REQUEST
                  </p>

                  <p className="text-sm font-bold text-[#002b5c]">
                    Approved
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Mobile Sync */}
            <div
              className="
                absolute
                -right-20
                top-20
                z-30
                hidden
                animate-[float_5s_ease-in-out_infinite]
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-4
                shadow-2xl
                lg:block
              "
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-2">
                  <QrCode className="h-5 w-5 text-blue-600" />
                </div>

                <div className="text-left">
                  <p className="text-[10px] font-semibold text-gray-400">
                    ATTENDANCE
                  </p>

                  <p className="text-sm font-bold text-[#002b5c]">
                    QR Check-in
                  </p>
                </div>
              </div>
            </div>

            {/* Glow */}
            <div className="pointer-events-none absolute -bottom-32 left-1/2 h-52 w-3/4 -translate-x-1/2 rounded-full bg-primary/20 blur-[100px]" />
          </div>

          {/* Product Caption */}
          <div className="mt-32 flex animate-[fadeInUp_1.5s_ease-out] flex-col items-center gap-2">
            <p className="text-sm font-bold text-[#002b5c]">
              One ecosystem. Web + Mobile.
            </p>

            <p className="text-sm text-gray-500">
              From service requests to training completion and certification.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}