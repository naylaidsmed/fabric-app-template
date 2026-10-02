// ✅ TIDAK PERLU DIUBAH. Diambil dari datacubeapp (dashboard/section-heading.tsx).
// Satu bagian dashboard (judul + subjudul) yang bisa dituju dari menu navigasi.

import type { ReactNode } from 'react';

export function Section({
  id,
  title,
  subtitle,
  children,
}: {
  id: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20 pt-800">
      <div className="mb-400 flex flex-wrap items-baseline gap-x-300 gap-y-100">
        <h2 id={`${id}-title`} className="font-heading text-500 font-bold leading-500">
          {title}
        </h2>
        <span className="text-300 text-muted-foreground">{subtitle}</span>
      </div>
      {children}
    </section>
  );
}
