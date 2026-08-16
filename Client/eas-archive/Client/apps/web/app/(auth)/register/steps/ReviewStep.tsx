// "use client";

// import { useMemo } from "react";
// import { useFormContext } from "react-hook-form";

// import type { RegisterTrainerSchema } from "@/hooks/schema";

// export default function ReviewStep() {
//   const { watch } = useFormContext<RegisterTrainerSchema>();

//   const data = watch();

//   const imageUrl = useMemo(() => {
//     if (!data.profileImage) return null;

//     return URL.createObjectURL(data.profileImage);
//   }, [data.profileImage]);

//   return (
//     <div className="space-y-8">
//       <div>
//         <h2 className="text-2xl font-semibold">
//           Review Information
//         </h2>

//         <p className="mt-2 text-sm text-slate-500">
//           Please review all information before submitting your
//           trainer registration.
//         </p>
//       </div>

//       {/* Profile */}

//       <div className="flex items-center gap-5 rounded-xl border bg-slate-50 p-5">

//         <div className="h-24 w-24 overflow-hidden rounded-full border bg-white">

//           {imageUrl ? (
//             <img
//               src={imageUrl}
//               alt="Profile"
//               className="h-full w-full object-cover"
//             />
//           ) : (
//             <div className="flex h-full items-center justify-center text-sm text-slate-400">
//               No Image
//             </div>
//           )}

//         </div>

//         <div>

//           <h3 className="text-xl font-semibold">
//             {data.firstName} {data.middleName} {data.lastName}
//           </h3>

//           <p className="text-slate-500">
//             Trainer Applicant
//           </p>

//         </div>

//       </div>

//       {/* Personal */}

//       <ReviewCard
//         title="Personal Information"
//         items={[
//           ["Date of Birth", data.dateOfBirth],
//           ["Gender", data.gender],
//           ["Civil Status", data.civilStatus],
//           ["Mobile Number", data.mobileNumber],
//           ["Home Address", data.homeAddress],
//         ]}
//       />

//       {/* Account */}

//       <ReviewCard
//         title="Account Information"
//         items={[
//           ["Email", data.email],
//           ["Username", data.username],
//           ["Password", "••••••••••••"],
//         ]}
//       />

//       {/* Professional */}

//       <ReviewCard
//         title="Professional Information"
//         items={[
//           ["Expertise", data.expertise],
//           [
//             "Years of Experience",
//             `${data.yearsOfExperience} years`,
//           ],
//           ["Organization", data.organization],
//           ["Biography", data.biography],
//         ]}
//       />
//     </div>
//   );
// }

// interface ReviewCardProps {
//   title: string;
//   items: [string, string | number | undefined][];
// }

// function ReviewCard({
//   title,
//   items,
// }: ReviewCardProps) {
//   return (
//     <div className="rounded-xl border">

//       <div className="border-b bg-slate-50 px-6 py-4">

//         <h3 className="font-semibold">
//           {title}
//         </h3>

//       </div>

//       <div className="divide-y">

//         {items.map(([label, value]) => (
//           <div
//             key={label}
//             className="grid grid-cols-[180px_1fr] gap-5 px-6 py-4"
//           >
//             <span className="text-sm text-slate-500">
//               {label}
//             </span>

//             <span className="font-medium break-words">
//               {value || "-"}
//             </span>
//           </div>
//         ))}

//       </div>

//     </div>
//   );
// }