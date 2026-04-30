import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "muted" | "flat";
};

const cardVariantClassNames: Record<
  NonNullable<CardProps["variant"]>,
  string
> = {
  default: "app-card",
  muted: "app-card-muted",
  flat: "app-card-flat",
};

export function Card({ className, variant = "default", ...props }: CardProps) {
  return (
    <div
      className={cn(cardVariantClassNames[variant], "rounded-2xl", className)}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("app-heading text-lg font-semibold", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("app-muted text-sm leading-6", className)} {...props} />
  );
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-5", className)} {...props} />;
}
