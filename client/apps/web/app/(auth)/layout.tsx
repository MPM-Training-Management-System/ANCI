import Image from "next/image";
import Logo from "@/assets/image/ANCILOGO.png";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>

              {children}
    </main>
  );
}