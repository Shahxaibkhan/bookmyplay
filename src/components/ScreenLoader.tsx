'use client';

type ScreenLoaderProps = {
  show: boolean;
  headline?: string;
  subtext?: string;
};

export default function ScreenLoader({ show, headline, subtext }: ScreenLoaderProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/20 backdrop-blur-sm">
      <div className="rounded-2xl border border-emerald-100 bg-white/95 px-8 py-10 text-center shadow-2xl shadow-emerald-500/20">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center">
          <span className="h-14 w-14 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">
          {headline || 'Working on it...'}
        </h2>
        {subtext && <p className="mt-2 text-sm text-slate-600">{subtext}</p>}
      </div>
    </div>
  );
}
