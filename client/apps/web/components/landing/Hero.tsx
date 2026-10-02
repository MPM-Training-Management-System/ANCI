"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  const changingWords = ["Training", "Mediation", "Consultancy"];
  const [activeWord, setActiveWord] = useState(0);



  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWord((current) => (current + 1) % changingWords.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  /* =========================================================
     MOUSE REACTIVE EFFECT
  ========================================================= */

  useEffect(() => {
    const hero = heroRef.current;

    if (!hero) return;

    const mediaQuery = window.matchMedia("(max-width: 1023px)");

    if (mediaQuery.matches) {
      return;
    }

    let animationFrame = 0;

    const handleMouseMove = (event: MouseEvent) => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      animationFrame = requestAnimationFrame(() => {
        const rect = hero.getBoundingClientRect();

        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;

        const mouseX = (x - 0.5) * 2;
        const mouseY = (y - 0.5) * 2;

        hero.style.setProperty("--mouse-x", mouseX.toString());
        hero.style.setProperty("--mouse-y", mouseY.toString());
      });
    };

    const handleMouseLeave = () => {
      hero.style.setProperty("--mouse-x", "0");
      hero.style.setProperty("--mouse-y", "0");
    };

    hero.addEventListener("mousemove", handleMouseMove);
    hero.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      hero.removeEventListener("mousemove", handleMouseMove);
      hero.removeEventListener("mouseleave", handleMouseLeave);

      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return (
    <section
      ref={heroRef}
      id="home"
      className="hero-section relative overflow-hidden bg-[#f7f9ff] pt-24 sm:pt-28 lg:pt-36"
    >
      {/* =========================================================
          BACKGROUND GLOWS
      ========================================================= */}

      <div className="background-glow-one pointer-events-none absolute -right-40 top-10 h-[420px] w-[420px] rounded-full bg-[#6FD1D7]/20 blur-3xl sm:h-[500px] sm:w-[500px]" />

      <div className="background-glow-two pointer-events-none absolute -left-40 bottom-0 h-[350px] w-[350px] rounded-full bg-[#3B7597]/10 blur-3xl sm:h-[420px] sm:w-[420px]" />

      {/* =========================================================
          GRID
      ========================================================= */}

      <div className="interactive-grid pointer-events-none absolute inset-0 opacity-[0.28]" />

      {/* =========================================================
          MOUSE LIGHT
      ========================================================= */}

      <div className="mouse-light pointer-events-none absolute left-1/2 top-1/2 h-[350px] w-[350px] rounded-full bg-[#6FD1D7]/10 blur-3xl" />

      {/* =========================================================
          PARTICLES
      ========================================================= */}

      <div className="hero-particle particle-one" />
      <div className="hero-particle particle-two" />
      <div className="hero-particle particle-three" />
      <div className="hero-particle particle-four" />
      <div className="hero-particle particle-five" />

      {/* =========================================================
          NETWORK LINES
      ========================================================= */}

      <svg
        className="network-lines pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1600 900"
        preserveAspectRatio="none"
      >
        <path
          d="M1080 110 C1260 180 1280 300 1450 350"
          fill="none"
          stroke="#3B7597"
          strokeOpacity="0.10"
          strokeWidth="1"
        />

        <path
          d="M1050 170 C1190 290 1300 390 1500 420"
          fill="none"
          stroke="#6FD1D7"
          strokeOpacity="0.16"
          strokeWidth="1"
        />

        <path
          d="M1040 650 C1200 570 1320 620 1510 530"
          fill="none"
          stroke="#3B7597"
          strokeOpacity="0.10"
          strokeWidth="1"
        />

        <circle
          cx="1080"
          cy="110"
          r="4"
          fill="#6FD1D7"
          fillOpacity="0.55"
        />

        <circle
          cx="1450"
          cy="350"
          r="4"
          fill="#3B7597"
          fillOpacity="0.45"
        />

        <circle
          cx="1510"
          cy="530"
          r="4"
          fill="#6FD1D7"
          fillOpacity="0.45"
        />
      </svg>

      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-5 pb-16 sm:px-6 sm:pb-20 lg:grid-cols-12 lg:gap-16 lg:px-12 lg:pb-28">
        {/* =======================================================
            LEFT CONTENT
        ======================================================= */}

        <div className="relative z-20 lg:col-span-7">
          {/* HEADING */}

          <h1 className="max-w-4xl font-[var(--font-jakarta)] text-[2.45rem] font-extrabold leading-[1.05] tracking-tight text-[#0b1c30] sm:text-5xl lg:text-6xl xl:text-7xl">
            Empowering People Through
            <span
              key={changingWords[activeWord]}
              className="hero-changing-word block text-[#2563eb]"
            >
              {changingWords[activeWord]}.
            </span>
          </h1>

          {/* DESCRIPTION */}

          <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-600 sm:mt-7 sm:text-base sm:leading-8 lg:text-lg">
            ACE NextGen Consultancy Inc. provides integrated professional
            training, mediation-related services, consultancy, and capacity
            building solutions for individuals and organizations.
          </p>

          {/* BUTTONS */}

          <div className="mt-8 flex w-full flex-col gap-3 sm:mt-9 sm:flex-row sm:w-auto">
            <Link
              href="/register"
              className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-[#002b5c] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-950/10 transition duration-300 hover:-translate-y-1 hover:bg-[#0d2142] sm:w-auto"
            >
              Get Started
              <span className="text-base">→</span>
            </Link>

            <a
              href="#programs"
              className="inline-flex min-h-[50px] w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-sm font-bold text-[#0b1c30] transition duration-300 hover:-translate-y-1 hover:border-[#2563eb] hover:text-[#2563eb] sm:w-auto"
            >
              Explore Training
            </a>
          </div>

          {/* =====================================================
              SERVICES
          ===================================================== */}

          <div className="mt-9 grid grid-cols-1 gap-5 border-t border-slate-200 pt-6 sm:mt-10 sm:grid-cols-3 sm:gap-6 sm:pt-7">
            <div>
              <p className="text-lg font-extrabold text-[#0b1c30] sm:text-xl">
                Training
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Professional Programs
              </p>
            </div>

            <div className="hidden h-8 w-px self-center bg-slate-200 sm:block" />

            <div>
              <p className="text-lg font-extrabold text-[#0b1c30] sm:text-xl">
                Mediation
              </p>

              <p className="mt-1 text-xs text-slate-500">
                ADR-Focused Services
              </p>
            </div>

            <div className="hidden h-8 w-px self-center bg-slate-200 sm:block" />

            <div>
              <p className="text-lg font-extrabold text-[#0b1c30] sm:text-xl">
                Consultancy
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Organizational Support
              </p>
            </div>
          </div>
        </div>

        {/* =======================================================
            RIGHT / PHONE
        ======================================================= */}

        <div className="relative mt-2 flex min-h-[500px] items-center justify-center sm:min-h-[570px] lg:col-span-5 lg:mt-0">
          {/* =====================================================
              ORBIT GLOW
          ===================================================== */}

          <div className="hero-orbit-glow absolute h-[290px] w-[290px] rounded-full bg-[#6FD1D7]/10 blur-3xl sm:h-[390px] sm:w-[390px]" />

          {/* =====================================================
              ORBIT
          ===================================================== */}

          <div className="interactive-orbit absolute h-[350px] w-[350px] sm:h-[470px] sm:w-[470px]">
            <div className="orbit-ring orbit-ring-one" />
            <div className="orbit-ring orbit-ring-two" />
            <div className="orbit-ring orbit-ring-three" />

            <span className="orbit-dot orbit-dot-one" />
            <span className="orbit-dot orbit-dot-two" />
            <span className="orbit-dot orbit-dot-three" />
            <span className="orbit-dot orbit-dot-four" />
          </div>

          {/* =====================================================
              PHONE
          ===================================================== */}

          <div className="hero-phone relative z-20 w-[225px] sm:w-[285px]">
            <div className="phone-frame relative rounded-[32px] border-[7px] border-[#0b192c] bg-[#0b192c] p-1.5 shadow-2xl shadow-blue-950/30 sm:rounded-[38px] sm:border-[8px] sm:p-2">
              {/* CAMERA / SPEAKER */}

              <div className="absolute left-1/2 top-1.5 z-30 h-5 w-20 -translate-x-1/2 rounded-full bg-[#0b192c] sm:top-2 sm:h-6 sm:w-24" />

              {/* SCREEN */}

              <div className="phone-screen relative min-h-[445px] overflow-hidden rounded-[24px] bg-[#f7f9ff] sm:min-h-[540px] sm:rounded-[28px]">
                {/* HEADER */}

                <div className="relative overflow-hidden bg-[#002b5c] px-4 pb-6 pt-10 text-white sm:px-5 sm:pb-7 sm:pt-12">
                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#6FD1D7]/20 blur-2xl sm:h-28 sm:w-28" />

                  <div className="relative">
                    <p className="text-[7px] font-medium uppercase tracking-[0.18em] text-[#6FD1D7] sm:text-[9px]">
                      ACE NEXTGEN
                    </p>

                    <h3 className="mt-1 text-base font-extrabold sm:text-lg">
                      Learning Hub
                    </h3>

                    <p className="mt-1 text-[8px] text-white/70 sm:text-[9px]">
                      Learn. Develop. Grow.
                    </p>
                  </div>
                </div>

                {/* PHONE BODY */}

                <div className="space-y-3 p-3 sm:space-y-4 sm:p-4">
                  {/* WELCOME */}

                  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[7px] font-medium text-slate-400 sm:text-[8px]">
                          WELCOME BACK
                        </p>

                        <p className="mt-1 text-xs font-extrabold text-[#0b1c30] sm:text-sm">
                          Continue Learning
                        </p>
                      </div>

                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6FD1D7]/20 sm:h-9 sm:w-9">
                        <span className="text-xs sm:text-sm">✦</span>
                      </div>
                    </div>

                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 sm:mt-4 sm:h-2">
                      <div className="h-full w-[68%] rounded-full bg-[#3B7597]" />
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[7px] text-slate-400 sm:text-[8px]">
                        Course progress
                      </span>

                      <span className="text-[7px] font-bold text-[#3B7597] sm:text-[8px]">
                        68%
                      </span>
                    </div>
                  </div>

                  {/* TRAINING */}

                  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-4">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#002b5c] text-white sm:h-10 sm:w-10 sm:rounded-xl">
                        <span className="text-xs sm:text-sm">▣</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[8px] font-bold text-[#0b1c30] sm:text-[10px]">
                          Professional Training
                        </p>

                        <p className="mt-0.5 text-[7px] text-slate-400 sm:text-[8px]">
                          12 learning modules
                        </p>
                      </div>

                      <span className="text-xs text-[#3B7597] sm:text-sm">
                        →
                      </span>
                    </div>
                  </div>

                  {/* UPCOMING */}

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[8px] font-extrabold uppercase tracking-wide text-[#0b1c30] sm:text-[9px]">
                        Upcoming
                      </p>

                      <span className="text-[7px] text-[#3B7597] sm:text-[8px]">
                        View all
                      </span>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm sm:rounded-2xl sm:p-3">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="flex h-8 w-8 shrink-0 flex-col items-center justify-center rounded-lg bg-[#dff7f8] sm:h-9 sm:w-9 sm:rounded-xl">
                          <span className="text-[6px] font-bold text-[#3B7597] sm:text-[7px]">
                            OCT
                          </span>

                          <span className="text-xs font-extrabold text-[#002b5c] sm:text-sm">
                            14
                          </span>
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-[8px] font-bold text-[#0b1c30] sm:text-[9px]">
                            Mediation Training
                          </p>

                          <p className="mt-0.5 text-[7px] text-slate-400 sm:text-[8px]">
                            9:00 AM • Online
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM NAV */}

                  <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 px-2 py-2.5 backdrop-blur-md sm:px-4 sm:py-3">
                    <div className="flex items-center justify-around">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[10px] text-[#002b5c] sm:text-xs">
                          ⌂
                        </span>

                        <span className="text-[6px] font-bold text-[#002b5c] sm:text-[7px]">
                          Home
                        </span>
                      </div>

                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[10px] text-slate-400 sm:text-xs">
                          ▣
                        </span>

                        <span className="text-[6px] text-slate-400 sm:text-[7px]">
                          Training
                        </span>
                      </div>

                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[10px] text-slate-400 sm:text-xs">
                          ◉
                        </span>

                        <span className="text-[6px] text-slate-400 sm:text-[7px]">
                          Attendance
                        </span>
                      </div>

                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[10px] text-slate-400 sm:text-xs">
                          ◯
                        </span>

                        <span className="text-[6px] text-slate-400 sm:text-[7px]">
                          Profile
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PHONE SHADOW */}

            <div className="phone-shadow absolute -bottom-7 left-1/2 -z-10 h-10 w-40 -translate-x-1/2 rounded-full bg-[#002b5c]/15 blur-2xl sm:-bottom-8 sm:h-12 sm:w-52" />
          </div>

          {/* =====================================================
              FLOATING CARD 1
          ===================================================== */}

          <div className="floating-info-one absolute left-0 top-16 z-30 rounded-xl border border-white/80 bg-white/90 p-3 shadow-xl backdrop-blur-md sm:left-0 sm:top-20 sm:rounded-2xl sm:p-4">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#002b5c] text-white sm:h-10 sm:w-10 sm:rounded-xl">
                <span className="text-xs sm:text-sm">✓</span>
              </div>

              <div>
                <p className="text-[8px] font-extrabold text-[#0b1c30] sm:text-[10px]">
                  Professional Training
                </p>

                <p className="mt-0.5 text-[7px] text-slate-400 sm:text-[9px]">
                  Learn &amp; develop
                </p>
              </div>
            </div>
          </div>

          {/* =====================================================
              FLOATING CARD 2
          ===================================================== */}

          <div className="floating-info-two absolute bottom-20 right-0 z-30 rounded-xl border border-white/80 bg-white/90 p-3 shadow-xl backdrop-blur-md sm:bottom-24 sm:right-0 sm:rounded-2xl sm:p-4">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#dff7f8] text-[#002b5c] sm:h-10 sm:w-10 sm:rounded-xl">
                <span className="text-xs sm:text-sm">◎</span>
              </div>

              <div>
                <p className="text-[8px] font-extrabold text-[#0b1c30] sm:text-[10px]">
                  Mediation Services
                </p>

                <p className="mt-0.5 text-[7px] text-slate-400 sm:text-[9px]">
                  ADR-focused support
                </p>
              </div>
            </div>
          </div>

          {/* =====================================================
              FLOATING DARK CARD
          ===================================================== */}

          <div className="floating-info-three absolute bottom-1 left-1/2 z-30 hidden -translate-x-1/2 rounded-xl bg-[#0b192c] px-3 py-2.5 text-white shadow-xl sm:block lg:bottom-3 lg:left-8 lg:translate-x-0 lg:px-4 lg:py-3">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6FD1D7]/20 sm:h-8 sm:w-8">
                <span className="text-xs text-[#6FD1D7]">✦</span>
              </div>

              <div>
                <p className="text-[8px] font-bold sm:text-[9px]">
                  Integrated Platform
                </p>

                <p className="mt-0.5 text-[7px] text-white/50 sm:text-[8px]">
                  Training • Services • Support
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          STYLES
      ========================================================= */}

      <style jsx>{`
        .hero-section {
          --mouse-x: 0;
          --mouse-y: 0;
        }

        /* =======================================================
           BACKGROUND
        ======================================================= */

        .background-glow-one {
          transform: translate(
            calc(var(--mouse-x) * 30px),
            calc(var(--mouse-y) * 25px)
          );
          transition: transform 0.3s ease-out;
          animation: backgroundGlow 8s ease-in-out infinite;
        }

        .background-glow-two {
          transform: translate(
            calc(var(--mouse-x) * -22px),
            calc(var(--mouse-y) * -18px)
          );
          transition: transform 0.3s ease-out;
          animation: backgroundGlowTwo 10s ease-in-out infinite;
        }

        .mouse-light {
          transform: translate(
              calc(var(--mouse-x) * 90px),
              calc(var(--mouse-y) * 70px)
            )
            translate(-50%, -50%);
          transition: transform 0.25s ease-out;
        }

        .interactive-grid {
          background-image:
            linear-gradient(
              to right,
              rgba(59, 117, 151, 0.055) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(59, 117, 151, 0.055) 1px,
              transparent 1px
            );
          background-size: 55px 55px;

          mask-image: linear-gradient(
            to bottom,
            transparent,
            black 20%,
            black 80%,
            transparent
          );

          transform: translate(
            calc(var(--mouse-x) * -5px),
            calc(var(--mouse-y) * -5px)
          );

          transition: transform 0.4s ease-out;
        }

        /* =======================================================
           CHANGING WORD
        ======================================================= */

        .hero-changing-word {
          animation: wordChange 0.6s ease both;
        }

        @keyframes wordChange {
          0% {
            opacity: 0;
            transform: translateY(18px);
            filter: blur(5px);
          }

          50% {
            opacity: 0.55;
            transform: translateY(-3px);
            filter: blur(1px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        /* =======================================================
           PARTICLES
        ======================================================= */

        .hero-particle {
          position: absolute;
          z-index: 1;
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background: #6fd1d7;
          opacity: 0.45;
          pointer-events: none;
          transition: transform 0.35s ease-out;
        }

        .particle-one {
          left: 54%;
          top: 18%;
          transform: translate(
            calc(var(--mouse-x) * 12px),
            calc(var(--mouse-y) * 10px)
          );
          animation: particleOne 5s ease-in-out infinite;
        }

        .particle-two {
          left: 67%;
          top: 35%;
          width: 4px;
          height: 4px;
          transform: translate(
            calc(var(--mouse-x) * -10px),
            calc(var(--mouse-y) * 14px)
          );
          animation: particleTwo 6s ease-in-out infinite;
        }

        .particle-three {
          left: 76%;
          top: 17%;
          width: 8px;
          height: 8px;
          opacity: 0.22;
          transform: translate(
            calc(var(--mouse-x) * 18px),
            calc(var(--mouse-y) * -12px)
          );
          animation: particleThree 7s ease-in-out infinite;
        }

        .particle-four {
          right: 12%;
          bottom: 20%;
          width: 5px;
          height: 5px;
          opacity: 0.35;
          transform: translate(
            calc(var(--mouse-x) * -14px),
            calc(var(--mouse-y) * 10px)
          );
          animation: particleFour 5.5s ease-in-out infinite;
        }

        .particle-five {
          left: 45%;
          bottom: 14%;
          width: 4px;
          height: 4px;
          opacity: 0.25;
          transform: translate(
            calc(var(--mouse-x) * 8px),
            calc(var(--mouse-y) * -10px)
          );
          animation: particleFive 6.5s ease-in-out infinite;
        }

        /* =======================================================
           NETWORK
        ======================================================= */

        .network-lines {
          transform: translate(
            calc(var(--mouse-x) * 8px),
            calc(var(--mouse-y) * 6px)
          );

          transition: transform 0.5s ease-out;
        }

        /* =======================================================
           ORBIT
        ======================================================= */

        .interactive-orbit {
          transform: translate(
            calc(var(--mouse-x) * 22px),
            calc(var(--mouse-y) * 18px)
          );

          transition: transform 0.35s ease-out;
        }

        .orbit-ring {
          position: absolute;
          left: 50%;
          top: 50%;
          border-radius: 9999px;
          border: 1px solid rgba(59, 117, 151, 0.12);
          transform: translate(-50%, -50%);
        }

        .orbit-ring-one {
          width: 270px;
          height: 270px;
          animation: orbitPulse 6s ease-in-out infinite;
        }

        .orbit-ring-two {
          width: 315px;
          height: 315px;
          border-color: rgba(111, 209, 215, 0.16);
          animation: orbitPulseTwo 8s ease-in-out infinite;
        }

        .orbit-ring-three {
          width: 350px;
          height: 350px;
          border-style: dashed;
          border-color: rgba(59, 117, 151, 0.08);
          animation: orbitRotate 30s linear infinite;
        }

        .orbit-dot {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: #6fd1d7;
          box-shadow: 0 0 0 6px rgba(111, 209, 215, 0.08);
        }

        .orbit-dot-one {
          left: 50%;
          top: 0;
          transform: translateX(-50%);
          animation: orbitDotOne 5s ease-in-out infinite;
        }

        .orbit-dot-two {
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          animation: orbitDotTwo 6s ease-in-out infinite;
        }

        .orbit-dot-three {
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          background: #3b7597;
          animation: orbitDotThree 5.5s ease-in-out infinite;
        }

        .orbit-dot-four {
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          background: #3b7597;
          animation: orbitDotFour 6.5s ease-in-out infinite;
        }

        /* =======================================================
           PHONE
        ======================================================= */

        .hero-phone {
          transform: translate(
            calc(var(--mouse-x) * 12px),
            calc(var(--mouse-y) * 10px)
          );

          transition: transform 0.35s ease-out;
          animation: phoneFloat 5s ease-in-out infinite;
        }

        .phone-screen {
          box-shadow:
            inset 0 0 0 1px rgba(255, 255, 255, 0.6),
            0 8px 30px rgba(0, 43, 92, 0.08);
        }

        .phone-shadow {
          animation: phoneShadow 5s ease-in-out infinite;
        }

        /* =======================================================
           FLOATING CARDS
        ======================================================= */

        .floating-info-one {
          transform: translate(
            calc(var(--mouse-x) * -15px),
            calc(var(--mouse-y) * -10px)
          );

          transition: transform 0.35s ease-out;
          animation: floatCardOne 5s ease-in-out infinite;
        }

        .floating-info-two {
          transform: translate(
            calc(var(--mouse-x) * 15px),
            calc(var(--mouse-y) * 12px)
          );

          transition: transform 0.35s ease-out;
          animation: floatCardTwo 6s ease-in-out infinite;
        }

        .floating-info-three {
          transform: translate(
            calc(var(--mouse-x) * -10px),
            calc(var(--mouse-y) * 8px)
          );

          transition: transform 0.35s ease-out;
          animation: floatCardThree 7s ease-in-out infinite;
        }

        /* =======================================================
           ANIMATIONS
        ======================================================= */

        @keyframes backgroundGlow {
          0%,
          100% {
            opacity: 0.7;
          }

          50% {
            opacity: 1;
          }
        }

        @keyframes backgroundGlowTwo {
          0%,
          100% {
            opacity: 0.5;
          }

          50% {
            opacity: 0.9;
          }
        }

        @keyframes particleOne {
          0%,
          100% {
            margin-top: 0;
          }

          50% {
            margin-top: -18px;
          }
        }

        @keyframes particleTwo {
          0%,
          100% {
            margin-top: 0;
          }

          50% {
            margin-top: 14px;
          }
        }

        @keyframes particleThree {
          0%,
          100% {
            margin-top: 0;
          }

          50% {
            margin-top: -22px;
          }
        }

        @keyframes particleFour {
          0%,
          100% {
            margin-top: 0;
          }

          50% {
            margin-top: 16px;
          }
        }

        @keyframes particleFive {
          0%,
          100% {
            margin-top: 0;
          }

          50% {
            margin-top: -14px;
          }
        }

        @keyframes orbitPulse {
          0%,
          100% {
            opacity: 0.65;
          }

          50% {
            opacity: 1;
          }
        }

        @keyframes orbitPulseTwo {
          0%,
          100% {
            opacity: 0.45;
          }

          50% {
            opacity: 0.9;
          }
        }

        @keyframes orbitRotate {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }

          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes orbitDotOne {
          0%,
          100% {
            transform: translateX(-50%) scale(1);
          }

          50% {
            transform: translateX(-50%) scale(1.35);
          }
        }

        @keyframes orbitDotTwo {
          0%,
          100% {
            transform: translateY(-50%) scale(1);
          }

          50% {
            transform: translateY(-50%) scale(1.35);
          }
        }

        @keyframes orbitDotThree {
          0%,
          100% {
            transform: translateX(-50%) scale(1);
          }

          50% {
            transform: translateX(-50%) scale(1.35);
          }
        }

        @keyframes orbitDotFour {
          0%,
          100% {
            transform: translateY(-50%) scale(1);
          }

          50% {
            transform: translateY(-50%) scale(1.35);
          }
        }

        @keyframes phoneFloat {
          0%,
          100% {
            margin-top: 0;
          }

          50% {
            margin-top: -12px;
          }
        }

        @keyframes phoneShadow {
          0%,
          100% {
            transform: translateX(-50%) scale(1);
            opacity: 0.45;
          }

          50% {
            transform: translateX(-50%) scale(0.85);
            opacity: 0.25;
          }
        }

        @keyframes floatCardOne {
          0%,
          100% {
            margin-top: 0;
          }

          50% {
            margin-top: -10px;
          }
        }

        @keyframes floatCardTwo {
          0%,
          100% {
            margin-top: 0;
          }

          50% {
            margin-top: 12px;
          }
        }

        @keyframes floatCardThree {
          0%,
          100% {
            margin-top: 0;
          }

          50% {
            margin-top: -8px;
          }
        }

        /* =======================================================
           TABLET
        ======================================================= */

        @media (min-width: 641px) and (max-width: 1023px) {
          .hero-phone {
            width: 270px;
            transform: none;
          }

          .interactive-orbit {
            width: 430px;
            height: 430px;
            transform: none;
          }

          .orbit-ring-one {
            width: 330px;
            height: 330px;
          }

          .orbit-ring-two {
            width: 385px;
            height: 385px;
          }

          .orbit-ring-three {
            width: 430px;
            height: 430px;
          }

          .floating-info-one {
            left: 4%;
            transform: none;
          }

          .floating-info-two {
            right: 4%;
            transform: none;
          }

          .mouse-light {
            display: none;
          }

          .network-lines {
            opacity: 0.5;
          }
        }

        /* =======================================================
           MOBILE
        ======================================================= */

        @media (max-width: 640px) {
          .hero-section {
            padding-top: 6.5rem;
          }

          .background-glow-one {
            right: -180px;
            top: 100px;
            width: 300px;
            height: 300px;
          }

          .background-glow-two {
            left: -180px;
            bottom: 50px;
            width: 280px;
            height: 280px;
          }

          .interactive-grid {
            opacity: 0.18;
            background-size: 40px 40px;
          }

          .mouse-light {
            display: none;
          }

          .network-lines {
            display: none;
          }

          .hero-particle {
            transform: none !important;
          }

          .particle-one {
            left: 15%;
            top: 12%;
          }

          .particle-two {
            left: auto;
            right: 15%;
            top: 27%;
          }

          .particle-three {
            left: auto;
            right: 8%;
            top: 55%;
          }

          .particle-four {
            right: 18%;
            bottom: 18%;
          }

          .particle-five {
            left: 12%;
            bottom: 12%;
          }

          /* PHONE AREA */

          .hero-orbit-glow {
            width: 280px;
            height: 280px;
          }

          .interactive-orbit {
            width: 340px;
            height: 340px;
            transform: none;
          }

          .orbit-ring-one {
            width: 255px;
            height: 255px;
          }

          .orbit-ring-two {
            width: 300px;
            height: 300px;
          }

          .orbit-ring-three {
            width: 340px;
            height: 340px;
          }

          .hero-phone {
            width: 220px;
            transform: none;
          }

          .floating-info-one {
            left: 0;
            top: 52px;
            transform: scale(0.82);
            transform-origin: left top;
          }

          .floating-info-two {
            right: 0;
            bottom: 62px;
            transform: scale(0.82);
            transform-origin: right bottom;
          }

          .floating-info-three {
            display: none;
          }
        }

        /* =======================================================
           EXTRA SMALL PHONES
        ======================================================= */

        @media (max-width: 380px) {
          .hero-section {
            padding-top: 6rem;
          }

          .hero-phone {
            width: 205px;
          }

          .interactive-orbit {
            width: 300px;
            height: 300px;
          }

          .orbit-ring-one {
            width: 225px;
            height: 225px;
          }

          .orbit-ring-two {
            width: 265px;
            height: 265px;
          }

          .orbit-ring-three {
            width: 300px;
            height: 300px;
          }

          .floating-info-one {
            left: -8px;
            top: 65px;
            transform: scale(0.72);
          }

          .floating-info-two {
            right: -8px;
            bottom: 65px;
            transform: scale(0.72);
          }
        }

        /* =======================================================
           REDUCED MOTION
        ======================================================= */

        @media (prefers-reduced-motion: reduce) {
          .background-glow-one,
          .background-glow-two,
          .hero-particle,
          .orbit-ring,
          .orbit-dot,
          .hero-phone,
          .phone-shadow,
          .floating-info-one,
          .floating-info-two,
          .floating-info-three,
          .hero-changing-word {
            animation: none !important;
          }

          .interactive-grid,
          .mouse-light,
          .network-lines,
          .interactive-orbit,
          .hero-phone,
          .floating-info-one,
          .floating-info-two,
          .floating-info-three {
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
}