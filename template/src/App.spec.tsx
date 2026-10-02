// ✅ REPLACE src/App.spec.tsx in your project with this file.
// The template's default test checks the Welcome page; once App.tsx is switched to
// the Dashboard, that test fails — and `npm test` is one of the deploy checks.
// This test makes sure the dashboard renders with data from data.ts.
//
// Plotly needs a real browser to draw, so in tests each chart is replaced by an
// empty box with the same label (aria-label).

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
    // One card per <ChartCard>; each chart has role="img" once its data is ready.
    const card = await screen.findByRole('region', { name: 'Monthly Revenue Trend' });
    expect(await within(card).findByRole('img')).toBeInTheDocument();
    expect(await screen.findAllByRole('img')).not.toHaveLength(0);
  });
});
