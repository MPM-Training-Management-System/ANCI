import { Suspense } from "react";
import VerifyOtpForm from "./VerifyOtpForm";

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
          <div className="text-sm text-slate-500">
            Loading verification...
          </div>
        </div>
      }
    >
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <div className="w-full max-w-2xl">
          <VerifyOtpForm />
        </div>
      </div>
    </Suspense>
  );
}