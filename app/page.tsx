"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { CountryFilter, filterOptions } from "@/components/CountryFilter";
import { NetworkGraph } from "@/components/NetworkGraph";
import { PostInput } from "@/components/PostInput";
import { SimulationResults } from "@/components/SimulationResults";

interface Variant {
  id: string;
  text: string;
  score: number;
  isOriginal?: boolean;
}

export default function Home() {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [simulationFactorMode, setSimulationFactorMode] = useState<"all" | "custom">("all");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [simulationResults, setSimulationResults] = useState<{
    prediction: number;
    lowerEstimate: number;
    upperEstimate: number;
    variants: Variant[];
    insights: string;
    scores: Record<string, number>;
  } | null>(null);

  // When mode is "all", select all factors
  useEffect(() => {
    if (simulationFactorMode === "all") {
      setSelectedCountries(filterOptions.map((opt) => opt.name));
    }
  }, [simulationFactorMode]);

  const handleToggleCountry = (country: string) => {
    setSelectedCountries((prev) => {
      const newSelection = prev.includes(country)
        ? prev.filter((c) => c !== country)
        : [...prev, country];
      
      // If all factors are selected or none are selected, switch to "all" mode
      // Otherwise, switch to "custom" mode
      if (newSelection.length === filterOptions.length || newSelection.length === 0) {
        setSimulationFactorMode("all");
      } else {
        setSimulationFactorMode("custom");
      }
      
      return newSelection;
    });
  };

  const handleToggleFactor = useCallback((factorName: string) => {
    setSelectedCountries((prev) => {
      const newSelection = prev.includes(factorName)
        ? prev.filter((f) => f !== factorName)
        : [...prev, factorName];
      
      // If all factors are selected or none are selected, switch to "all" mode
      // Otherwise, ensure "custom" mode
      if (newSelection.length === filterOptions.length || newSelection.length === 0) {
        setSimulationFactorMode("all");
      } else {
        setSimulationFactorMode("custom");
      }
      
      return newSelection;
    });
  }, []);

  const handleSimulationFactorChange = (value: "all" | "custom") => {
    setSimulationFactorMode(value);
    if (value === "all") {
      setSelectedCountries(filterOptions.map((opt) => opt.name));
    }
    // When switching to "custom", keep current selection
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSimulate = async (postText: string, imageFile?: File) => {
    setIsSimulating(true);
    setSimulationComplete(false);
    setSimulationResults(null);

    try {
      // Convert image to base64 if provided
      let imageBase64: string | undefined;
      let imageMimeType: string | undefined;
      
      if (imageFile) {
        imageBase64 = await fileToBase64(imageFile);
        imageMimeType = imageFile.type;
      }

      // Call the LinkedIn post evaluation API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/evaluate-linkedin-post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_text: postText,
          imageBase64,
          imageMimeType,
        }),
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // If response is not JSON, try to get text
          try {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = errorText;
            }
          } catch {
            // Use the default error message
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const result = data.result;

      // Handle case where result might be a string (if JSON parsing failed on server)
      let parsedResult = result;
      if (typeof result === 'string') {
        try {
          parsedResult = JSON.parse(result);
        } catch {
          // If it's still not JSON, use the raw result
          parsedResult = { raw: result };
        }
      }

      // Extract scores and variants from the response
      const scores = parsedResult.scores || {};
      const overallScore = parsedResult.overall_score || 0;
      // Ensure insights is a meaningful string
      const insights = parsedResult.insights 
        ? String(parsedResult.insights).trim() 
        : 'No insights available. Please try again.';
      const improvementVariants = parsedResult.improvement_variants || [];

      // Calculate estimates based on scores (simple approach)
      const scoreValues = Object.values(scores) as number[];
      const avgScore = scoreValues.length > 0
        ? scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length
        : overallScore;
      
      const prediction = Math.round(overallScore);
      const lowerEstimate = Math.max(0, Math.round(prediction * 0.5));
      const upperEstimate = Math.min(200, Math.round(prediction * 1.5));

      // Build variants array
      const variants: Variant[] = [
        {
          id: "original",
          text: postText.length > 100 ? postText.substring(0, 100) + "..." : postText,
          score: prediction,
          isOriginal: true,
        },
        ...improvementVariants.map((variant: any, index: number) => ({
          id: `variant-${index + 1}`,
          text: variant.variant_text || variant.text || '',
          score: variant.estimated_overall_score || variant.score || 0,
        })),
      ];

      setSimulationResults({
        prediction,
        lowerEstimate,
        upperEstimate,
        variants,
        insights,
        scores,
      });

      setIsSimulating(false);
      setSimulationComplete(true);
    } catch (error: any) {
      console.error('Error simulating post:', error);
      
      // Fallback to mock data on error (for development)
      const prediction = 79;
      const lowerEstimate = 43;
      const upperEstimate = 158;
      
      const variants: Variant[] = [
        {
          id: "original",
          text: postText.length > 50 ? postText.substring(0, 50) + "..." : postText,
          score: prediction,
          isOriginal: true,
        },
        {
          id: "variant-1",
          text: "Error: Could not generate variants. Please try again.",
          score: 0,
        },
      ];

      setSimulationResults({
        prediction,
        lowerEstimate,
        upperEstimate,
        variants,
        insights: `Error: ${error.message}. Please check your API connection and try again.`,
        scores: {},
      });

      setIsSimulating(false);
      setSimulationComplete(true);
    }
  };

  const handleGenerateVariants = async (instructions?: string) => {
    if (!simulationResults) return;
    
    setIsSimulating(true);
    
    // Simulate variant generation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Update variants with new ones
    const newVariants = [
      ...simulationResults.variants.filter((v) => v.isOriginal),
      {
        id: "variant-new-1",
        text: "New variant based on instructions...",
        score: 97,
      },
      {
        id: "variant-new-2",
        text: "Another optimized variant...",
        score: 96,
      },
    ];

    setSimulationResults({
      ...simulationResults,
      variants: newVariants,
    });

    setIsSimulating(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar 
        selectedFactors={selectedCountries}
        onSimulationFactorChange={handleSimulationFactorChange}
        simulationFactorMode={simulationFactorMode}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onToggleFactor={handleToggleFactor}
      />
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Top Section: Filters */}
        <div className="border-b border-border bg-background p-6">
          <CountryFilter
            selectedCountries={selectedCountries}
            onToggleCountry={handleToggleCountry}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Network Graph */}
          <div className="flex-1 overflow-hidden p-6">
            <NetworkGraph 
              selectedCountries={selectedCountries} 
              isSimulating={isSimulating}
            />
          </div>

          {/* Right: Simulation Results */}
          {simulationComplete && simulationResults && (
            <div className="w-96 border-l border-border bg-background p-6 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]">
              <SimulationResults
                prediction={simulationResults.prediction}
                lowerEstimate={simulationResults.lowerEstimate}
                upperEstimate={simulationResults.upperEstimate}
                variants={simulationResults.variants}
                insights={simulationResults.insights}
                onGenerateVariants={handleGenerateVariants}
                selectedFactors={selectedCountries}
                scores={simulationResults.scores}
              />
            </div>
          )}
        </div>

        {/* Bottom Section: Post Input */}
        <div className="border-t border-border bg-background p-4">
          <PostInput onSimulate={handleSimulate} isSimulating={isSimulating} />
        </div>
      </main>
    </div>
  );
}
