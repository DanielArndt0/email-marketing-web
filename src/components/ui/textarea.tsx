import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "app-input min-h-32 w-full rounded-xl px-3 py-2 text-sm",
        className,
      )}
      {...props}
    />
  );
}
