"use client";

import { useState, useEffect } from "react";
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

  const handleToggleFactor = (factorName: string) => {
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
  };

  const handleSimulationFactorChange = (value: "all" | "custom") => {
    setSimulationFactorMode(value);
    if (value === "all") {
      setSelectedCountries(filterOptions.map((opt) => opt.name));
    }
    // When switching to "custom", keep current selection
  };

  const handleSimulate = async (postText: string) => {
    setIsSimulating(true);
    setSimulationComplete(false);
    setSimulationResults(null);

    // Simulate AI processing time (3-5 seconds)
    const simulationTime = 3000 + Math.random() * 2000;
    
    await new Promise((resolve) => setTimeout(resolve, simulationTime));

    // Generate mock results
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
        text: "After my talk at Building Green D...",
        score: 95,
      },
      {
        id: "variant-2",
        text: "Since my talk at Building Green D...",
        score: 94,
      },
      {
        id: "variant-3",
        text: "What an amazing response since...",
        score: 93,
      },
    ];

    const insights = "The post's predicted performance is decent, but not outstanding.";

    setSimulationResults({
      prediction,
      lowerEstimate,
      upperEstimate,
      variants,
      insights,
    });

    setIsSimulating(false);
    setSimulationComplete(true);
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
            <div className="w-96 border-l border-border bg-background p-6 overflow-y-auto">
              <SimulationResults
                prediction={simulationResults.prediction}
                lowerEstimate={simulationResults.lowerEstimate}
                upperEstimate={simulationResults.upperEstimate}
                variants={simulationResults.variants}
                insights={simulationResults.insights}
                onGenerateVariants={handleGenerateVariants}
              />
            </div>
          )}
        </div>

        {/* Bottom Section: Post Input */}
        <div className="border-t border-border bg-background p-6">
          <PostInput onSimulate={handleSimulate} isSimulating={isSimulating} />
        </div>
      </main>
    </div>
  );
}
