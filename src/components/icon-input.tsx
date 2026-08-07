import type { ComponentProps, ComponentType } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface IconInputProps extends ComponentProps<typeof Input> {
  icon: ComponentType<{ className?: string }>;
}

export function IconInput({ icon: Icon, className, ...props }: IconInputProps) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input className={cn("pl-8", className)} {...props} />
    </div>
  );
}
