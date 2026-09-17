"use client";

import { FormEvent, useEffect, useState } from "react";

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
  X,
} from "lucide-react";

import { Button, Input } from "@repo/ui/index";


import { serviceApi } from "@/lib/api";

import type {
  CreateServiceRequest,
  Service,
} from "@repo/types";

export default function Contact() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    applicantName: "",
    applicantEmail: "",
    serviceId: "",
    remarks: "",
  });

  /*
   * ---------------------------------------------------------
   * SERVICE API
   * ---------------------------------------------------------
   */



  /*
   * ---------------------------------------------------------
   * LOAD ACTIVE SERVICES
   * ---------------------------------------------------------
   */

  useEffect(() => {
    let isMounted = true;

    const loadServices = async () => {
      try {
        const result = await serviceApi.getAll();

        if (!isMounted) {
          return;
        }

        setServices(
          result.filter((service) => service.isActive),
        );
      } catch (error) {
        console.error(
          "Failed to load services:",
          error,
        );
      } finally {
        if (isMounted) {
          setIsLoadingServices(false);
        }
      }
    };

    void loadServices();

    return () => {
      isMounted = false;
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * FORM HANDLERS
   * ---------------------------------------------------------
   */

  const handleChange = (
    field:
      | "applicantName"
      | "applicantEmail"
      | "serviceId"
      | "remarks",
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setErrorMessage("");

    if (!form.applicantName.trim()) {
      setErrorMessage(
        "Please enter your full name.",
      );
      return;
    }

    if (!form.applicantEmail.trim()) {
      setErrorMessage(
        "Please enter your email address.",
      );
      return;
    }

    if (!form.serviceId) {
      setErrorMessage(
        "Please select a service.",
      );
      return;
    }

    if (!form.remarks.trim()) {
      setErrorMessage(
        "Please tell us about your service needs.",
      );
      return;
    }

    const request: CreateServiceRequest = {
      serviceId: form.serviceId,
      applicantName: form.applicantName.trim(),
      applicantEmail: form.applicantEmail.trim(),
      remarks: form.remarks.trim(),
    };

    setIsSubmitting(true);

    try {
      await serviceApi.createRequest(request);

      setForm({
        applicantName: "",
        applicantEmail: "",
        serviceId: "",
        remarks: "",
      });

      setIsSuccessOpen(true);
    } catch (error) {
      console.error(
        "Failed to submit service request:",
        error,
      );

      setErrorMessage(
        "We could not submit your request right now. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */

  return (
    <>
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
              Tell us what your organization needs. Our team will
              review your request and determine the appropriate
              service pathway.
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
                    sports development, or training, start by
                    submitting a service request and let our team
                    determine the appropriate next step.
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
                            Service Resolution
                          </p>

                          <p className="mt-1 text-xs leading-5 text-white/40">
                            The appropriate service pathway is
                            determined after review.
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
                      <a
                        href="mailto:contact@acenextgen.org"
                        className="group flex items-center gap-4"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition-colors group-hover:bg-white/20">
                          <Mail className="h-4 w-4" />
                        </div>

                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">
                            Email
                          </p>

                          <p className="mt-1 text-sm font-semibold transition-colors group-hover:text-primary">
                            contact@acenextgen.org
                          </p>
                        </div>
                      </a>

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
                    Complete the form below. Your request will be
                    submitted to the ACE NextGen service management
                    system for review.
                  </p>
                </div>

                {/* ================================================= */}
                {/* ERROR */}
                {/* ================================================= */}

                {errorMessage && (
                  <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100">
                      <X className="h-3.5 w-3.5 text-red-600" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-red-700">
                        Unable to submit request
                      </p>

                      <p className="mt-1 text-xs leading-5 text-red-600">
                        {errorMessage}
                      </p>
                    </div>
                  </div>
                )}

                {/* ================================================= */}
                {/* FORM */}
                {/* ================================================= */}

                <form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
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
                        value={form.applicantName}
                        onChange={(event) =>
                          handleChange(
                            "applicantName",
                            event.target.value,
                          )
                        }
                        placeholder="John Doe"
                        autoComplete="name"
                        disabled={isSubmitting}
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
                        value={form.applicantEmail}
                        onChange={(event) =>
                          handleChange(
                            "applicantEmail",
                            event.target.value,
                          )
                        }
                        placeholder="john@example.com"
                        autoComplete="email"
                        disabled={isSubmitting}
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

                  {/* Service */}
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
                      value={form.serviceId}
                      onChange={(event) =>
                        handleChange(
                          "serviceId",
                          event.target.value,
                        )
                      }
                      disabled={
                        isSubmitting ||
                        isLoadingServices
                      }
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
                        disabled:cursor-not-allowed
                        disabled:bg-gray-50
                      "
                    >
                      <option value="">
                        {isLoadingServices
                          ? "Loading services..."
                          : "Select a service"}
                      </option>

                      {services.map((service) => (
                        <option
                          key={service.id}
                          value={service.id}
                        >
                          {service.name}
                        </option>
                      ))}
                    </select>

                    {!isLoadingServices &&
                      services.length === 0 && (
                        <p className="mt-2 text-xs text-gray-400">
                          No active services are currently available.
                        </p>
                      )}
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
                      rows={6}
                      value={form.remarks}
                      onChange={(event) =>
                        handleChange(
                          "remarks",
                          event.target.value,
                        )
                      }
                      disabled={isSubmitting}
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
                        disabled:cursor-not-allowed
                        disabled:bg-gray-50
                      "
                    />
                  </div>

                  {/* ================================================= */}
                  {/* SUBMIT */}
                  {/* ================================================= */}

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
                      disabled={
                        isSubmitting ||
                        isLoadingServices ||
                        services.length === 0
                      }
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
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                        disabled:hover:translate-y-0
                      "
                    >
                      {isSubmitting
                        ? "Submitting..."
                        : "Submit Service Request"}

                      {!isSubmitting && (
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
                      )}
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
              {/* Structured Process */}
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

              {/* Transparent Workflow */}
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
                    Request status is recorded
                  </p>
                </div>
              </div>

              {/* Expert Support */}
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

      {/* =========================================================== */}
      {/* SUCCESS MODAL */}
      {/* =========================================================== */}

      {isSuccessOpen && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-[#002b5c]/60
            p-6
            backdrop-blur-sm
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="service-request-success-title"
        >
          <div
            className="
              relative
              w-full
              max-w-md
              overflow-hidden
              rounded-3xl
              bg-white
              p-8
              text-center
              shadow-2xl
              sm:p-10
            "
          >
            {/* Close */}
            <button
              type="button"
              onClick={() => setIsSuccessOpen(false)}
              aria-label="Close success message"
              className="
                absolute
                right-4
                top-4
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                text-gray-400
                transition-colors
                hover:bg-gray-100
                hover:text-gray-700
              "
            >
              <X className="h-4 w-4" />
            </button>

            {/* Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>

            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              Request Submitted
            </p>

            <h3
              id="service-request-success-title"
              className="mt-2 text-2xl font-extrabold text-[#002b5c]"
            >
              Thank You!
            </h3>

            <p className="mt-4 text-sm leading-6 text-gray-500">
              Your service request has been submitted successfully.
              Our team can now review the request and determine the
              appropriate next step.
            </p>

            <Button
              type="button"
              variant="primary"
              onClick={() => setIsSuccessOpen(false)}
              className="
                mt-7
                w-full
                rounded-xl
                bg-[#002b5c]
                py-3.5
                font-bold
                text-white
                hover:bg-[#001f42]
              "
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </>
  );
}