export function TemplateFileFeedback({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <div className="app-alert-info mt-5 rounded-2xl px-4 py-3 text-sm">
      {message}
    </div>
  );
}
