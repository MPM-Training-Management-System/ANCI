import Image from "next/image";
import Logo from "@/assets/image/ancilogo.jpg";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen relative flex items-center justify-center p-6 lg:p-12 overflow-hidden bg-slate-50">
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-[#0d2142]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(45,212,191,0.05)_1px,transparent_0)] bg-[length:40px_40px]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        {/* LEFT SIDE */}
        <div className="hidden lg:flex flex-col justify-center text-white space-y-8 pr-12">
          <div className="flex items-center gap-5">
            <Image
              src={Logo}
              alt="Logo"
              width={50}
              height={50}
            />

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
        </div>

        {/* Right Side */}
        <div className="flex justify-center">
          {children}
        </div>
      </div>
      <footer className="absolute bottom-6 left-0 right-0 z-10 hidden lg:block">
<div className="container mx-auto px-12 flex justify-between items-center text-[10px] font-bold tracking-widest text-white/40 uppercase">
<div className="flex gap-6">
<a className="hover:text-mint-green transition-colors" href="#">Privacy Protocol</a>
<a className="hover:text-mint-green transition-colors" href="#">Terms of Governance</a>
<a className="hover:text-mint-green transition-colors" href="#">Support Link</a>
</div>
<p>© 2024 ACE NextGen. v4.2.0-Production</p>
</div>

</footer>
    </main>
  );
}