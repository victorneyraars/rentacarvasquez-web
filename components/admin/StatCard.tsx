interface Props {
  icon: string;
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
}

export default function StatCard({ icon, label, value, hint, href }: Props) {
  const content = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
      </div>
      <p className="mt-2 text-3xl font-extrabold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </>
  );

  const cls = `block rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 ${
    href ? 'transition-shadow hover:shadow-md' : ''
  }`;

  if (href) {
    return (
      <a href={href} className={cls}>
        {content}
      </a>
    );
  }
  return <div className={cls}>{content}</div>;
}
