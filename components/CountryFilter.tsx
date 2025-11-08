"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface FilterOption {
  name: string;
  color: string;
  description: string;
}

export const filterOptions: FilterOption[] = [
  { name: "Culture", color: "#3498DB", description: "Measures how fairly the AI treats people from different cultural and ethnic backgrounds." },
  { name: "Income", color: "#E67E22", description: "Evaluates if outcomes remain consistent across low, middle, and high income levels." },
  { name: "Gender", color: "#E91E63", description: "Checks for balanced and respectful treatment across all gender identities." },
  { name: "Age", color: "#9C27B0", description: "Tests if results are fair across different age groups and life stages." },
  { name: "Region", color: "#00BCD4", description: "Compares how location or geography affects model outcomes." },
  { name: "Education", color: "#4CAF50", description: "Looks at differences in results for people with varying education levels." },
  { name: "Access", color: "#FF9800", description: "Ensures equitable experience for users with different accessibility needs." },
  { name: "Language", color: "#2196F3", description: "Examines whether the AI performs equally well across languages and dialects." },
  { name: "Literacy", color: "#8BC34A", description: "Tests fairness across different levels of digital and informational literacy." },
  { name: "Trust", color: "#F44336", description: "Combines all factors into an overall fairness and transparency score." },
];

interface CountryFilterProps {
  selectedCountries: string[];
  onToggleCountry: (country: string) => void;
}

export function CountryFilter({ selectedCountries, onToggleCountry }: CountryFilterProps) {
  // Only show factors that are selected in the sidebar
  // Maintain the original order from filterOptions
  const visibleOptions = filterOptions.filter((option) =>
    selectedCountries.includes(option.name)
  );

  return (
    <TooltipProvider>
      <div className="overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex gap-2 min-w-max pb-2">
          {visibleOptions.map((option) => {
            const isSelected = selectedCountries.includes(option.name);
            return (
              <Tooltip key={option.name}>
                <TooltipTrigger asChild>
                  <Button
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
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{option.description}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}

