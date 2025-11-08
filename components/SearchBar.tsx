"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchBar() {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
      <Input
        type="search"
        placeholder="Search for someone..."
        className="w-full bg-input/30 pl-10 text-white placeholder:text-white/50"
      />
    </div>
  );
}

