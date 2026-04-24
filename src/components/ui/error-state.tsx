import { texts } from "@/lib/config/texts";

type ErrorStateProps = {
  title?: string;
  message: string;
};

export function ErrorState({ title = texts.common.error, message }: ErrorStateProps) {
  return (
    <div className="rounded-xl border border-[#d8c7de] bg-[#f8f3fa] p-4 text-sm text-[var(--foreground)]" role="alert">
      <p className="font-semibold">{title}</p>
      <p className="mt-1">{message}</p>
    </div>
  );
}
