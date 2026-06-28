"use client";

import * as React from "react";
import { Separator } from "@/components/ui/separator";

export type ProfileSection = "overview" | "orders" | "account" | "addresses";

export function ProfileSidebar({
  section,
  onSectionChange,
}: {
  section: ProfileSection;
  onSectionChange: (s: ProfileSection) => void;
}) {
  return (
    <div className="flex flex-col items-start gap-4">
      <nav className="flex w-full flex-col gap-2">
        <button className={`text-left w-full p-2 rounded ${section === "overview" ? "bg-accent/60" : ""}`} onClick={() => onSectionChange("overview")}>Overview</button>
        <button className={`text-left w-full p-2 rounded ${section === "orders" ? "bg-accent/60" : ""}`} onClick={() => onSectionChange("orders")}>Orders</button>
        <button className={`text-left w-full p-2 rounded ${section === "account" ? "bg-accent/60" : ""}`} onClick={() => onSectionChange("account")}>Account</button>
        <button className={`text-left w-full p-2 rounded ${section === "addresses" ? "bg-accent/60" : ""}`} onClick={() => onSectionChange("addresses")}>Addresses</button>
      </nav>

      <Separator />

      <div className="text-sm text-muted-foreground">Quick links</div>
    </div>
  );
}

export default ProfileSidebar;
