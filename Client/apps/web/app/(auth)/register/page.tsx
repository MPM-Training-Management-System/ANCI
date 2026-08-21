import { Suspense } from "react";

import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-sm text-muted-foreground">
            Loading registration...
          </div>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}