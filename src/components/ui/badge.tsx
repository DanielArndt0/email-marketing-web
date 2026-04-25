import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type BadgeProps = HTMLAttributes<HTMLSpanElement>;

export function Badge({ className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
