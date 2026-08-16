// "use client";

// import { Search } from "lucide-react";
// import { Input } from "@repo/ui/index";

// import { NavbarSearchProps } from "./types";

// export default function NavbarSearch({
//   placeholder = "Search anything...",
// }: NavbarSearchProps) {
//   return (
//     <div className="relative hidden w-full max-w-md lg:block">
//       {/* Search Icon */}
//       <Search
//         size={18}
//         className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
//       />

//       {/* Search Input */}
//       <Input
//         placeholder={placeholder}
//         className="
//           h-11
//           rounded-xl
//           border-gray-200
//           bg-gray-50
//           pl-11
//           pr-16
//           shadow-sm
//           transition-all
//           focus:border-[#002B5C]
//           focus:bg-white
//           focus:ring-2
//           focus:ring-[#002B5C]/20
//         "
//       />

//       {/* Ctrl + K */}
//       <div
//         className="
//           pointer-events-none
//           absolute
//           right-3
//           top-1/2
//           -translate-y-1/2
//           rounded-md
//           border
//           border-gray-200
//           bg-white
//           px-2
//           py-0.5
//           text-[10px]
//           font-medium
//           text-gray-500
//         "
//       >
//         Ctrl K
//       </div>
//     </div>
//   );
// }