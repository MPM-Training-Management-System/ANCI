import Image, { StaticImageData } from "next/image";
import Governance from "@/assets/image/governance.jpg"
import Mediation from "@/assets/image/train.jpg"
import Sport from "@/assets/image/sport.jpg"
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@repo/ui/index";

type Service = {
  title: string;
  description: string;
  image: StaticImageData;
  badge: string;
  features: string[];
};

const services: Service[] = [
  {
    title: "Mediation & Peace",
    description:
      "Implementing structured mediation frameworks for high-stakes institutional environments to ensure sustainable harmony.",
   image:Mediation,
    badge: "Program in Action",
    features: [
      "ADR Implementation",
      "Conflict Analysis",
      "Peace Building",
    ],
  },
  {
    title: "Governance",
    description:
      "Strengthening organizational integrity through robust policy development and ethical leadership oversight.",
   image: Governance,
    badge: "Training Session",
    features: [
      "Policy Design",
      "Compliance Audits",
      "Leadership Development",
    ],
  },
  {
    title: "Sports Development",
    description:
      "Elite athletic management systems focused on character, excellence, and international talent pathways.",
    image: Sport,
    badge: "Program in Action",
    features: [
      "Youth Academies",
      "Talent Frameworks",
      "Athlete Development",
    ],
  },
];

export default function Services() {
  return (
    <section
      id="services"
      className="bg-surface py-24"
    >
      <div className="container mx-auto px-6 lg:px-12">
        {/* Heading */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="text-display-lg font-bold uppercase tracking-[0.3em] text-primary">
            Our Services
          </span>

          <h2 className="mt-4 text-display-sm font-bold text-on-surface">
            Building Institutional Excellence
          </h2>

          <p className="mt-6 text-body-lg text-on-surface-variant">
            We empower organizations through governance,
            mediation, leadership, and sports development by
            delivering sustainable and world-class solutions.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-8 lg:grid-cols-3">
          {services.map((service) => (
            <Card
              key={service.title}
              className="group relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:bg-primary"
            >
              <CardContent className="relative z-10">
                {/* Image */}
                <div className="relative mb-8 h-56 overflow-hidden rounded-2xl">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-110"
                  />

                  <div className="absolute bottom-3 left-3 rounded-full bg-primary/80 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur">
                    {service.badge}
                  </div>
                </div>

                {/* Title */}
                <CardTitle className="mb-4 transition-colors duration-300 group-hover:text-white">
                  {service.title}
                </CardTitle>

                {/* Description */}
                <CardDescription className="mb-6 leading-7 transition-colors duration-300 group-hover:text-white/80">
                  {service.description}
                </CardDescription>

                {/* Features */}
                <ul className="space-y-3">
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-body-sm transition-colors duration-300 group-hover:text-secondary"
                    >
                      <span className="h-2 w-2 rounded-full bg-secondary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>

              {/* Hover Overlay */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary via-primary to-primary/90 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}