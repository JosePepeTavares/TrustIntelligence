"use client";

import { useState } from "react";
import { Sparkles, Paperclip, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface PostInputProps {
  onSimulate: (postText: string) => void;
  isSimulating?: boolean;
}

export function PostInput({ onSimulate, isSimulating = false }: PostInputProps) {
  const [postText, setPostText] = useState("");

  const handleSimulate = () => {
    if (postText.trim() && !isSimulating) {
      onSimulate(postText);
    }
  };

  return (
    <div className="space-y-3">
      <Textarea
        placeholder="Write your post..."
        value={postText}
        onChange={(e) => setPostText(e.target.value)}
        className="min-h-20 max-h-24 w-full bg-input/30 text-white placeholder:text-white/50 resize-none"
        disabled={isSimulating}
      />
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          className="border-sidebar-border bg-input/30 text-white hover:bg-sidebar-accent"
          disabled={isSimulating}
        >
          <Linkedin className="mr-2 h-4 w-4" />
          LinkedIn Post
        </Button>
        <Button
          variant="outline"
          className="border-sidebar-border bg-input/30 text-white hover:bg-sidebar-accent"
          disabled={isSimulating}
        >
          <Paperclip className="mr-2 h-4 w-4" />
          Upload
        </Button>
        <Button
          onClick={handleSimulate}
          disabled={!postText.trim() || isSimulating}
          className="ml-auto bg-white text-background hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {isSimulating ? "Simulating..." : "Simulate"}
        </Button>
      </div>
    </div>
  );
}

