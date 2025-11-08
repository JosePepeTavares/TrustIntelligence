"use client";

import { useState } from "react";
import Image from "next/image";
import { Settings, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { filterOptions } from "@/components/CountryFilter";
import { cn } from "@/lib/utils";

interface SidebarProps {
  selectedFactors: string[];
  onSimulationFactorChange: (value: "all" | "custom") => void;
  simulationFactorMode: "all" | "custom";
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onToggleFactor: (factorName: string) => void;
}

export function Sidebar({ selectedFactors, onSimulationFactorChange, simulationFactorMode, isCollapsed, onToggleCollapse, onToggleFactor }: SidebarProps) {
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  
  // Determine the display value
  // Show "all" if mode is "all" OR if all factors are selected
  // Show "custom" if mode is "custom" and not all factors are selected
  const displayValue = simulationFactorMode === "all" || selectedFactors.length === filterOptions.length
    ? "all" 
    : "custom";
  return (
    <div className={cn(
      "flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 relative",
      isCollapsed ? "w-16 px-2 py-6" : "w-64 px-4 py-6"
    )}>
      {/* Collapse/Expand Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm hover:bg-sidebar-accent transition-colors"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* Logo */}
      <div className={cn("mb-8 flex items-center gap-2", isCollapsed && "justify-center")}>
        <div className="relative h-8 w-8 flex-shrink-0">
          <Image
            src="/Trust.svg"
            alt="Trust Intelligence"
            fill
            className="object-contain"
          />
        </div>
        {!isCollapsed && (
          <span className="text-lg font-semibold text-sidebar-foreground">
            Trust Intelligence
          </span>
        )}
      </div>

      {!isCollapsed && (
        <>
          {/* Current Simulation */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-sidebar-foreground">
              Current Simulation
            </label>
            <Select defaultValue="linkedin-post">
              <SelectTrigger className="w-full bg-input/30 text-white">
                <SelectValue placeholder="Select simulation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linkedin-post">LinkedIn Post</SelectItem>
                <SelectItem 
                  value="ai-prompt" 
                  disabled
                  className="opacity-70"
                >
                  <div className="flex items-center gap-2 w-full">
                    <span>AI Prompt</span>
                    <Badge 
                      variant="outline" 
                      className="ml-auto rounded-full px-2.5 py-0.5 text-[10px] font-medium border-white/30 text-white/70 bg-white/10"
                    >
                      Future
                    </Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Simulation Factors */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-sidebar-foreground">
              Simulation factors
            </label>
            <Select 
              value={displayValue}
              open={isSelectOpen}
              onOpenChange={setIsSelectOpen}
              onValueChange={(value) => {
                onSimulationFactorChange(value as "all" | "custom");
                setIsSelectOpen(false);
              }}
            >
              <SelectTrigger className="w-full bg-input/30 text-white">
                <SelectValue placeholder="Select factors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Factors Sub-menu */}
          {simulationFactorMode === "custom" && (
            <div className="mb-6 rounded-lg bg-input/20 p-3 border border-white/10">
              <label className="mb-3 block text-xs font-medium text-sidebar-foreground/80 uppercase tracking-wide">
                Select Factors
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]">
                {filterOptions
                  .map((option, index) => ({ option, index }))
                  .sort((a, b) => {
                    const aSelected = selectedFactors.includes(a.option.name);
                    const bSelected = selectedFactors.includes(b.option.name);
                    // Selected factors come first
                    if (aSelected && !bSelected) return -1;
                    if (!aSelected && bSelected) return 1;
                    // Maintain original order within each group
                    return a.index - b.index;
                  })
                  .map(({ option }) => {
                    const isChecked = selectedFactors.includes(option.name);
                    return (
                      <div key={option.name} className="flex items-center space-x-2">
                        <Checkbox
                          id={`factor-${option.name}`}
                          checked={isChecked}
                          onCheckedChange={() => onToggleFactor(option.name)}
                          className="border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-background data-[state=checked]:border-white"
                        />
                        <Label
                          htmlFor={`factor-${option.name}`}
                          className="text-sm text-sidebar-foreground cursor-pointer flex items-center gap-2 font-normal"
                        >
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: option.color }}
                          />
                          {option.name}
                        </Label>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* New Simulation Button */}
          <div className="mb-6">
            <Button
              className="w-full bg-white text-background hover:bg-white/90 font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Simulation
            </Button>
          </div>

          {/* Recent */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-sidebar-foreground">
              Recent
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <button className="w-full text-left px-3 py-2 rounded-lg bg-input/30 text-sidebar-foreground hover:bg-input/50 transition-colors text-sm">
                AI crash course for AEC
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg bg-input/30 text-sidebar-foreground hover:bg-input/50 transition-colors text-sm">
                First client sale today
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg bg-input/30 text-sidebar-foreground hover:bg-input/50 transition-colors text-sm">
                LinkedIn Post - Q4 Results
              </button>
            </div>
          </div>
        </>
      )}

      {/* User Profile at Bottom */}
      <div className="mt-auto">
        <div className={cn(
          "flex items-center rounded-lg bg-white/5 p-3 hover:bg-white/10 transition-colors",
          isCollapsed ? "justify-center" : "gap-3"
        )}>
          <Avatar className="h-10 w-10 rounded-lg flex-shrink-0">
            <AvatarFallback className="rounded-lg bg-gradient-to-br from-purple-500 to-blue-400 text-white font-semibold">
              PT
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">
                  Pepe Tavares
                </p>
                <p className="text-xs text-sidebar-foreground/60">
                  Free
                </p>
              </div>
              <button className="p-1.5 rounded hover:bg-white/10 transition-colors">
                <Settings className="h-4 w-4 text-sidebar-foreground/60" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

