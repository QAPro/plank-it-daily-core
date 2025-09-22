
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type AvatarOption = {
  id: string;
  name: string;
  image_url: string;
  category: string;
  display_order: number;
};

interface AvatarSelectorProps {
  selectedUrl?: string | null;
  onSelect: (url: string) => void;
  className?: string;
}

const AvatarSelector = ({ selectedUrl, onSelect, className }: AvatarSelectorProps) => {
  const [options, setOptions] = useState<AvatarOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchOptions = async () => {
      console.log("Fetching avatar options...");
      const { data, error } = await supabase
        .from("avatar_options")
        .select("*")
        .order("display_order", { ascending: true });

      if (!mounted) return;

      if (error) {
        console.error("Failed to load avatar options", error);
        setOptions([]);
      } else {
        setOptions(data || []);
      }
      setLoading(false);
    };

    fetchOptions();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className={cn("grid grid-cols-4 gap-3", className)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="w-16 h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!options.length) {
    return <div className={cn("text-sm text-muted-foreground", className)}>No avatar options available.</div>;
  }

  return (
    <div className={cn("grid grid-cols-4 sm:grid-cols-6 gap-3", className)}>
      {options.map((opt) => {
        const isSelected = opt.image_url === selectedUrl;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt.image_url)}
            className={cn(
              "relative rounded-lg overflow-hidden border transition focus:outline-none focus:ring-2 focus:ring-primary",
              isSelected ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/60"
            )}
            aria-pressed={isSelected}
            aria-label={`Select avatar: ${opt.name}`}
          >
            <img
              src={opt.image_url}
              alt={opt.name}
              className="w-16 h-16 object-cover"
              loading="lazy"
            />
            {isSelected && (
              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                <Check className="w-6 h-6 text-primary" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default AvatarSelector;
