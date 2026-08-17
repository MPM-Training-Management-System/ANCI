import { Suspense } from "react";

import RegisterPageContent from "./RegisterPageContent";

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
      <RegisterPageContent />
    </Suspense>
  );
}