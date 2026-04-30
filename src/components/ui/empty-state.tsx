export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="app-empty-state rounded-2xl p-10 text-center">
      <h2 className="app-heading text-lg font-semibold">{title}</h2>

      {description ? (
        <p className="app-text-muted mx-auto mt-2 max-w-2xl text-sm leading-6">
          {description}
        </p>
      ) : null}
    </div>
  );
}
