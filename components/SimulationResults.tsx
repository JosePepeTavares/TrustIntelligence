"use client";

import { useState } from "react";
import { Info, Copy, Download, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { filterOptions } from "@/components/CountryFilter";

interface Variant {
  id: string;
  text: string;
  score: number;
  isOriginal?: boolean;
}

interface FactorScore {
  name: string;
  score: number;
}

interface SimulationResultsProps {
  prediction: number;
  lowerEstimate: number;
  upperEstimate: number;
  variants: Variant[];
  insights: string;
  onGenerateVariants: (instructions?: string) => void;
  factorScores?: FactorScore[];
  selectedFactors?: string[];
}

export function SimulationResults({
  prediction,
  lowerEstimate,
  upperEstimate,
  variants,
  insights,
  onGenerateVariants,
  factorScores = [],
  selectedFactors = [],
}: SimulationResultsProps) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyText = async () => {
    if (selectedVariant) {
      await navigator.clipboard.writeText(selectedVariant.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadImage = () => {
    // Create a canvas or use the image element to download
    // For now, we'll create a placeholder download
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Suggested Image', canvas.width / 2, canvas.height / 2);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `variant-image-${selectedVariant?.id || 'image'}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      });
    }
  };

  const handleRemixEverything = () => {
    if (selectedVariant) {
      onGenerateVariants();
      setSelectedVariant(null);
    }
  };

  // Get factor scores, defaulting to generated scores if not provided
  const getFactorScores = (): FactorScore[] => {
    if (factorScores.length > 0) {
      return factorScores;
    }
    // Generate default scores for selected factors
    const factors = selectedFactors.length > 0 
      ? filterOptions.filter(opt => selectedFactors.includes(opt.name))
      : filterOptions;
    
    // Generate consistent mock scores based on factor name
    const generateScore = (name: string): number => {
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return Math.abs(hash % 100);
    };
    
    return factors.map(factor => ({
      name: factor.name,
      score: generateScore(factor.name), // Consistent mock score based on factor name
    }));
  };

  const evaluatedFactors = getFactorScores();

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]">
      {/* Overall Score Card */}
      <Card className="bg-card border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-foreground">Overall score</h3>
          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
        </div>
        <div className="mb-4">
          <p className="text-2xl font-bold text-foreground">{prediction}</p>
        </div>
        <div className="relative h-14">
          {/* Track with color zones */}
          <div className="absolute top-7 left-0 right-0 h-1.5 bg-muted rounded-full" />
          
          {/* Red zone (0-20) */}
          <div
            className="absolute top-7 h-1.5 bg-destructive rounded-l-full"
            style={{ left: "0%", width: "20%" }}
          />
          
          {/* Green zone (80-100) */}
          <div
            className="absolute top-7 h-1.5 bg-green-500 rounded-r-full"
            style={{ left: "80%", width: "20%" }}
          />
          
          {/* Score Marker */}
          {(() => {
            const score = Math.min(100, Math.max(0, prediction));
            const scoreColor = score < 20 ? "text-destructive" : score > 80 ? "text-green-500" : "text-foreground";
            const markerColor = score < 20 ? "bg-destructive" : score > 80 ? "bg-green-500" : "bg-foreground";
            
            return (
              <>
                <div
                  className={`absolute top-7 h-3.5 w-0.5 ${markerColor}`}
                  style={{ left: `${score}%`, transform: "translateX(-50%)" }}
                />
                <div
                  className={`absolute top-0 text-xs font-medium whitespace-nowrap ${scoreColor}`}
                  style={{ left: `${score}%`, transform: "translateX(-50%)" }}
                >
                  {score}
                </div>
              </>
            );
          })()}
          
          {/* Scale labels */}
          <div className="absolute bottom-0 left-0 text-xs text-muted-foreground">0</div>
          <div className="absolute bottom-0 right-0 text-xs text-muted-foreground">100</div>
        </div>
      </Card>

      {/* Evaluated Factors Card */}
      <Card className="bg-card border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Evaluated Factors</h3>
          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
        </div>
        <div className="space-y-2">
          {evaluatedFactors.map((factor) => {
            const factorOption = filterOptions.find(opt => opt.name === factor.name);
            const scoreColor = factor.score < 20 ? "text-destructive" : factor.score > 80 ? "text-green-500" : "text-foreground";
            
            return (
              <div
                key={factor.name}
                className="p-3 rounded-lg text-sm transition-colors bg-transparent hover:bg-muted/30"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {factorOption && (
                      <span
                        className="h-2 w-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: factorOption.color }}
                      />
                    )}
                    <p className="text-foreground truncate">{factor.name}</p>
                  </div>
                  <span className={`font-medium flex-shrink-0 ${scoreColor}`}>{factor.score}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Variants Card */}
      <Card className="bg-card border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Variants</h3>
        </div>
        <div className="space-y-2">
          {variants.map((variant) => (
            <div
              key={variant.id}
              className={`p-3 rounded-lg text-sm transition-colors ${
                variant.isOriginal
                  ? "bg-muted/50 border border-border"
                  : "bg-transparent hover:bg-muted/30 cursor-pointer"
              }`}
              onClick={() => !variant.isOriginal && setSelectedVariant(variant)}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-foreground flex-1 truncate">{variant.text}</p>
                <span className="text-foreground font-medium flex-shrink-0">{variant.score}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Variant Detail Dialog */}
      <Dialog open={!!selectedVariant} onOpenChange={(open) => !open && setSelectedVariant(null)}>
        <DialogContent className="max-w-3xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-foreground">Variant Preview</DialogTitle>
          </DialogHeader>
          {selectedVariant && (
            <div className="space-y-4 mt-4">
              {/* Suggested Image with Download Icon */}
              <div className="relative w-full h-64 bg-muted/30 rounded-lg overflow-hidden border border-border group">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 mx-auto bg-muted/50 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-muted-foreground">Suggested Image</p>
                  </div>
                </div>
                <button
                  onClick={handleDownloadImage}
                  className="absolute top-3 right-3 p-2 bg-background/80 hover:bg-background border border-border rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Download image"
                >
                  <Download className="h-4 w-4 text-foreground" />
                </button>
              </div>
              
              {/* Full Text with Copy Icon */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground">Full Text</h4>
                  <button
                    onClick={handleCopyText}
                    className="p-1.5 hover:bg-muted/30 rounded-lg transition-colors"
                    title="Copy text"
                  >
                    {copied ? (
                      <span className="text-xs text-green-500">Copied!</span>
                    ) : (
                      <Copy className="h-4 w-4 text-foreground" />
                    )}
                  </button>
                </div>
                <div className="p-4 bg-muted/20 rounded-lg border border-border max-h-96 min-h-48 overflow-y-auto">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap break-words">{selectedVariant.text}</p>
                </div>
              </div>

              {/* Simulated Score */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-sm text-muted-foreground">Simulated Score</span>
                <span className="text-lg font-semibold text-foreground">{selectedVariant.score}</span>
              </div>
            </div>
          )}
        </DialogContent>
        {/* Remix Everything Button - Outside DialogContent */}
        {selectedVariant && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <Button
              onClick={handleRemixEverything}
              className="bg-white text-background hover:bg-white/90 font-medium shadow-lg"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Remix everything
            </Button>
          </div>
        )}
      </Dialog>

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

