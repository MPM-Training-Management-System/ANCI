"use client";

import Image, {
  StaticImageData,
} from "next/image";

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

import Governance from "@/assets/image/governance.jpg";
import Mediation from "@/assets/image/train.jpg";
import Sport from "@/assets/image/sport.jpg";

import { serviceApi } from "@/lib/api";

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@repo/ui/index";

/* ============================================================
   IMAGE FALLBACKS

   Your backend Service model does not currently contain an
   image URL, so we keep the existing landing-page images as
   visual fallbacks.

   New services will receive the default image.
============================================================ */

const serviceImages: Record<
  string,
  StaticImageData
> = {
  governance: Governance,
  mediation: Mediation,
  "mediation & peace": Mediation,
  "sports development": Sport,
};

const getServiceImage = (
  service: Service,
): StaticImageData => {
  const name = service.name
    .trim()
    .toLowerCase();

  return serviceImages[name] ?? Governance;
};

/* ============================================================
   WORKFLOW
============================================================ */

const workflowSteps = [
  {
    number: "01",
    title: "Request",
    description:
      "Submit the service you need.",
    icon: Send,
  },
  {
    number: "02",
    title: "Review",
    description:
      "Our team reviews your request.",
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
     ACTIVE SERVICES ONLY
  ========================================================== */

  const activeServices =
    useMemo(
      () =>
        services.filter(
          (service) =>
            service.isActive,
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
     SUBMIT SERVICE REQUEST
  ========================================================== */

  const handleSubmitRequest =
    async (
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

      /* ------------------------------------------------------
         VALIDATION
      ------------------------------------------------------ */

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

      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      try {
        const request: CreateServiceRequest =
          {
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
        className="relative overflow-hidden bg-surface py-24 lg:py-32"
      >
        {/* ====================================================
            BACKGROUND
        ===================================================== */}

        <div className="pointer-events-none absolute -left-52 top-20 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[130px]" />

        <div className="pointer-events-none absolute -right-52 top-[40%] h-[450px] w-[450px] rounded-full bg-secondary/10 blur-[140px]" />

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(#002b5c 1px, transparent 1px), linear-gradient(90deg, #002b5c 1px, transparent 1px)",
            backgroundSize:
              "40px 40px",
          }}
        />

        <div className="container relative z-10 mx-auto px-6 lg:px-12">
          {/* ==================================================
              HEADER
          =================================================== */}

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
              Professional Services
              <br />

              <span className="bg-gradient-to-r from-[#002b5c] via-primary to-secondary bg-clip-text text-transparent">
                Built Around Your Needs
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              Explore our available services and
              submit a request directly to ACE
              NextGen. Every request is reviewed
              individually so the appropriate
              service path can be determined.
            </p>
          </div>

          {/* ==================================================
              WORKFLOW
          =================================================== */}

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
              {/* Glow */}

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
                      How It Works
                    </span>
                  </div>

                  <h3 className="mt-3 text-2xl font-extrabold text-[#002b5c] sm:text-3xl">
                    From Service Request to Delivery
                  </h3>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                    Your request follows a structured
                    workflow from submission through
                    service delivery.
                  </p>
                </div>

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

                  Service Requests Open
                </div>
              </div>

              {/* Workflow */}

              <div className="relative mt-10">
                <div className="absolute left-[8%] right-[8%] top-8 hidden h-px bg-gray-200 lg:block" />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  {workflowSteps.map(
                    (
                      step,
                      index,
                    ) => {
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
                              {
                                step.number
                              }
                            </span>
                          </div>

                          <h4 className="mt-5 text-sm font-extrabold text-[#002b5c]">
                            {
                              step.title
                            }
                          </h4>

                          <p className="mt-1 text-xs leading-5 text-gray-400">
                            {
                              step.description
                            }
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
                                text-gray-300
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

              {/* Footer */}

              <div className="relative mt-8 flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                  </div>

                  <p className="text-xs text-gray-500">
                    Every service request is reviewed
                    individually.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  Start with a request

                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* ==================================================
              AVAILABLE SERVICES
          =================================================== */}

          <div className="mt-20">
            {/* Heading */}

            <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                  Available Services
                </p>

                <h3 className="mt-2 text-3xl font-extrabold text-[#002b5c] sm:text-4xl">
                  Choose a Service
                </h3>
              </div>

              <p className="max-w-md text-sm leading-6 text-gray-500 sm:text-right">
                Select the service that best matches
                your organization's needs and submit
                a request for review.
              </p>
            </div>

            {/* ==================================================
                LOADING
            =================================================== */}

            {isLoading && (
              <div className="flex min-h-[260px] items-center justify-center rounded-[28px] border border-gray-200 bg-white">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />

                  <p className="text-sm text-gray-500">
                    Loading available services...
                  </p>
                </div>
              </div>
            )}

            {/* ==================================================
                ERROR
            =================================================== */}

            {!isLoading &&
              loadError && (
                <div className="rounded-[28px] border border-red-200 bg-red-50 p-8 text-center">
                  <p className="text-sm font-semibold text-red-700">
                    {loadError}
                  </p>
                </div>
              )}

            {/* ==================================================
                NO SERVICES
            =================================================== */}

            {!isLoading &&
              !loadError &&
              activeServices.length ===
                0 && (
                <div className="rounded-[28px] border border-gray-200 bg-white p-10 text-center shadow-sm">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                    <Layers3 className="h-6 w-6 text-primary" />
                  </div>

                  <h4 className="mt-5 text-xl font-extrabold text-[#002b5c]">
                    No Services Available
                  </h4>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
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
              activeServices.length >
                0 && (
                <div className="grid gap-7 lg:grid-cols-3">
                  {activeServices.map(
                    (
                      service,
                      index,
                    ) => {
                      const image =
                        getServiceImage(
                          service,
                        );

                      const requirements =
                        [
                          ...service.requirements,
                        ].sort(
                          (
                            a,
                            b,
                          ) =>
                            a.displayOrder -
                            b.displayOrder,
                        );

                      return (
                        <Card
                          key={
                            service.id
                          }
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
                              src={
                                image
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
                                duration-700
                                group-hover:scale-110
                              "
                            />

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
                              {String(
                                index +
                                  1,
                              ).padStart(
                                2,
                                "0",
                              )}
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

                                {service.requiresTraining
                                  ? "Training-Based"
                                  : service.category}
                              </div>
                            </div>
                          </div>

                          {/* Content */}

                          <CardContent className="p-7">
                            {/* Code */}

                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">
                              {
                                service.serviceCode
                              }
                            </p>

                            {/* Name */}

                            <CardTitle className="mt-2 text-2xl font-extrabold text-[#002b5c]">
                              {
                                service.name
                              }
                            </CardTitle>

                            {/* Category */}

                            <p className="mt-2 text-xs font-semibold text-gray-400">
                              {
                                service.category
                              }
                            </p>

                            {/* Description */}

                            <CardDescription className="mt-4 min-h-[88px] text-sm leading-7 text-gray-500">
                              {service.description ||
                                "Professional service provided by ACE NextGen Consultancy Inc."}
                            </CardDescription>

                            {/* Requirements */}

                            {requirements.length >
                              0 && (
                              <div className="mt-6 space-y-3 border-t border-gray-100 pt-6">
                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
                                  Service Requirements
                                </p>

                                {requirements
                                  .slice(
                                    0,
                                    4,
                                  )
                                  .map(
                                    (
                                      requirement,
                                    ) => (
                                      <div
                                        key={
                                          requirement.id
                                        }
                                        className="
                                          flex
                                          items-start
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
                                            mt-0.5
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

                                        <span>
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

                                {requirements.length >
                                  4 && (
                                  <p className="text-xs text-gray-400">
                                    +
                                    {requirements.length -
                                      4}{" "}
                                    more
                                    requirement
                                    {requirements.length -
                                      4 !==
                                    1
                                      ? "s"
                                      : ""}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* CTA */}

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
                              <div>
                                <span className="block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
                                  Need this service?
                                </span>

                                <span className="mt-1 block text-xs text-gray-500">
                                  Submit a request
                                </span>
                              </div>

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
                                  h-11
                                  items-center
                                  gap-2
                                  rounded-xl
                                  bg-[#002b5c]
                                  px-4
                                  text-xs
                                  font-bold
                                  text-white
                                  transition-all
                                  duration-300
                                  hover:-translate-y-1
                                  hover:bg-primary
                                  hover:shadow-lg
                                "
                              >
                                Request

                                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/button:translate-x-1" />
                              </button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    },
                  )}
                </div>
              )}
          </div>

          {/* ==================================================
              SERVICE RESOLUTION
          =================================================== */}

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
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/30 blur-[110px]" />

              <div className="relative">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2">
                    <Sparkles className="h-4 w-4 text-white" />

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

                {/* Resolution */}

                <div className="mt-10 grid gap-5 md:grid-cols-3 md:items-center">
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
                      Training Management
                    </h4>

                    <p className="mt-2 text-xs text-white/50">
                      Training-related requests can
                      proceed into the training
                      lifecycle.
                    </p>
                  </div>

                  {/* Consultation */}

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
                      Consultation
                    </p>

                    <h4 className="mt-1 text-xl font-extrabold">
                      Scheduled Meeting
                    </h4>

                    <p className="mt-2 text-xs text-white/50">
                      Consultation requests can be
                      scheduled with the appropriate
                      team.
                    </p>
                  </div>

                  {/* Other */}

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
                      <Layers3 className="h-6 w-6" />
                    </div>

                    <p className="mt-4 text-xs font-bold uppercase tracking-wider text-white/40">
                      Other
                    </p>

                    <h4 className="mt-1 text-xl font-extrabold">
                      Service Fulfillment
                    </h4>

                    <p className="mt-2 text-xs text-white/50">
                      Other approved requests are
                      handled according to their
                      specific requirements.
                    </p>
                  </div>
                </div>

                {/* Training lifecycle */}

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
                    ].map(
                      (
                        item,
                        index,
                      ) => (
                        <div
                          key={
                            item
                          }
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
                            {
                              item
                            }
                          </div>

                          {index <
                            5 && (
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
            <p className="text-sm text-gray-500">
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
                } else {
                  document
                    .getElementById(
                      "services",
                    )
                    ?.scrollIntoView({
                      behavior:
                        "smooth",
                    });
                }
              }}
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
              {/* Close */}

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

              {/* Header */}

              <div className="border-b border-gray-100 px-7 py-7 pr-16">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                    <Send className="h-5 w-5 text-primary" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
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

              {/* Success */}

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
                      hover:bg-primary
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
                  {/* Error */}

                  {submitError && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {submitError}
                    </div>
                  )}

                  {/* Name */}

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
                        onChange={(
                          event,
                        ) =>
                          setApplicantName(
                            event
                              .target
                              .value,
                          )
                        }
                        placeholder="Enter your full name"
                        maxLength={
                          200
                        }
                        disabled={
                          isSubmitting
                        }
                        className="
                          w-full
                          rounded-xl
                          border
                          border-gray-200
                          bg-gray-50
                          py-3.5
                          pl-11
                          pr-4
                          text-sm
                          text-gray-700
                          outline-none
                          transition
                          placeholder:text-gray-400
                          focus:border-primary
                          focus:bg-white
                          focus:ring-2
                          focus:ring-primary/10
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        "
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}

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
                        onChange={(
                          event,
                        ) =>
                          setApplicantEmail(
                            event
                              .target
                              .value,
                          )
                        }
                        placeholder="you@example.com"
                        maxLength={
                          320
                        }
                        disabled={
                          isSubmitting
                        }
                        className="
                          w-full
                          rounded-xl
                          border
                          border-gray-200
                          bg-gray-50
                          py-3.5
                          pl-11
                          pr-4
                          text-sm
                          text-gray-700
                          outline-none
                          transition
                          placeholder:text-gray-400
                          focus:border-primary
                          focus:bg-white
                          focus:ring-2
                          focus:ring-primary/10
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        "
                        required
                      />
                    </div>
                  </div>

                  {/* Remarks */}

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
                        value={
                          remarks
                        }
                        onChange={(
                          event,
                        ) =>
                          setRemarks(
                            event
                              .target
                              .value,
                          )
                        }
                        placeholder="Tell us briefly about the service you need..."
                        rows={
                          5
                        }
                        maxLength={
                          2000
                        }
                        disabled={
                          isSubmitting
                        }
                        className="
                          w-full
                          resize-none
                          rounded-xl
                          border
                          border-gray-200
                          bg-gray-50
                          py-3.5
                          pl-11
                          pr-4
                          text-sm
                          leading-6
                          text-gray-700
                          outline-none
                          transition
                          placeholder:text-gray-400
                          focus:border-primary
                          focus:bg-white
                          focus:ring-2
                          focus:ring-primary/10
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        "
                      />
                    </div>

                    <p className="mt-2 text-right text-[10px] text-gray-400">
                      {remarks.length}/2000
                    </p>
                  </div>

                  {/* Selected service */}

                  <div className="mt-6 rounded-xl border border-primary/10 bg-primary/5 p-4">
                    <div className="flex items-start gap-3">
                      <Layers3 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">
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

                  {/* Submit */}

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
                      hover:bg-primary
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
   SMALL ICON
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