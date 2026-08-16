import { TrainerRegistrationProvider } from "@/hooks/TrainerRegistrationContext";
import TrainerRegistrationStepper from "@/components/trainer-registration/TrainerRegistrationStepper";

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TrainerRegistrationProvider>
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto w-full max-w-5xl">

          

          {children}

        </div>
      </div>
    </TrainerRegistrationProvider>
  );
}