"use client";

import { useEffect, useRef } from "react";
import { filterOptions } from "@/components/CountryFilter";

interface NetworkGraphProps {
  selectedCountries: string[]; // Actually contains selected factors
  isSimulating?: boolean;
}

export function NetworkGraph({ selectedCountries, isSimulating = false }: NetworkGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const nodesRef = useRef<Array<{ x: number; y: number; color: string; size: number; vx: number; vy: number }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    const initNodes = (width: number, height: number) => {
      // Get colors from selected factors
      const selectedFactorColors = filterOptions
        .filter(option => selectedCountries.length === 0 || selectedCountries.includes(option.name))
        .map(option => option.color);
      
      // If no factors selected, use all factor colors
      const availableColors = selectedFactorColors.length > 0 
        ? selectedFactorColors 
        : filterOptions.map(option => option.color);

      const nodeCount = 50;
      const nodes: Array<{ x: number; y: number; color: string; size: number; vx: number; vy: number }> = [];
      
      for (let i = 0; i < nodeCount; i++) {
        // Randomly select a color from available factor colors
        const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];
        
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          color: randomColor,
          size: i === Math.floor(nodeCount / 2) ? 8 : 4,
          vx: isSimulating ? (Math.random() - 0.5) * 0.5 : 0,
          vy: isSimulating ? (Math.random() - 0.5) * 0.5 : 0,
        });
      }
      
      nodesRef.current = nodes;
    };

    const drawGraph = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      const nodes = nodesRef.current;

      // Update node positions if simulating
      if (isSimulating) {
        // Get available colors from selected factors
        const selectedFactorColors = filterOptions
          .filter(option => selectedCountries.length === 0 || selectedCountries.includes(option.name))
          .map(option => option.color);
        
        const availableColors = selectedFactorColors.length > 0 
          ? selectedFactorColors 
          : filterOptions.map(option => option.color);

        nodes.forEach((node) => {
          node.x += node.vx;
          node.y += node.vy;
          
          // Bounce off walls
          if (node.x < 0 || node.x > width) node.vx *= -1;
          if (node.y < 0 || node.y > height) node.vy *= -1;
          
          // Keep within bounds
          node.x = Math.max(0, Math.min(width, node.x));
          node.y = Math.max(0, Math.min(height, node.y));
          
          // Occasionally update color to a random factor color (for animation effect)
          if (Math.random() < 0.01) {
            node.color = availableColors[Math.floor(Math.random() * availableColors.length)];
          }
        });
        
        // Add new nodes during simulation with factor colors
        if (nodes.length < 100 && Math.random() < 0.1) {
          const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];
          nodes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            color: randomColor,
            size: 2 + Math.random() * 3,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
          });
        }
      }

      // Draw connections
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1;
      
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const distance = Math.sqrt(
            Math.pow(nodes[i].x - nodes[j].x, 2) + Math.pow(nodes[i].y - nodes[j].y, 2)
          );
          
          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach((node, index) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        
        // Add glow effect for center node
        if (index === Math.floor(nodes.length / 2)) {
          ctx.shadowBlur = isSimulating ? 20 : 15;
          ctx.shadowColor = node.color;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });
    };

    const animate = () => {
      if (!canvas || !ctx) return;
      
      const width = canvas.width;
      const height = canvas.height;
      
      drawGraph(ctx, width, height);
      
      if (isSimulating) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    resizeCanvas();
    const width = canvas.width;
    const height = canvas.height;
    
    if (width > 0 && height > 0) {
      initNodes(width, height);
      drawGraph(ctx, width, height);
    }
    
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
      const newWidth = canvas.width;
      const newHeight = canvas.height;
      if (newWidth > 0 && newHeight > 0) {
        initNodes(newWidth, newHeight);
        drawGraph(ctx, newWidth, newHeight);
      }
    });
    resizeObserver.observe(canvas);

    if (isSimulating) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      resizeObserver.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [selectedCountries, isSimulating]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg bg-background">
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{ background: "#121212" }}
      />
    </div>
  );
}

