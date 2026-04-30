import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type BadgeProps = HTMLAttributes<HTMLSpanElement>;

export function Badge({ className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "app-badge inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
