"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Tag, Truck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeroSectionProps {
  onShopNow: () => void;
  onBrowseDeals: () => void;
}

export function HeroSection({ onShopNow, onBrowseDeals }: HeroSectionProps) {
  return (
    <section
      className="relative overflow-hidden border-b"
      aria-label="Promotional banner"
    >
      {/* Gradient background (emerald / neutral tones) */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-50 via-background to-amber-50 dark:from-emerald-950/30 dark:via-background dark:to-amber-950/20" />
      <div className="absolute inset-0 -z-10 opacity-60 [background-image:radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.18),transparent_40%),radial-gradient(circle_at_85%_80%,rgba(245,158,11,0.18),transparent_40%)]" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col gap-5"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <Badge
                variant="outline"
                className="gap-1.5 border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
              >
                <Sparkles className="size-3.5" />
                New season, new arrivals
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
            >
              Elevate Your{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-amber-500 bg-clip-text text-transparent">
                Everyday
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="max-w-prose text-pretty text-base text-muted-foreground sm:text-lg"
            >
              Discover thoughtfully curated products that blend quality, design,
              and value. From everyday essentials to standout statement pieces —
              find your next favourite at ShopFlow.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="flex flex-wrap items-center gap-3"
            >
              <Button
                size="lg"
                onClick={onShopNow}
                className="h-11 px-6 text-base"
              >
                Shop Now
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onBrowseDeals}
                className="h-11 px-6 text-base"
              >
                <Tag className="size-4" />
                Browse Deals
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-sm text-muted-foreground"
            >
              <span className="inline-flex items-center gap-1.5">
                <Truck className="size-4 text-emerald-600" />
                Free shipping over $100
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="size-4 text-amber-500" />
                30-day easy returns
              </span>
            </motion.div>
          </motion.div>

          {/* Decorative product collage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative hidden lg:block"
          >
            <div className="relative mx-auto aspect-square w-full max-w-md">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute right-0 top-4 size-44 overflow-hidden rounded-2xl border-4 border-background bg-emerald-100 shadow-xl dark:bg-emerald-950"
              >
                <img
                  src="https://sfile.chatglm.cn/images-ppt/1ec5958347df.png"
                  alt="Featured headphones"
                  className="size-full object-cover"
                />
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute left-0 top-24 size-52 overflow-hidden rounded-2xl border-4 border-background bg-amber-100 shadow-xl dark:bg-amber-950"
              >
                <img
                  src="https://sfile.chatglm.cn/images-ppt/5a628666dbbc.jpg"
                  alt="Featured smartwatch"
                  className="size-full object-cover"
                />
              </motion.div>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
                className="absolute bottom-0 right-12 size-48 overflow-hidden rounded-2xl border-4 border-background bg-neutral-100 shadow-xl dark:bg-neutral-900"
              >
                <img
                  src="https://sfile.chatglm.cn/images-ppt/867d93c44151.jpg"
                  alt="Featured sneakers"
                  className="size-full object-cover"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
