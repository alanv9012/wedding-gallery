import { texts } from "@/lib/config/texts";

type LoadingStateProps = {
  title?: string;
  message: string;
};

export function LoadingState({ title = texts.common.loading, message }: LoadingStateProps) {
  return (
    <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--accent-soft)] p-4 text-sm text-[var(--foreground)]" role="status">
      <p className="font-semibold">{title}</p>
      <p className="mt-1">{message}</p>
    </div>
  );
}
