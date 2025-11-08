"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FilterOption {
  name: string;
  color: string;
}

export const filterOptions: FilterOption[] = [
  { name: "Culture", color: "#3498DB" },
  { name: "Income", color: "#E67E22" },
  { name: "Gender", color: "#E91E63" },
  { name: "Age", color: "#9C27B0" },
  { name: "Region", color: "#00BCD4" },
  { name: "Education", color: "#4CAF50" },
  { name: "Access", color: "#FF9800" },
  { name: "Language", color: "#2196F3" },
  { name: "Literacy", color: "#8BC34A" },
  { name: "Trust", color: "#F44336" },
];

interface CountryFilterProps {
  selectedCountries: string[];
  onToggleCountry: (country: string) => void;
}

export function CountryFilter({ selectedCountries, onToggleCountry }: CountryFilterProps) {
  return (
    <div className="overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="flex gap-2 min-w-max pb-2">
        {filterOptions.map((option) => {
          const isSelected = selectedCountries.includes(option.name);
          return (
            <Button
              key={option.name}
              variant="outline"
              onClick={() => onToggleCountry(option.name)}
              className={cn(
                "rounded-full border-2 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0",
                isSelected
                  ? "border-white/30 bg-white/10 text-white"
                  : "border-white/10 bg-transparent text-white/60 hover:border-white/20 hover:bg-white/5"
              )}
            >
              <span
                className="mr-2 h-2 w-2 rounded-full"
                style={{ backgroundColor: option.color }}
              />
              {option.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

