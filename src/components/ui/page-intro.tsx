type PageIntroProps = {
  title: string;
  description: string;
};

export function PageIntro({ title, description }: PageIntroProps) {
  return (
    <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-5 shadow-sm sm:p-7">
      <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-[var(--foreground)] sm:text-base">{description}</p>
    </div>
  );
}
