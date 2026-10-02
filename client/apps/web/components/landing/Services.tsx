"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  GraduationCap,
  Handshake,
  Layers3,
  Loader2,
  Mail,
  MessageSquare,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from "lucide-react";

import type {
  CreateServiceRequest,
  Service,
} from "@repo/types";

import { serviceApi } from "@/lib/api";

/* ============================================================
   WORKFLOW
============================================================ */

const workflowSteps = [
  {
    number: "01",
    title: "Request",
    description: "Submit the service you need.",
    icon: Send,
  },
  {
    number: "02",
    title: "Review",
    description: "Our team reviews your request.",
    icon: FileCheck2,
  },
  {
    number: "03",
    title: "Resolution",
    description:
      "The appropriate service path is determined.",
    icon: CheckCircle2,
  },
  {
    number: "04",
    title: "Schedule",
    description:
      "Your service is scheduled when needed.",
    icon: CalendarCheck,
  },
  {
    number: "05",
    title: "Delivery",
    description:
      "The approved service is delivered.",
    icon: Handshake,
  },
];

/* ============================================================
   SERVICE ICON
============================================================ */

function getServiceIcon(category?: string) {
  const value = category?.toLowerCase() ?? "";

  if (
    value.includes("training") ||
    value.includes("development") ||
    value.includes("education")
  ) {
    return GraduationCap;
  }

  if (
    value.includes("mediation") ||
    value.includes("conflict") ||
    value.includes("resolution")
  ) {
    return Handshake;
  }

  if (
    value.includes("consult") ||
    value.includes("advisory")
  ) {
    return ShieldCheck;
  }

  if (
    value.includes("management") ||
    value.includes("organizational")
  ) {
    return Layers3;
  }

  return Sparkles;
}

/* ============================================================
   COMPONENT
============================================================ */

export default function Services() {
  /* ==========================================================
     SERVICES STATE
  ========================================================== */

  const [services, setServices] =
    useState<Service[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState<string | null>(null);

  /* ==========================================================
     REQUEST MODAL STATE
  ========================================================== */

  const [selectedService, setSelectedService] =
    useState<Service | null>(null);

  const [isRequestOpen, setIsRequestOpen] =
    useState(false);

  /* ==========================================================
     FORM STATE
  ========================================================== */

  const [applicantName, setApplicantName] =
    useState("");

  const [applicantEmail, setApplicantEmail] =
    useState("");

  const [remarks, setRemarks] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [submitError, setSubmitError] =
    useState<string | null>(null);

  const [submitSuccess, setSubmitSuccess] =
    useState(false);

  /* ==========================================================
     LOAD SERVICES
  ========================================================== */

  useEffect(() => {
    let isMounted = true;

    const loadServices = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        const result =
          await serviceApi.getAll();

        if (!isMounted) {
          return;
        }

        setServices(result);
      } catch (error) {
        console.error(
          "Failed to load services:",
          error,
        );

        if (!isMounted) {
          return;
        }

        setLoadError(
          "We couldn't load our services right now. Please try again later.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadServices();

    return () => {
      isMounted = false;
    };
  }, []);

  /* ==========================================================
     ACTIVE SERVICES
  ========================================================== */

  const activeServices = useMemo(
    () =>
      services.filter(
        (service) => service.isActive,
      ),
    [services],
  );

  /* ==========================================================
     OPEN REQUEST MODAL
  ========================================================== */

  const handleRequestService = (
    service: Service,
  ) => {
    setSelectedService(service);

    setApplicantName("");
    setApplicantEmail("");
    setRemarks("");

    setSubmitError(null);
    setSubmitSuccess(false);

    setIsRequestOpen(true);
  };

  /* ==========================================================
     CLOSE REQUEST MODAL
  ========================================================== */

  const handleCloseRequest = () => {
    if (isSubmitting) {
      return;
    }

    setIsRequestOpen(false);
    setSelectedService(null);

    setApplicantName("");
    setApplicantEmail("");
    setRemarks("");

    setSubmitError(null);
    setSubmitSuccess(false);
  };

  /* ==========================================================
     SUBMIT REQUEST
  ========================================================== */

  const handleSubmitRequest = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!selectedService) {
      return;
    }

    const name =
      applicantName.trim();

    const email =
      applicantEmail.trim();

    const message =
      remarks.trim();

    /* --------------------------------------------------------
       VALIDATION
    -------------------------------------------------------- */

    if (!name) {
      setSubmitError(
        "Please enter your name.",
      );
      return;
    }

    if (!email) {
      setSubmitError(
        "Please enter your email address.",
      );
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email,
      )
    ) {
      setSubmitError(
        "Please enter a valid email address.",
      );
      return;
    }

    /* --------------------------------------------------------
       SUBMIT
    -------------------------------------------------------- */

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const request: CreateServiceRequest = {
        serviceId:
          selectedService.id,

        applicantName:
          name,

        applicantEmail:
          email,

        remarks:
          message || null,
      };

      await serviceApi.createRequest(
        request,
      );

      setSubmitSuccess(true);

      setApplicantName("");
      setApplicantEmail("");
      setRemarks("");
    } catch (error) {
      console.error(
        "Failed to submit service request:",
        error,
      );

      setSubmitError(
        "We couldn't submit your request. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      {/* ======================================================
          SERVICES SECTION
      ======================================================= */}

      <section
        id="services"
        className="relative overflow-hidden bg-[#eff4ff] py-20 lg:py-28"
      >
        {/* ====================================================
            BACKGROUND DECORATION
        ===================================================== */}

        <div className="pointer-events-none absolute -left-40 top-20 h-[380px] w-[380px] rounded-full bg-[#6FD1D7]/15 blur-[130px]" />

        <div className="pointer-events-none absolute -right-40 top-[45%] h-[420px] w-[420px] rounded-full bg-[#2563eb]/10 blur-[140px]" />

        {/* ====================================================
            CONTAINER
        ===================================================== */}

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12">

          {/* ==================================================
              HEADER
          =================================================== */}

          <div className="flex flex-col gap-4">

            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563eb]">
              Strategic Pillars
            </span>

            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">

              <div>
                <h2 className="font-[var(--font-jakarta)] text-3xl font-extrabold text-[#0b1c30] lg:text-4xl">
                  Our Professional Services
                </h2>

                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                  Integrated services supporting
                  training, mediation, professional
                  development, consultancy, and
                  organizational capacity building.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const firstService =
                    activeServices[0];

                  if (firstService) {
                    handleRequestService(
                      firstService,
                    );
                  } else {
                    document
                      .getElementById("services")
                      ?.scrollIntoView({
                        behavior: "smooth",
                      });
                  }
                }}
                className="
                  inline-flex
                  h-fit
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#002b5c]
                  px-6
                  py-3
                  text-sm
                  font-bold
                  text-white
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:bg-[#0d2142]
                  hover:shadow-lg
                "
              >
                Request a Service Proposal

                <ArrowRight className="h-4 w-4" />
              </button>

            </div>
          </div>

          {/* ==================================================
              SERVICE STATUS
          =================================================== */}

          <div className="mt-10 flex items-center justify-between">

            <div className="flex items-center gap-2">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
                <Layers3 className="h-4 w-4 text-[#2563eb]" />
              </div>

              <span className="text-sm font-semibold text-[#0b1c30]">
                Available Services
              </span>

            </div>

            {!isLoading &&
              !loadError &&
              activeServices.length > 0 && (
                <span className="text-xs font-semibold text-slate-500">
                  {activeServices.length}{" "}
                  {activeServices.length === 1
                    ? "service"
                    : "services"}{" "}
                  available
                </span>
              )}

          </div>

          {/* ==================================================
              LOADING
          =================================================== */}

          {isLoading && (
            <div className="mt-8 flex min-h-[280px] items-center justify-center rounded-2xl bg-white shadow-sm">

              <div className="flex flex-col items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#dce9ff]">
                  <Loader2 className="h-6 w-6 animate-spin text-[#2563eb]" />
                </div>

                <p className="text-sm font-medium text-slate-500">
                  Loading available services...
                </p>

              </div>

            </div>
          )}

          {/* ==================================================
              ERROR
          =================================================== */}

          {!isLoading && loadError && (
            <div className="mt-8 rounded-2xl bg-white p-10 text-center shadow-sm">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
                <X className="h-5 w-5 text-red-500" />
              </div>

              <h3 className="mt-4 text-lg font-extrabold text-[#0b1c30]">
                Unable to Load Services
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {loadError}
              </p>

            </div>
          )}

          {/* ==================================================
              EMPTY
          =================================================== */}

          {!isLoading &&
            !loadError &&
            activeServices.length === 0 && (
              <div className="mt-8 rounded-2xl bg-white p-10 text-center shadow-sm">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#dce9ff]">
                  <Layers3 className="h-6 w-6 text-[#2563eb]" />
                </div>

                <h3 className="mt-5 text-xl font-extrabold text-[#0b1c30]">
                  No Services Available
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  There are currently no active
                  services available for requests.
                  Please check again later.
                </p>

              </div>
            )}

          {/* ==================================================
              SERVICE CARDS
          =================================================== */}

          {!isLoading &&
            !loadError &&
            activeServices.length > 0 && (
              <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

                {activeServices.map(
                  (service) => {
                    const Icon =
                      getServiceIcon(
                        service.category,
                      );

                    const requirements = [
                      ...service.requirements,
                    ].sort(
                      (a, b) =>
                        a.displayOrder -
                        b.displayOrder,
                    );

                    return (
                      <article
                        key={service.id}
                        className="
                          group
                          flex
                          min-h-[420px]
                          flex-col
                          justify-between
                          overflow-hidden
                          rounded-2xl
                          bg-white
                          shadow-sm
                          transition-all
                          duration-300
                          hover:-translate-y-2
                          hover:shadow-[0_20px_50px_rgba(0,43,92,0.12)]
                        "
                      >

                        {/* ====================================
                            IMAGE
                        ===================================== */}

                        <div className="relative h-48 overflow-hidden bg-[#dce9ff]">

                          {service.imageUrl ? (
                            <Image
                              src={
                                service.imageUrl
                              }
                              alt={
                                service.name
                              }
                              fill
                              sizes="
                                (max-width: 768px) 100vw,
                                (max-width: 1024px) 50vw,
                                33vw
                              "
                              className="
                                object-cover
                                transition-transform
                                duration-500
                                group-hover:scale-105
                              "
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#dce9ff] to-[#eef7fa]">
                              <Icon className="h-14 w-14 text-[#2563eb]/40" />
                            </div>
                          )}

                          {/* IMAGE OVERLAY */}

                          <div className="absolute inset-0 bg-gradient-to-t from-[#002b5c]/75 via-transparent to-transparent" />

                          {/* CATEGORY */}

                          <div className="absolute bottom-4 left-5">

                            <span className="
                              inline-flex
                              items-center
                              gap-2
                              rounded-lg
                              bg-white/90
                              px-3
                              py-1.5
                              text-[10px]
                              font-bold
                              uppercase
                              tracking-wider
                              text-[#002b5c]
                              backdrop-blur-sm
                            ">
                              <Icon className="h-3.5 w-3.5" />

                              {service.requiresTraining
                                ? "Training-Based"
                                : service.category}
                            </span>

                          </div>

                        </div>

                        {/* ====================================
                            CONTENT
                        ===================================== */}

                        <div className="flex flex-1 flex-col p-7">

                          {/* SERVICE CODE */}

                          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#2563eb]">
                            {service.serviceCode}
                          </span>

                          {/* TITLE */}

                          <h3 className="mt-3 text-xl font-extrabold leading-tight text-[#0b1c30]">
                            {service.name}
                          </h3>

                          {/* CATEGORY */}

                          <p className="mt-2 text-xs font-semibold text-slate-400">
                            {service.category}
                          </p>

                          {/* DESCRIPTION */}

                          <p className="mt-4 text-sm leading-7 text-slate-600">
                            {service.description ||
                              "Professional service provided by ACE NextGen Consultancy Inc."}
                          </p>

                          {/* REQUIREMENTS */}

                          {requirements.length >
                            0 && (
                            <div className="mt-5">

                              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                Requirements
                              </p>

                              <div className="space-y-2">

                                {requirements
                                  .slice(0, 3)
                                  .map(
                                    (
                                      requirement,
                                    ) => (
                                      <div
                                        key={
                                          requirement.id
                                        }
                                        className="flex items-start gap-2.5"
                                      >

                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2563eb]" />

                                        <span className="text-xs leading-5 text-slate-600">
                                          {
                                            requirement.name
                                          }

                                          {requirement.isRequired && (
                                            <span className="ml-1 text-red-500">
                                              *
                                            </span>
                                          )}
                                        </span>

                                      </div>
                                    ),
                                  )}

                              </div>

                              {requirements.length >
                                3 && (
                                <p className="mt-2 text-[11px] font-medium text-slate-400">
                                  +
                                  {requirements.length -
                                    3}{" "}
                                  more requirement
                                  {requirements.length -
                                    3 !==
                                  1
                                    ? "s"
                                    : ""}
                                </p>
                              )}

                            </div>
                          )}

                          {/* ==================================
                              CTA
                          =================================== */}

                          <div className="mt-auto pt-7">

                            <button
                              type="button"
                              onClick={() =>
                                handleRequestService(
                                  service,
                                )
                              }
                              className="
                                group/button
                                flex
                                w-full
                                items-center
                                justify-between
                                rounded-xl
                                bg-[#002b5c]
                                px-4
                                py-3.5
                                text-sm
                                font-bold
                                text-white
                                transition-all
                                duration-300
                                hover:bg-[#0d2142]
                              "
                            >

                              <span>
                                Request this service
                              </span>

                              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">

                                <ArrowRight
                                  className="
                                    h-4
                                    w-4
                                    transition-transform
                                    duration-300
                                    group-hover/button:translate-x-1
                                  "
                                />

                              </span>

                            </button>

                          </div>

                        </div>

                      </article>
                    );
                  },
                )}

              </div>
            )}

          {/* ==================================================
              WORKFLOW
          =================================================== */}

          <div className="mt-20">

            <div className="mx-auto max-w-6xl rounded-2xl bg-white p-7 shadow-sm sm:p-9 lg:p-10">

              {/* HEADER */}

              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                <div>

                  <div className="flex items-center gap-2">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#dce9ff]">
                      <Layers3 className="h-4 w-4 text-[#2563eb]" />
                    </div>

                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#2563eb]">
                      How It Works
                    </span>

                  </div>

                  <h3 className="mt-3 text-2xl font-extrabold text-[#002b5c] sm:text-3xl">
                    From Service Request to Delivery
                  </h3>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                    Your request follows a structured
                    workflow from submission through
                    service delivery.
                  </p>

                </div>

                <div className="
                  flex
                  w-fit
                  items-center
                  gap-2
                  rounded-full
                  bg-green-50
                  px-4
                  py-2
                  text-xs
                  font-bold
                  text-green-600
                ">

                  <span className="relative flex h-2 w-2">

                    <span className="absolute h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />

                    <span className="relative h-2 w-2 rounded-full bg-green-500" />

                  </span>

                  Service Requests Open

                </div>

              </div>

              {/* STEPS */}

              <div className="relative mt-10">

                <div className="absolute left-[8%] right-[8%] top-8 hidden h-px bg-slate-200 lg:block" />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

                  {workflowSteps.map(
                    (step, index) => {
                      const Icon =
                        step.icon;

                      return (
                        <div
                          key={
                            step.number
                          }
                          className="
                            group/step
                            relative
                            rounded-xl
                            bg-[#f7f9fb]
                            p-5
                            transition-all
                            duration-300
                            hover:-translate-y-1
                            hover:bg-white
                            hover:shadow-lg
                          "
                        >

                          <div className="flex items-center justify-between">

                            <div className="
                              flex
                              h-11
                              w-11
                              items-center
                              justify-center
                              rounded-xl
                              bg-[#dce9ff]
                              transition-all
                              duration-300
                              group-hover/step:bg-[#002b5c]
                            ">

                              <Icon className="h-5 w-5 text-[#2563eb] transition-colors group-hover/step:text-white" />

                            </div>

                            <span className="text-[10px] font-extrabold text-slate-300">
                              {step.number}
                            </span>

                          </div>

                          <h4 className="mt-5 text-sm font-extrabold text-[#002b5c]">
                            {step.title}
                          </h4>

                          <p className="mt-1 text-xs leading-5 text-slate-400">
                            {step.description}
                          </p>

                          {index <
                            workflowSteps.length -
                              1 && (
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
                                text-slate-300
                                lg:block
                              "
                            />
                          )}

                        </div>
                      );
                    },
                  )}

                </div>

              </div>

              {/* FOOTER */}

              <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eff4ff]">
                    <ShieldCheck className="h-4 w-4 text-[#2563eb]" />
                  </div>

                  <p className="text-xs text-slate-500">
                    Every service request is reviewed
                    individually.
                  </p>

                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-[#2563eb]">
                  Start with a request
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>

              </div>

            </div>

          </div>

          {/* ==================================================
              SERVICE RESOLUTION
          =================================================== */}

          <div className="mx-auto mt-20 max-w-5xl">

            <div className="relative overflow-hidden rounded-[28px] bg-[#002b5c] px-7 py-10 text-white shadow-[0_25px_70px_rgba(0,43,92,0.18)] sm:px-10 lg:px-14">

              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#6FD1D7]/20 blur-[100px]" />

              <div className="relative">

                <div className="text-center">

                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">

                    <Sparkles className="h-4 w-4" />

                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                      Integrated Service Workflow
                    </span>

                  </div>

                  <h3 className="mt-5 text-3xl font-extrabold sm:text-4xl">
                    One Request.
                    <br />
                    The Right Service Path.
                  </h3>

                  <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/60">
                    After you submit your request,
                    our team reviews your needs and
                    determines the appropriate next
                    step.
                  </p>

                </div>

                {/* RESOLUTION CARDS */}

                <div className="mt-10 grid gap-5 md:grid-cols-3">

                  {/* TRAINING */}

                  <div className="
                    rounded-2xl
                    bg-white/5
                    p-6
                    text-center
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:bg-white/10
                  ">

                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                      <GraduationCap className="h-6 w-6" />
                    </div>

                    <p className="mt-4 text-xs font-bold uppercase tracking-wider text-white/40">
                      Training
                    </p>

                    <h4 className="mt-1 text-xl font-extrabold">
                      Training Management
                    </h4>

                    <p className="mt-2 text-xs leading-5 text-white/50">
                      Training-related requests can
                      proceed into the training
                      lifecycle.
                    </p>

                  </div>

                  {/* CONSULTATION */}

                  <div className="
                    rounded-2xl
                    bg-white/5
                    p-6
                    text-center
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:bg-white/10
                  ">

                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                      <Handshake className="h-6 w-6" />
                    </div>

                    <p className="mt-4 text-xs font-bold uppercase tracking-wider text-white/40">
                      Consultation
                    </p>

                    <h4 className="mt-1 text-xl font-extrabold">
                      Scheduled Meeting
                    </h4>

                    <p className="mt-2 text-xs leading-5 text-white/50">
                      Consultation requests can be
                      scheduled with the appropriate
                      team.
                    </p>

                  </div>

                  {/* OTHER */}

                  <div className="
                    rounded-2xl
                    bg-white/5
                    p-6
                    text-center
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:bg-white/10
                  ">

                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                      <Layers3 className="h-6 w-6" />
                    </div>

                    <p className="mt-4 text-xs font-bold uppercase tracking-wider text-white/40">
                      Other
                    </p>

                    <h4 className="mt-1 text-xl font-extrabold">
                      Service Fulfillment
                    </h4>

                    <p className="mt-2 text-xs leading-5 text-white/50">
                      Other approved requests are
                      handled according to their
                      specific requirements.
                    </p>

                  </div>

                </div>

                {/* TRAINING LIFECYCLE */}

                <div className="mt-8 rounded-2xl bg-white/5 p-5">

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
                    ].map(
                      (item, index) => (
                        <div
                          key={item}
                          className="flex items-center"
                        >

                          <div className="
                            rounded-full
                            bg-white/10
                            px-3
                            py-2
                            text-[9px]
                            font-semibold
                            text-white/70
                          ">
                            {item}
                          </div>

                          {index < 5 && (
                            <ChevronRight className="mx-1 h-3 w-3 text-white/20" />
                          )}

                        </div>
                      ),
                    )}

                  </div>

                </div>

                <div className="mt-7 flex items-center justify-center gap-2 text-xs text-white/50">

                  <UsersIcon />

                  One integrated ecosystem for
                  services and people development.

                </div>

              </div>

            </div>

          </div>

          {/* ==================================================
              FINAL CTA
          =================================================== */}

          <div className="mt-16 text-center">

            <p className="text-sm text-slate-500">
              Ready to work with ACE NextGen?
            </p>

            <button
              type="button"
              onClick={() => {
                const firstService =
                  activeServices[0];

                if (firstService) {
                  handleRequestService(
                    firstService,
                  );
                }
              }}
              disabled={
                activeServices.length === 0
              }
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
                hover:bg-[#0d2142]
                hover:shadow-xl
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >

              Request a Service

              <ArrowRight
                className="
                  h-4
                  w-4
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              />

            </button>

          </div>

        </div>
      </section>

      {/* ======================================================
          SERVICE REQUEST MODAL
      ======================================================= */}

      {isRequestOpen &&
        selectedService && (
          <div
            className="
              fixed
              inset-0
              z-[100]
              flex
              items-center
              justify-center
              bg-[#002b5c]/60
              px-4
              py-6
              backdrop-blur-sm
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-request-title"
          >

            <div
              className="
                relative
                max-h-[90vh]
                w-full
                max-w-xl
                overflow-y-auto
                rounded-[28px]
                bg-white
                shadow-[0_30px_100px_rgba(0,0,0,0.25)]
              "
            >

              {/* CLOSE */}

              <button
                type="button"
                onClick={
                  handleCloseRequest
                }
                disabled={
                  isSubmitting
                }
                className="
                  absolute
                  right-5
                  top-5
                  z-10
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-gray-100
                  text-gray-500
                  transition
                  hover:bg-gray-200
                  hover:text-gray-700
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              {/* HEADER */}

              <div className="border-b border-gray-100 px-7 py-7 pr-16">

                <div className="flex items-center gap-3">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dce9ff]">
                    <Send className="h-5 w-5 text-[#2563eb]" />
                  </div>

                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#2563eb]">
                      Service Request
                    </p>

                    <h3
                      id="service-request-title"
                      className="mt-1 text-2xl font-extrabold text-[#002b5c]"
                    >
                      {selectedService.name}
                    </h3>

                  </div>

                </div>

                <p className="mt-4 text-sm leading-6 text-gray-500">
                  Please provide your information
                  below. Our team will review your
                  request and contact you regarding
                  the next step.
                </p>

              </div>

              {/* SUCCESS */}

              {submitSuccess ? (
                <div className="px-7 py-10">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>

                  <div className="mt-5 text-center">

                    <h4 className="text-2xl font-extrabold text-[#002b5c]">
                      Request Submitted
                    </h4>

                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
                      Thank you for contacting ACE
                      NextGen. Your service request has
                      been submitted successfully. Our
                      team will review your request and
                      contact you using the email address
                      you provided.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={
                      handleCloseRequest
                    }
                    className="
                      mt-8
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-[#002b5c]
                      px-5
                      py-3.5
                      text-sm
                      font-bold
                      text-white
                      transition
                      hover:bg-[#2563eb]
                    "
                  >
                    Done
                  </button>

                </div>
              ) : (
                <form
                  onSubmit={
                    handleSubmitRequest
                  }
                  className="px-7 py-7"
                >

                  {/* ERROR */}

                  {submitError && (
                    <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                      {submitError}
                    </div>
                  )}

                  {/* NAME */}

                  <div>

                    <label
                      htmlFor="applicant-name"
                      className="mb-2 block text-sm font-bold text-[#002b5c]"
                    >
                      Full Name
                    </label>

                    <div className="relative">

                      <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                      <input
                        id="applicant-name"
                        type="text"
                        value={
                          applicantName
                        }
                        onChange={(event) =>
                          setApplicantName(
                            event.target.value,
                          )
                        }
                        placeholder="Enter your full name"
                        maxLength={200}
                        disabled={
                          isSubmitting
                        }
                        className="
                          w-full
                          rounded-xl
                          border-0
                          bg-[#f7f9fb]
                          py-3.5
                          pl-11
                          pr-4
                          text-sm
                          text-gray-700
                          outline-none
                          ring-1
                          ring-gray-200
                          transition
                          placeholder:text-gray-400
                          focus:bg-white
                          focus:ring-2
                          focus:ring-[#2563eb]
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        "
                        required
                      />

                    </div>

                  </div>

                  {/* EMAIL */}

                  <div className="mt-5">

                    <label
                      htmlFor="applicant-email"
                      className="mb-2 block text-sm font-bold text-[#002b5c]"
                    >
                      Email Address
                    </label>

                    <div className="relative">

                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                      <input
                        id="applicant-email"
                        type="email"
                        value={
                          applicantEmail
                        }
                        onChange={(event) =>
                          setApplicantEmail(
                            event.target.value,
                          )
                        }
                        placeholder="you@example.com"
                        maxLength={320}
                        disabled={
                          isSubmitting
                        }
                        className="
                          w-full
                          rounded-xl
                          border-0
                          bg-[#f7f9fb]
                          py-3.5
                          pl-11
                          pr-4
                          text-sm
                          text-gray-700
                          outline-none
                          ring-1
                          ring-gray-200
                          transition
                          placeholder:text-gray-400
                          focus:bg-white
                          focus:ring-2
                          focus:ring-[#2563eb]
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        "
                        required
                      />

                    </div>

                  </div>

                  {/* REMARKS */}

                  <div className="mt-5">

                    <label
                      htmlFor="service-remarks"
                      className="mb-2 block text-sm font-bold text-[#002b5c]"
                    >
                      Message / Remarks

                      <span className="ml-1 font-normal text-gray-400">
                        (Optional)
                      </span>
                    </label>

                    <div className="relative">

                      <MessageSquare className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-gray-400" />

                      <textarea
                        id="service-remarks"
                        value={remarks}
                        onChange={(event) =>
                          setRemarks(
                            event.target.value,
                          )
                        }
                        placeholder="Tell us briefly about the service you need..."
                        rows={5}
                        maxLength={2000}
                        disabled={
                          isSubmitting
                        }
                        className="
                          w-full
                          resize-none
                          rounded-xl
                          border-0
                          bg-[#f7f9fb]
                          py-3.5
                          pl-11
                          pr-4
                          text-sm
                          leading-6
                          text-gray-700
                          outline-none
                          ring-1
                          ring-gray-200
                          transition
                          placeholder:text-gray-400
                          focus:bg-white
                          focus:ring-2
                          focus:ring-[#2563eb]
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        "
                      />

                    </div>

                    <p className="mt-2 text-right text-[10px] text-gray-400">
                      {remarks.length}/2000
                    </p>

                  </div>

                  {/* SELECTED SERVICE */}

                  <div className="mt-6 rounded-xl bg-[#eff4ff] p-4">

                    <div className="flex items-start gap-3">

                      <Layers3 className="mt-0.5 h-4 w-4 shrink-0 text-[#2563eb]" />

                      <div>

                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#2563eb]">
                          Selected Service
                        </p>

                        <p className="mt-1 text-sm font-bold text-[#002b5c]">
                          {
                            selectedService.name
                          }
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {
                            selectedService.category
                          }
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* SUBMIT */}

                  <button
                    type="submit"
                    disabled={
                      isSubmitting
                    }
                    className="
                      mt-7
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-[#002b5c]
                      px-5
                      py-3.5
                      text-sm
                      font-bold
                      text-white
                      shadow-lg
                      transition-all
                      duration-300
                      hover:-translate-y-0.5
                      hover:bg-[#2563eb]
                      hover:shadow-xl
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >

                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Service Request
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}

                  </button>

                  <p className="mt-4 text-center text-[10px] leading-5 text-gray-400">
                    By submitting this request,
                    you agree to be contacted by ACE
                    NextGen regarding your service
                    inquiry.
                  </p>

                </form>
              )}

            </div>

          </div>
        )}

    </>
  );
}

/* ============================================================
   SMALL USERS ICON
============================================================ */

function UsersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
      />

      <circle
        cx="9"
        cy="7"
        r="4"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
      />
    </svg>
  );
}