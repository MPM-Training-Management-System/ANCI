"use client";

import { FormEvent, useState } from "react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmitted(true);
  };

  return (
    <section
      id="contact"
      className="bg-[#f8f9ff] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left */}
          <div className="lg:col-span-5">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563eb]">
              Contact ACE NextGen
            </span>

            <h2 className="mt-3 font-[var(--font-jakarta)] text-3xl font-extrabold leading-tight text-[#0b1c30] lg:text-4xl">
              Let&apos;s discuss your training or service needs.
            </h2>

            <p className="mt-5 text-base leading-8 text-slate-600">
              Send us your inquiry and our team can assist you with training
              programs, consultancy services, mediation-related services, and
              organizational capacity-building requirements.
            </p>

            <div className="mt-9 space-y-5">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#dce9ff] text-[#2563eb]">
                  @
                </div>

                <div>
                  <p className="text-sm font-bold text-[#0b1c30]">
                    Email
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Contact ACE NextGen Consultancy Inc.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#dce9ff] text-[#2563eb]">
                  ☎
                </div>

                <div>
                  <p className="text-sm font-bold text-[#0b1c30]">
                    Contact
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Reach out for training and service inquiries.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#dce9ff] text-[#2563eb]">
                  ⌖
                </div>

                <div>
                  <p className="text-sm font-bold text-[#0b1c30]">
                    Location
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Philippines
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div
            id="apply"
            className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl sm:p-9 lg:col-span-7"
          >
            {submitted ? (
              <div className="flex min-h-[480px] flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-600">
                  ✓
                </div>

                <h3 className="mt-6 text-2xl font-extrabold text-[#0b1c30]">
                  Thank you for your inquiry.
                </h3>

                <p className="mt-3 max-w-md text-sm leading-7 text-slate-600">
                  Your message has been prepared successfully. Connect this
                  form to your backend API or email service when ready.
                </p>

                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-7 rounded-xl bg-[#002b5c] px-6 py-3 text-sm font-bold text-white"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="font-[var(--font-jakarta)] text-xl font-extrabold text-[#0b1c30]">
                    Training &amp; Service Inquiry
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Tell us what you are interested in and we can help direct
                    your inquiry.
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="mt-7 space-y-5"
                >
                  <div>
                    <label
                      htmlFor="fullName"
                      className="mb-2 block text-xs font-bold text-[#0b1c30]"
                    >
                      Full Name
                    </label>

                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      placeholder="Enter your full name"
                      className="w-full rounded-xl border border-slate-200 bg-[#f8f9ff] px-4 py-3 text-sm outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-xs font-bold text-[#0b1c30]"
                      >
                        Email Address
                      </label>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="name@example.com"
                        className="w-full rounded-xl border border-slate-200 bg-[#f8f9ff] px-4 py-3 text-sm outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="mb-2 block text-xs font-bold text-[#0b1c30]"
                      >
                        Contact Number
                      </label>

                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+63 9XX XXX XXXX"
                        className="w-full rounded-xl border border-slate-200 bg-[#f8f9ff] px-4 py-3 text-sm outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="role"
                        className="mb-2 block text-xs font-bold text-[#0b1c30]"
                      >
                        Professional Role
                      </label>

                      <select
                        id="role"
                        name="role"
                        className="w-full rounded-xl border border-slate-200 bg-[#f8f9ff] px-4 py-3 text-sm outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100"
                      >
                        <option>Participant</option>
                        <option>Trainer</option>
                        <option>Professional</option>
                        <option>Organization</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="interest"
                        className="mb-2 block text-xs font-bold text-[#0b1c30]"
                      >
                        Area of Interest
                      </label>

                      <select
                        id="interest"
                        name="interest"
                        className="w-full rounded-xl border border-slate-200 bg-[#f8f9ff] px-4 py-3 text-sm outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100"
                      >
                        <option>Training</option>
                        <option>Mediation Services</option>
                        <option>Consultancy</option>
                        <option>Capacity Building</option>
                        <option>Professional Development</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="mb-2 block text-xs font-bold text-[#0b1c30]"
                    >
                      Message
                    </label>

                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      placeholder="Tell us about your inquiry..."
                      className="w-full resize-none rounded-xl border border-slate-200 bg-[#f8f9ff] px-4 py-3 text-sm outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#002b5c] px-6 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#0d2142] hover:shadow-lg"
                  >
                    Submit Inquiry
                    <span>→</span>
                  </button>

                  <p className="text-center text-[11px] leading-5 text-slate-400">
                    This form is currently a frontend inquiry form. Connect it
                    to your backend API when you are ready.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}