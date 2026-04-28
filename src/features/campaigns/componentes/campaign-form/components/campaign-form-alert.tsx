import { AlertTriangle } from "lucide-react";

export function CampaignFormAlert({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
