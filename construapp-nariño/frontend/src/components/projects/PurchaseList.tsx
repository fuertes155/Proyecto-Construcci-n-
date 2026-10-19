import { PiPrinter, PiShoppingCart, PiStorefront } from 'react-icons/pi';
import type { ProjectCalculation } from '../../services/projects';
import { formatCOP, formatQty } from '../../utils/format';
import Button from '../ui/Button';

interface PurchaseLine {
  name: string;
  unit: string;
  quantity: number;
  /** `null` si a alguno de los cálculos le faltó el precio de este material. */
  total: number | null;
  providers: string[];
}

/** Suma por material (mismo nombre y unidad) lo que pide cada cálculo del proyecto. */
function purchaseLines(calculations: ProjectCalculation[]): PurchaseLine[] {
  const lines = new Map<string, PurchaseLine>();
  for (const calculation of calculations) {
    for (const m of calculation.result?.materials ?? []) {
      const key = `${m.name}|${m.unit}`;
      const line = lines.get(key) ?? {
        name: m.name,
        unit: m.unit,
        quantity: 0,
        total: 0,
        providers: [],
      };
      line.quantity += m.quantity;
      line.total = line.total === null || m.totalPrice === null ? null : line.total + m.totalPrice;
      if (m.provider && !line.providers.includes(m.provider.name)) {
        line.providers.push(m.provider.name);
      }
      lines.set(key, line);
    }
  }
  // En orden alfabético, como una lista para llevar al depósito.
  return [...lines.values()].sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

/**
 * Lista de compra del proyecto: todos los materiales de sus cálculos sumados, con el
 * proveedor más económico que se encontró al guardar cada cálculo.
 */
export default function PurchaseList({ calculations }: { calculations: ProjectCalculation[] }) {
  const lines = purchaseLines(calculations);
  if (lines.length === 0) return null;
  const total = lines.reduce((sum, line) => sum + (line.total ?? 0), 0);
  const incomplete = lines.some((line) => line.total === null);

  return (
    <section className="card overflow-hidden" aria-labelledby="proyecto-compra">
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:px-6">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand-text [&>svg]:h-5 [&>svg]:w-5"
          >
            <PiShoppingCart />
          </span>
          <div>
            <h2 id="proyecto-compra" className="title-section">
              Lista de compra
            </h2>
            <p className="text-sm text-ink-muted">
              Todos los materiales de los {calculations.length} cálculos, sumados.
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={<PiPrinter aria-hidden="true" />}
          onClick={() => window.print()}
          className="print:hidden"
        >
          Imprimir
        </Button>
      </div>

      <div className="overflow-x-auto border-t border-line">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Material</th>
              <th scope="col" className="num">
                Cantidad
              </th>
              <th scope="col" className="num">
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={`${line.name}|${line.unit}`}>
                <td>
                  <p className="font-semibold">{line.name}</p>
                  <p className="mt-0.5 flex items-start gap-1 text-xs text-ink-subtle">
                    <PiStorefront aria-hidden="true" className="mt-px h-3.5 w-3.5 shrink-0" />
                    {line.providers.length > 0 ? line.providers.join(' · ') : 'Sin precio registrado'}
                  </p>
                </td>
                <td className="num">
                  <span className="font-semibold">{formatQty(line.quantity)}</span>{' '}
                  <span className="whitespace-nowrap text-ink-muted">{line.unit}</span>
                </td>
                <td className="num whitespace-nowrap font-semibold">{formatCOP(line.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-t border-line bg-surface-muted p-5 sm:px-6">
        <div>
          <p className="text-sm font-medium text-ink-muted">Total de la compra</p>
          <p className="mt-1 text-[1.75rem] font-semibold leading-none text-ink">
            {formatCOP(total)}
          </p>
        </div>
        <p className="max-w-sm text-xs text-ink-subtle sm:text-right">
          Con los precios vigentes al guardar cada cálculo
          {incomplete ? '; los materiales sin precio no suman al total' : ''}. Cantidades
          aproximadas: valídalas con un profesional antes de comprar.
        </p>
      </div>
    </section>
  );
}
