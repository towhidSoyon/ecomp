"use client";

import * as React from "react";
import { ArrowRight, BadgeCheck, ShieldCheck, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";

interface OfferSectionProps {
  onExplore?: () => void;
}

const offers = [
  {
    title: "Free delivery over $100",
    description: "Fast and reliable shipping on every order above the free-delivery threshold.",
    icon: Truck,
  },
  {
    title: "Quality guaranteed",
    description: "Every item is hand-checked for craftsmanship and long-term value.",
    icon: ShieldCheck,
  },
  {
    title: "Easy returns",
    description: "Change your mind? Our 30-day return window makes it simple.",
    icon: BadgeCheck,
  },
];

export function OfferSection({ onExplore }: OfferSectionProps) {
  return (
    <section className="mb-8 overflow-hidden rounded-2xl border bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 p-6 text-white shadow-lg sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="space-y-4">
          <div className="inline-flex w-fit items-center rounded-full border border-white/30 bg-white/15 px-3 py-1 text-sm font-medium backdrop-blur">
            Limited-time offers
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Shop smarter with standout value and premium support.
            </h2>
            <p className="max-w-2xl text-sm text-emerald-50 sm:text-base">
              Discover flexible delivery, trusted quality, and simple returns built for a smoother shopping experience.
            </p>
          </div>
          {onExplore && (
            <Button
              variant="secondary"
              onClick={onExplore}
              className="h-11 bg-white text-emerald-700 hover:bg-emerald-50"
            >
              Explore products
              <ArrowRight className="ml-2 size-4" />
            </Button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {offers.map((offer) => {
            const Icon = offer.icon;
            return (
              <div
                key={offer.title}
                className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur"
              >
                <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-white/15">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-semibold">{offer.title}</h3>
                <p className="mt-1 text-sm text-emerald-50">{offer.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
