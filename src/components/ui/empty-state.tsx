type EmptyStateProps = {
  title: string;
  message: string;
};

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--border-soft)] bg-white p-8 text-center">
      <h3 className="text-lg font-semibold text-[var(--foreground)]">{title}</h3>
      <p className="mt-2 text-sm text-[var(--foreground)]">{message}</p>
    </div>
  );
}
