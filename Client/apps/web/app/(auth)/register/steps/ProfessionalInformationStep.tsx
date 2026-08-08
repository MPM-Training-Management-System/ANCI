// "use client";

// import { useFormContext } from "react-hook-form";

// import {
//   Input,
//   Textarea,
// } from "@repo/ui/index";

// import type { RegisterTrainerSchema } from "@/hooks/schema";

// export default function ProfessionalInformationStep() {
//   const {
//     register,
//     watch,
//     formState: { errors },
//   } = useFormContext<RegisterTrainerSchema>();

//   const biography = watch("biography") ?? "";

//   return (
//     <div className="space-y-8">
//       {/* Header */}
//       <div>
//         <h2 className="text-2xl font-semibold text-slate-900">
//           Professional Information
//         </h2>

//         <p className="mt-2 text-sm text-slate-500">
//           Tell us about your professional background and expertise.
//         </p>
//       </div>

//       {/* Expertise */}
//       <div className="space-y-2">
//         <label className="text-sm font-medium text-slate-700">
//           Area of Expertise
//         </label>

//         <Input
//           placeholder="e.g. Web Development, Cybersecurity"
//           {...register("expertise")}
//         />

//         {errors.expertise && (
//           <p className="text-sm text-red-500">
//             {errors.expertise.message}
//           </p>
//         )}
//       </div>

//       {/* Years + Organization */}
//       <div className="grid gap-5 md:grid-cols-2">
//         <div className="space-y-2">
//           <label className="text-sm font-medium text-slate-700">
//             Years of Experience
//           </label>

//           <Input
//             type="number"
//             min={0}
//             placeholder="0"
//             {...register("yearsOfExperience", {
//               valueAsNumber: true,
//             })}
//           />

//           {errors.yearsOfExperience && (
//             <p className="text-sm text-red-500">
//               {errors.yearsOfExperience.message}
//             </p>
//           )}
//         </div>

//         <div className="space-y-2">
//           <label className="text-sm font-medium text-slate-700">
//             Organization
//           </label>

//           <Input
//             placeholder="Current organization"
//             {...register("organization")}
//           />

//           {errors.organization && (
//             <p className="text-sm text-red-500">
//               {errors.organization.message}
//             </p>
//           )}
//         </div>
//       </div>

//       {/* Biography */}
//       <div className="space-y-2">
//         <label className="text-sm font-medium text-slate-700">
//           Professional Biography
//         </label>

//         <Textarea
//           rows={6}
//           maxLength={500}
//           placeholder="Write a short professional biography..."
//           {...register("biography")}
//         />

//         <div className="flex items-center justify-between">
//           <div>
//             {errors.biography && (
//               <p className="text-sm text-red-500">
//                 {errors.biography.message}
//               </p>
//             )}
//           </div>

//           <span className="text-xs text-slate-500">
//             {biography.length}/500
//           </span>
//         </div>
//       </div>

//       {/* Info Card */}
//       <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
//         <h4 className="font-semibold text-blue-900">
//           Trainer Profile
//         </h4>

//         <p className="mt-2 text-sm leading-6 text-blue-700">
//           The information provided here will be displayed
//           on your trainer profile and may be viewed by
//           administrators and trainees during training
//           assignments.
//         </p>
//       </div>
//     </div>
//   );
// }