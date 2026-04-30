import type { LucideIcon } from "lucide-react";

export type StatCardProps = {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
};

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="app-card rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="app-muted text-sm font-medium">{title}</p>
          <p className="app-heading mt-2 text-2xl font-bold">{value}</p>
        </div>

        <div className="app-icon-box rounded-xl p-2">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {description ? (
        <p className="app-soft mt-3 truncate text-xs">{description}</p>
      ) : null}
    </div>
  );
}
