"use client"


import { ArrowDown, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@repo/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@repo/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useState, useRef, useCallback } from "react";
import { type CarouselApi } from "@repo/ui/carousel";

const slides = [
  {
    badge: "Peace & Mediation",
    title: "Advancing",
    highlight: "Peace & Harmony",
    subtitle: "Through Professional Dispute Resolution",
    description: "Master Peace Mediators promoting dialogue, reconciliation, and restorative practices across government, religious, and private sectors.",
    image: "linear-gradient(135deg, hsl(220 60% 12%) 0%, hsl(220 50% 22%) 50%, hsl(38 85% 45% / 0.3) 100%)",
  },
  {
    badge: "Leadership Excellence",
    title: "Building",
    highlight: "Tomorrow's Leaders",
    subtitle: "Through Capacity Development",
    description: "Empowering institutions with governance, ethics, and leadership training for sustainable organizational growth.",
    image: "linear-gradient(135deg, hsl(220 55% 15%) 0%, hsl(38 70% 35%) 50%, hsl(220 60% 25%) 100%)",
  },
  {
    badge: "Sports Development",
    title: "Championing",
    highlight: "Sports Excellence",
    subtitle: "Roll Ball & Skate Ball in Southeast Asia",
    description: "Instilling discipline, teamwork, and national pride through innovative sports programs for the youth.",
    image: "linear-gradient(135deg, hsl(150 25% 20%) 0%, hsl(220 50% 20%) 50%, hsl(38 85% 40% / 0.4) 100%)",
  },
];

const Hero = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));

  useEffect(() => {
    if (!api) return;
    
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  const scrollTo = useCallback((index: number) => {
    api?.scrollTo(index);
  }, [api]);

  return (
    <section id="home" className="relative min-h-screen overflow-hidden">
      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        className="w-full h-screen"
        opts={{ loop: true }}
      >
        <CarouselContent className="h-screen ml-0">
          {slides.map((slide, index) => (
            <CarouselItem key={index} className="h-screen pl-0">
              <div
                className="relative w-full h-full flex items-center justify-center"
                style={{ background: slide.image }}
              >
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-accent/10 blur-3xl animate-pulse" />
                  <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] rounded-full bg-gold-light/10 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-primary-foreground/5" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-primary-foreground/5" />
                </div>

                {/* Content */}
                <div className="container mx-auto px-4 lg:px-8 relative z-10">
                  <div className="max-w-5xl mx-auto text-center">
                    {/* Badge */}
                    <div 
                      className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10 mb-8"
                      key={`badge-${index}`}
                    >
                      <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                      <span className="text-sm font-medium text-surface tracking-wide">
                        {slide.badge}
                      </span>
                    </div>

                    {/* Main Heading */}
                    <div className="space-y-2 mb-6">
                      <p className="text-lg md:text-xl text-surface/80 font-light tracking-widest uppercase">
                        {slide.title}
                      </p>
                      <h1 className="font-display text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-primary-foreground leading-none">
                        <span className="text-warning">{slide.highlight}</span>
                      </h1>
                      <p className="text-xl md:text-2xl text-surface/80 font-light">
                        {slide.subtitle}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-base md:text-lg text-surface/70 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
                      {slide.description}
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <Button 
                        size="lg" 
                        className="group bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-8 py-6 text-base shadow-elevated rounded-full"
                      >
                        Explore Our Services
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                      <Button 
                        size="lg" 
                        variant="outline"
                        className="border-primary-foreground/20 text-surface hover:bg-primary-foreground/10 font-medium px-8 py-6 hover:text-primary rounded-full backdrop-blur-sm"
                      >
                        Learn About Us
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 z-20">
          {/* Previous Button */}
          <button
            onClick={() => api?.scrollPrev()}
            className="w-12 h-12 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/20 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`transition-all duration-300 ${
                  current === index 
                    ? "w-10 h-3 bg-accent rounded-full" 
                    : "w-3 h-3 bg-primary-foreground/30 rounded-full hover:bg-primary-foreground/50"
                }`}
              />
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={() => api?.scrollNext()}
            className="w-12 h-12 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/20 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Scroll Indicator */}
        <a 
          href="#about" 
          className="absolute bottom-8 right-8 flex flex-col items-center gap-2 text-primary-foreground/60 hover:text-primary-foreground transition-colors z-20"
        >
          <span className="text-xs font-medium tracking-widest uppercase rotate-90 origin-center translate-x-8">Scroll</span>
          <ArrowDown className="w-5 h-5 animate-bounce" />
        </a>
      </Carousel>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
    </section>
  );
};

export default Hero;