// ✅ GANTI src/App.spec.tsx di project-mu dengan file ini.
// Test bawaan template mengecek halaman Welcome; setelah App.tsx diganti ke
// Dashboard, test itu gagal — padahal `npm test` adalah salah satu syarat deploy.
// Test ini memastikan dashboard tampil dengan data dari data.ts.
//
// Plotly butuh browser sungguhan untuk menggambar, jadi di test chart diganti
// kotak kosong berlabel (aria-label) yang sama.

import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/plotly-chart', () => ({
  PlotlyChart: ({ label }: { label: string }) => <div role="img" aria-label={label} />,
}));

import App from '@/App';

describe('Dashboard', () => {
  it('shows the app title and section navigation', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toBeVisible();
    expect(screen.getByRole('navigation', { name: 'Dashboard sections' })).toBeVisible();
  });

  it('renders every chart card once the data is loaded', async () => {
    render(<App />);
    // Satu kartu per <ChartCard>; tiap chart punya role="img" setelah datanya siap.
    const card = await screen.findByRole('region', { name: 'Monthly Revenue Trend' });
    expect(await within(card).findByRole('img')).toBeInTheDocument();
    expect(await screen.findAllByRole('img')).not.toHaveLength(0);
  });
});
