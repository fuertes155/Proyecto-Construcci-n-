import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import CalculatorPanel from './CalculatorPanel';
import { projectsApi } from '../../services/projects';
import { authReturn } from '../../utils/authReturn';
import { readCalculationDraft } from '../../utils/calculationDraft';

vi.mock('../../hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'demo' } }) }));
vi.mock('../../services/projects', () => ({
  projectsApi: {
    list: vi.fn().mockResolvedValue({ projects: [] }),
    create: vi.fn().mockResolvedValue({ id: 'new-project' }),
    addCalculation: vi.fn(),
  },
}));
const result = {
  calculatorType: 'paint' as const,
  quantity: 40,
  unit: 'm²',
  wastePct: 5,
  materials: [],
  totalCost: 100000,
  currency: 'COP' as const,
  missingPrices: [],
  timestamp: new Date().toISOString(),
};
const run = vi.fn().mockResolvedValue(result);
function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const view = render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/calculators?tipo=paint']}>
        <Routes>
          <Route
            path="/calculators"
            element={
              <CalculatorPanel
                calculatorId="paint"
                fields={[{ name: 'area', label: 'Área', unit: 'm²' }]}
                run={run}
              />
            }
          />
          <Route path="/projects/:id" element={<p>Proyecto guardado con su cálculo</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
  return { ...view, client };
}
beforeEach(() => {
  sessionStorage.clear();
  vi.clearAllMocks();
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  });
});

it('recupera medidas editadas y bloquea el resultado anterior después de salir y volver', async () => {
  const user = userEvent.setup();
  const first = mount();
  await user.type(screen.getByRole('spinbutton', { name: /Área/ }), '40');
  await user.click(screen.getByRole('button', { name: 'Calcular materiales' }));
  await screen.findByText('Total estimado');
  await user.clear(screen.getByRole('spinbutton', { name: /Área/ }));
  await user.type(screen.getByRole('spinbutton', { name: /Área/ }), '60');
  first.unmount();
  first.client.clear();
  const second = mount();
  expect(screen.getByRole('spinbutton', { name: /Área/ })).toHaveValue(60);
  expect(screen.getByText('Recuperamos tu cálculo')).toBeVisible();
  expect(screen.getByText('Las medidas cambiaron')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Crear proyecto y guardar' })).toBeDisabled();
  await user.click(screen.getByRole('button', { name: 'Limpiar medidas' }));
  expect(screen.queryByText('Total estimado')).not.toBeInTheDocument();
  second.client.clear();
});

it('crea proyecto y cálculo en una única petición y abre la obra', async () => {
  const user = userEvent.setup();
  const view = mount();
  await user.type(screen.getByRole('spinbutton', { name: /Área/ }), '40');
  await user.click(screen.getByRole('button', { name: 'Calcular materiales' }));
  await screen.findByText('Total estimado');
  await user.click(screen.getByRole('button', { name: 'Crear proyecto y guardar' }));
  await user.type(screen.getByLabelText('Nombre del proyecto'), 'Habitación de prueba');
  const buttons = screen.getAllByRole('button', { name: 'Crear proyecto y guardar' });
  await user.click(buttons[buttons.length - 1]);
  await screen.findByText('Proyecto guardado con su cálculo');
  await waitFor(() =>
    expect(projectsApi.create).toHaveBeenCalledWith({
      name: 'Habitación de prueba',
      initialCalculation: { calculatorType: 'paint', inputs: { area: 40, wastePct: 5 } },
    })
  );
  expect(projectsApi.addCalculation).not.toHaveBeenCalled();
  view.client.clear();
});

it('ignora borradores dañados y conserva solo destinos internos al autenticar', () => {
  sessionStorage.setItem('construapp:calculation-draft:v1:paint', '{mal json');
  expect(readCalculationDraft('paint')).toBeNull();
  expect(authReturn({ from: { pathname: '/calculators', search: '?tipo=paint' } })).toBe(
    '/calculators?tipo=paint'
  );
  expect(authReturn({ from: { pathname: '//sitio-ajeno.com' } })).toBe('/dashboard');
});
