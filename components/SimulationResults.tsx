"use client";

import { useState } from "react";
import { Info, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface Variant {
  id: string;
  text: string;
  score: number;
  isOriginal?: boolean;
}

interface SimulationResultsProps {
  prediction: number;
  lowerEstimate: number;
  upperEstimate: number;
  variants: Variant[];
  insights: string;
  onGenerateVariants: (instructions?: string) => void;
}

export function SimulationResults({
  prediction,
  lowerEstimate,
  upperEstimate,
  variants,
  insights,
  onGenerateVariants,
}: SimulationResultsProps) {
  const [instructions, setInstructions] = useState("");

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      {/* Prediction Card */}
      <Card className="bg-card border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Prediction</h3>
          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
        </div>
        <div className="mb-6">
          <p className="text-3xl font-bold text-foreground">{prediction} Reactions</p>
        </div>
        <div className="relative h-12">
          {/* Track */}
          <div className="absolute top-6 left-0 right-0 h-1 bg-muted rounded-full" />
          
          {/* Lower Estimate Marker */}
          <div
            className="absolute top-6 h-4 w-0.5 bg-destructive"
            style={{ left: `${(lowerEstimate / upperEstimate) * 100}%`, transform: "translateX(-50%)" }}
          />
          <div
            className="absolute top-0 text-xs text-destructive whitespace-nowrap"
            style={{ left: `${(lowerEstimate / upperEstimate) * 100}%`, transform: "translateX(-50%)" }}
          >
            {lowerEstimate} Lower Estimate
          </div>
          
          {/* Average Marker */}
          <div
            className="absolute top-6 h-4 w-0.5 bg-foreground"
            style={{ left: `${(prediction / upperEstimate) * 100}%`, transform: "translateX(-50%)" }}
          />
          <div
            className="absolute top-0 text-xs text-foreground font-medium whitespace-nowrap"
            style={{ left: `${(prediction / upperEstimate) * 100}%`, transform: "translateX(-50%)" }}
          >
            {prediction} Average
          </div>
          
          {/* Upper Estimate Marker */}
          <div
            className="absolute top-6 right-0 h-4 w-0.5 bg-green-500"
          />
          <div
            className="absolute top-0 text-xs text-green-500 right-0 whitespace-nowrap"
          >
            {upperEstimate} Upper Estimate
          </div>
        </div>
      </Card>

      {/* Variants Card */}
      <Card className="bg-card border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Variants</h3>
          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
        </div>
        <div className="space-y-2 mb-4">
          {variants.map((variant) => (
            <div
              key={variant.id}
              className={`p-3 rounded-lg text-sm transition-colors ${
                variant.isOriginal
                  ? "bg-muted/50 border border-border"
                  : "bg-transparent hover:bg-muted/30"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-foreground flex-1 truncate">{variant.text}</p>
                <span className="text-foreground font-medium flex-shrink-0">{variant.score}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <Input
            placeholder="Add instructions... (optional)"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="bg-input/30 text-foreground placeholder:text-muted-foreground border-border"
          />
          <Button
            onClick={() => onGenerateVariants(instructions)}
            className="w-full bg-background text-foreground hover:bg-muted border border-border"
          >
            Generate New Variants
            <RefreshCw className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Insights Card */}
      <Card className="bg-card border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Insights</h3>
          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
        </div>
        <p className="text-foreground leading-relaxed">{insights}</p>
      </Card>
    </div>
  );
}

