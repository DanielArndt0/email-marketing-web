export type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="app-eyebrow">{eyebrow}</p> : null}

        <h1 className="app-heading mt-2 text-3xl font-bold tracking-tight">
          {title}
        </h1>

        {description ? (
          <p className="app-muted mt-2 max-w-3xl text-sm leading-6">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
