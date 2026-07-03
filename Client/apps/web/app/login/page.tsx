"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/button";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading] = useState(false);
  const router = useRouter();



   const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
  try {
    const response = await fetch(

      "https://anci-1.onrender.com/api/Auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Login failed");
      return;
    }

    localStorage.setItem("token", data.token);

    router.push("/dashboard");

  } catch (error) {
    console.error(error);
    alert("Something went wrong");
  }
};
  // const handleSubmit = async (
  //   e: React.FormEvent<HTMLFormElement>
  // ) => {
  //   e.preventDefault();

  //   setLoading(true);

  //   setTimeout(() => {
  //     setLoading(false);
  //     alert("Access Granted");
  //   }, 1800);
  // };

  return (
    <main className="min-h-screen relative flex items-center justify-center p-6 lg:p-12 overflow-hidden bg-slate-50">
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-[#0d2142]">
        {/* <Image
          // src="./train.jpg"
          alt="Background"
          fill
          className="object-cover opacity-30 mix-blend-overlay"
        /> */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(45,212,191,0.05)_1px,transparent_0)] bg-[length:40px_40px]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        {/* LEFT SIDE */}
        <div className="hidden lg:flex flex-col justify-center text-white space-y-8 pr-12">
          <div className="flex items-center gap-5">
            {/* <Image
              src="./logo.png"
              alt="Logo"
              width={60}
              height={60}
              className="brightness-0 invert"
            /> */}

            <div className="h-10 w-px bg-white/20" />

            <div>
              <h1 className="text-2xl font-bold">
                ACE NextGen
              </h1>
              <p className="text-xs uppercase tracking-[0.2em] text-teal-400">
                ISTMS Control Center
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-5xl font-bold leading-tight">
              Empowering Institutional Excellence Through
              Technical Precision.
            </h2>

            <p className="mt-6 text-lg text-white/70 max-w-lg">
              Securely access the Integrated Service &
              Training Management System.
            </p>
          </div>

          <div className="flex gap-8 pt-4">
            <span className="uppercase text-sm">
              Secure Access
            </span>

            <span className="uppercase text-sm">
              Real-Time
            </span>

            <span className="uppercase text-sm">
              Institutional
            </span>
          </div>
        </div>

        {/* LOGIN CARD */}
        <div className="flex justify-center">
          <div className="w-full max-w-md bg-white rounded-2xl p-10 shadow-2xl">
            <div className="mb-8">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-teal-700 text-xs font-bold uppercase tracking-widest">
                Secure Access Point
              </span>

              <h3 className="text-2xl font-bold text-slate-900 mt-4">
                Administrator Login
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Access your ISTMS dashboard.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
              className="space-y-6"
            >
              {/* EMAIL */}
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-slate-500 mb-2">
                  Institutional Email
                </label>

                <input
                  type="string"
                   onChange={(e) => setUsername(e.target.value)}
                   value={username}
                  placeholder="admin@acenextgen.com"
                  className="w-full px-4 py-3 bg-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-slate-500 mb-2">
                  Security Password
                </label>

                <div className="relative">
                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="••••••••"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    className="w-full px-4 py-3 bg-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-teal-400"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>
                </div>
              </div>

              {/* REMEMBER */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                />

                <label className="text-sm text-slate-600">
                  Keep session active for 30 days
                </label>
              </div>

              {/* BUTTON */}
              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                className="w-full py-4  font-bold rounded-lg hover:bg-secondary transition"
              >
                {loading
                  ? "Authenticating..."
                  : "Secure Login"}
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t text-center">
              <p className="text-[10px] uppercase tracking-widest text-slate-400">
                Authorized Personnel Only • All
                activity monitored
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}