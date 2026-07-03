import Image from "next/image";
import trainingImage from "../../assets/image/train.jpg";


import { Button } from "@repo/ui/button";





export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-slate-900 to-black min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">

        <div className="text-white">
          <h1 className="text-5xl font-bold mb-6">
            Advance Your Career in Professional Mediation
          </h1>
          

          <p className="text-lg text-gray-300 mb-8">
            Master the art of conflict resolution with
            institutional-grade training programs.
          </p>

          <div className="flex gap-4">
            <Button variant="primary">
              Explore Courses
            </Button>

            <Button variant="outline">
              Learn More
            </Button>
          </div>
        </div>

        <div>
          <Image
            src={trainingImage}
            alt="Hero"
            width={700}
            height={500}
            className="rounded-xl"
          />
        </div>

      </div>
    </section>
  );
}