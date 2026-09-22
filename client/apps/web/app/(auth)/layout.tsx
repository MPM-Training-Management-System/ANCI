import Image from "next/image";
import Logo from "@/assets/image/ANCILOGO.png";
import AuthGuard from "@/components/auth/AuthGuard";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      <AuthGuard>
              {children}
      </AuthGuard>
    </main>
  );
}