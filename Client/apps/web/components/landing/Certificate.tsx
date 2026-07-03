import Image from "next/image";
import { CheckCircle } from "lucide-react";
import { Button } from "@repo/ui/button";
import  certificate  from "@/assets/image/Certificate.png"
export default function Certification() {
  return (
    <section className="py-24 bg-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-10 grid md:grid-cols-2 gap-16 items-center">

        <div>
          <div className="bg-white p-8 shadow-2xl rounded-lg max-w-md mx-auto rotate-[-3deg]">

            <Image
              src={certificate}
              alt="Certificate"
              width={700}
              height={500}
              className="w-full h-auto"
            />

          </div>
        </div>

        <div>

          <h2 className="text-5xl font-bold mb-6">
            Global Validation of Your Expertise
          </h2>

          <p className="text-lg text-gray-600 mb-10">
            Our Certified Professional Mediator
            designation is a mark of quality.
            Each certificate includes a unique
            verification code.
          </p>

          <div className="space-y-5">

            <div className="flex items-center gap-3">
              <CheckCircle className="text-teal-700" />
              <span>IMIA & IMI Standards Aligned</span>
            </div>

            <div className="flex items-center gap-3">
              <CheckCircle className="text-teal-700" />
              <span>Instant Digital Verification Portal</span>
            </div>

          </div>

          <Button variant="primary" className="mt-10">
            Verify My Certificate
          </Button>

        </div>

      </div>
    </section>
  );
}