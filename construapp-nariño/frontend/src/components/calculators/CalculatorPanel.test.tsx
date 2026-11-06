import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import { projectsApi } from '../../services/projects';
import type { CalculationResult } from '../../services/calculators';
import CalculatorPanel from './CalculatorPanel';

vi.mock('../../hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'owner' } }) }));
vi.mock('../../services/projects', () => ({
  projectsApi: {
    list: vi.fn().mockResolvedValue({ projects: [{ id: 'project-1', name: 'Obra de prueba' }] }),
    addCalculation: vi.fn().mockResolvedValue({}),
  },
}));

it('impide guardar un presupuesto anterior hasta recalcular las medidas modificadas', async () => {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  });
  const result: CalculationResult = {
    calculatorType: 'concrete',
    quantity: 3,
    unit: 'm³',
    wastePct: 5,
    materials: [
      {
        id: 'cement',
        role: 'cement',
        name: 'Cemento gris',
        quantity: 23,
        unit: 'saco 50 kg',
        pricePerUnit: 32000,
        totalPrice: 736000,
        currency: 'COP',
        provider: { id: 'provider', name: 'Central de Materiales Pasto' },
      },
    ],
    totalCost: 736000,
    currency: 'COP',
    missingPrices: [],
    timestamp: '2026-11-05T17:00:00Z',
  };
  const run = vi.fn().mockResolvedValue(result);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <CalculatorPanel
          calculatorId="concrete"
          fields={[
            { name: 'length', label: 'Largo', unit: 'm' },
            { name: 'width', label: 'Ancho', unit: 'm' },
            { name: 'height', label: 'Espesor', unit: 'm' },
          ]}
          run={run}
        />
      </MemoryRouter>
    </QueryClientProvider>
  );
  const user = userEvent.setup();
  await user.type(screen.getByRole('spinbutton', { name: /Largo/ }), '5');
  await user.type(screen.getByRole('spinbutton', { name: /Ancho/ }), '4');
  await user.type(screen.getByRole('spinbutton', { name: /Espesor/ }), '0.15');
  await user.click(screen.getByRole('button', { name: 'Calcular materiales' }));
  await screen.findByText('Total estimado');
  await user.selectOptions(screen.getByLabelText('Guardar en un proyecto'), 'project-1');
  const save = screen.getByRole('button', { name: 'Guardar en proyecto' });
  expect(save).toBeEnabled();
  const length = screen.getByRole('spinbutton', { name: /Largo/ });
  await user.clear(length);
  await user.type(length, '6');
  expect(await screen.findByText('Las medidas cambiaron')).toBeVisible();
  expect(save).toBeDisabled();
  await user.click(save);
  expect(projectsApi.addCalculation).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Calcular materiales' }));
  await waitFor(() => expect(screen.queryByText('Las medidas cambiaron')).not.toBeInTheDocument());
  expect(save).toBeEnabled();
  await user.click(save);
  await waitFor(() =>
    expect(projectsApi.addCalculation).toHaveBeenCalledWith('project-1', 'concrete', {
      length: 6,
      width: 4,
      height: 0.15,
      wastePct: 5,
    })
  );
  client.clear();
});
