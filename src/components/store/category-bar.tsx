"use client";

import * as React from "react";
import { SlidersHorizontal } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

export type SortOption =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "rating";

interface CategoryBarProps {
  categories: Category[];
  selected: string;
  onSelect: (slug: string) => void;
  sortBy: string;
  onSortChange: (s: SortOption) => void;
}

const sortLabels: Record<SortOption, string> = {
  newest: "Newest",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  rating: "Top Rated",
};

export function CategoryBar({
  categories,
  selected,
  onSelect,
  sortBy,
  onSortChange,
}: CategoryBarProps) {
  const pills = [{ slug: "all", name: "All" }, ...categories];

  return (
    <div className="sticky top-16 z-30 -mx-4 mb-2 border-b bg-background/95 px-4 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 sm:mx-0 sm:rounded-lg sm:border sm:px-3">
      <div className="flex items-center gap-3">
        {/* Horizontal scrollable pills */}
        <div
          className="flex flex-1 items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Filter by category"
        >
          {pills.map((p) => {
            const isActive = selected === p.slug;
            return (
              <button
                key={p.slug}
                role="tab"
                aria-selected={isActive}
                onClick={() => onSelect(p.slug)}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center rounded-full border px-4 text-sm font-medium transition-colors",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-accent"
                )}
              >
                {p.name}
              </button>
            );
          })}
        </div>

        {/* Sort dropdown */}
        <div className="flex shrink-0 items-center gap-2">
          <SlidersHorizontal className="hidden size-4 text-muted-foreground sm:block" />
          <Select
            value={sortBy}
            onValueChange={(v) => onSortChange(v as SortOption)}
          >
            <SelectTrigger
              size="sm"
              className="h-9 w-[160px] sm:w-[200px]"
              aria-label="Sort products"
            >
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent align="end">
              {(Object.keys(sortLabels) as SortOption[]).map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {sortLabels[opt]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
