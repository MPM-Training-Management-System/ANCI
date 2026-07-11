"use client"

import Image from "next/image";
import Logo from "@/assets/image/ANCILOGO.png";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button ,ConfirmDialog, Spinner} from "@repo/ui/index";
import {  LayoutDashboard,
  BriefcaseBusiness,
  GraduationCap,
  Users,
  ClipboardCheck,
  FileBarChart,
 }  from "lucide-react";
import {  sidebarStyles } from "@repo/token";
import { auth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
  { name: "User Management", href: "/user", icon: <BriefcaseBusiness size={20} /> },
  { name: "Service Management", href: "/services", icon: <BriefcaseBusiness size={20} /> },
  { name: "Training Programs", href: "/training", icon: <GraduationCap size={20} /> },
  { name: "Participant Hub", href: "/participants", icon: <Users size={20} /> },
  { name: "Exam center", href: "/exam-center", icon: <ClipboardCheck size={20} /> },
  { name: "Reports", href: "/reports", icon: <FileBarChart size={20} /> },
];


export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
const handleLogout = async() => {
  setLoading(true);

  try{ 
     await new Promise((resolve) => setTimeout(resolve, 1500));
     auth.logout();
  router.push("/");
  }catch(error){
        console.error(error);
  }finally {
    setLoading(false);
  }
 
}
  return (
    <>

    <aside className={sidebarStyles.container}>
      
      <div className={sidebarStyles.header}>
        <Image
          src={Logo}
          alt="ACE NextGen"
          width={50}
          height={50}
          className="rounded m-2"
        />
        <h1 className={sidebarStyles.title}>ACE NextGen</h1>
      </div>

      {/* Menu Items */}
      <nav className={sidebarStyles.nav}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${sidebarStyles.item} ${
  isActive
    ? sidebarStyles.active
    : sidebarStyles.inactive
}`}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom - Logout */}
      <div className="px-4 py-4 border-t ">
        <Button  variant="primary" className="w-full flex items-center justify-center gap-2" onClick={()=> setOpen(true)} >
          {loading ?(<> 
          <Spinner size="md" className="mr-2" />
          loading....</>):(
            "Logout")}
        </Button>
      </div>
    </aside>
    <ConfirmDialog
    open={open}
    title="Logout"
    description="Are you sure you want to logout?"
    confirmText="Logout"
    cancelText="Cancel"
    onCancel={() => setOpen(false)}
    onConfirm={handleLogout}
  />
</>
  );
}
