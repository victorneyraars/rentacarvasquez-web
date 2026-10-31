interface Props {
  title: string;
  description: string;
  help?: string;
}

export default function SectionHeader({ title, description, help }: Props) {
  return (
    <div className="mb-4">
      <h2 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900">
        {title}
        {help && (
          <span
            title={help}
            className="inline-flex h-5 w-5 cursor-help items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600"
          >
            ?
          </span>
        )}
      </h2>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </div>
  );
}
