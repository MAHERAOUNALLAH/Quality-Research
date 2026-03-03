"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { EventItem } from "@/data/events";

type Props = {
  items: EventItem[];
  autoPlay?: boolean;
  interval?: number;
};

export default function EventsHeroSlider({
  items,
  autoPlay = true,
  interval = 5000,
}: Props) {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % items.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + items.length) % items.length);
  };

  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, items.length]);

  if (!items || items.length === 0) return null;

  return (
    <section className="relative w-full h-[70vh] md:h-[82vh] overflow-hidden bg-slate-900">
      {/* Slides */}
      <div className="relative h-full">
        {items.map((event, index) => {
          const isActive = index === current;

          return (
            <div
              key={event.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              {/* Background image */}
              <Image
                src={event.image}
                alt={event.title}
                fill
                priority={index === 0}
                className="object-cover"
              />

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />

              {/* Content */}
              <div className="relative z-20 h-full max-w-7xl mx-auto px-6 flex items-center">
                <div className="max-w-3xl text-white">
                  {event.category && (
                    <span className="inline-flex items-center rounded-full bg-red-600/90 px-4 py-2 text-sm font-semibold mb-4">
                      {event.category}
                    </span>
                  )}

                  {event.subtitle && (
                    <p className="text-sm md:text-base uppercase tracking-wider text-white/80 mb-3">
                      {event.subtitle}
                    </p>
                  )}

                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-5">
                    {event.title}
                  </h1>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-white/90 mb-8">
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>{event.date}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <Link
                      href={event.link}
                      className="inline-flex items-center rounded-full bg-red-600 px-6 py-3 text-sm md:text-base font-semibold hover:bg-red-700 transition"
                    >
                      Voir l’événement
                    </Link>

                    <Link
                      href="/agenda"
                      className="inline-flex items-center rounded-full border border-white/70 px-6 py-3 text-sm md:text-base font-semibold hover:bg-white hover:text-slate-900 transition"
                    >
                      Tous les événements
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Arrows */}
      {items.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Slide précédent"
            className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition"
          >
            ‹
          </button>
          <button
            onClick={nextSlide}
            aria-label="Slide suivant"
            className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition"
          >
            ›
          </button>
        </>
      )}

      {/* Dots */}
      {items.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              aria-label={`Aller au slide ${index + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                index === current ? "w-8 bg-white" : "w-2.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}