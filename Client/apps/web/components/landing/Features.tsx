import {
  GraduationCap,
  BadgeCheck,
  CalendarCheck,
} from "lucide-react";

export default function Features() {
  return (
    <section className="py-20 border-y">
      <div className="max-w-7xl mx-auto px-10">

        <div className="grid md:grid-cols-3 gap-12">

          <div className="flex flex-col gap-4">
            <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-teal-700" />
            </div>

            <h3 className="text-2xl font-semibold">
              Expert Mentorship
            </h3>

            <p className="text-gray-600">
              Learn from globally recognized mediators
              with decades of experience.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center">
              <BadgeCheck className="w-7 h-7 text-teal-700" />
            </div>

            <h3 className="text-2xl font-semibold">
              Recognized Certificates
            </h3>

            <p className="text-gray-600">
              Earn credentials recognized by major
              institutional bodies.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center">
              <CalendarCheck className="w-7 h-7 text-teal-700" />
            </div>

            <h3 className="text-2xl font-semibold">
              Flexible Schedules
            </h3>

            <p className="text-gray-600">
              Interactive digital training built for
              working professionals.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}