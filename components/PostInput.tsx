"use client";

import { useState, useRef } from "react";
import { Sparkles, Paperclip, Linkedin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface PostInputProps {
  onSimulate: (postText: string, imageFile?: File) => void;
  isSimulating?: boolean;
}

export function PostInput({ onSimulate, isSimulating = false }: PostInputProps) {
  const [postText, setPostText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSimulate = () => {
    if (postText.trim() && !isSimulating) {
      onSimulate(postText, imageFile || undefined);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
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
      {imagePreview && (
        <div className="relative inline-block">
          <img
            src={imagePreview}
            alt="Preview"
            className="max-h-32 rounded-md border border-border"
          />
          <button
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 bg-background border border-border rounded-full p-1 hover:bg-sidebar-accent"
            disabled={isSimulating}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          className="border-sidebar-border bg-input/30 text-white hover:bg-sidebar-accent"
          disabled={isSimulating}
        >
          <Linkedin className="mr-2 h-4 w-4" />
          LinkedIn Post
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
          disabled={isSimulating}
        />
        <Button
          variant="outline"
          className="border-sidebar-border bg-input/30 text-white hover:bg-sidebar-accent"
          onClick={handleUploadClick}
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

