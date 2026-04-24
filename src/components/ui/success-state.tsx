import { texts } from "@/lib/config/texts";

type SuccessStateProps = {
  title?: string;
  message: string;
};

export function SuccessState({ title = texts.common.success, message }: SuccessStateProps) {
  return (
    <div className="rounded-xl border border-[var(--border-soft)] bg-[#f4f6f1] p-4 text-sm text-[var(--foreground)]" role="status">
      <p className="font-semibold">{title}</p>
      <p className="mt-1">{message}</p>
    </div>
  );
}
