import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  PiArrowLeft,
  PiClock,
  PiEnvelopeSimple,
  PiMagnifyingGlass,
  PiMapPin,
  PiPhone,
  PiStarFill,
  PiStorefront,
} from 'react-icons/pi';
import { Link, useParams } from 'react-router-dom';
import { ButtonLink } from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';
import { catalogApi } from '../services/catalog';
import { formatCOP, formatDate } from '../utils/format';

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const normalize = (text: string) =>
  text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

/** HU-04.3 / HU-04.4 — ficha de un proveedor con sus precios vigentes. */
export default function ProviderDetail() {
  const { providerId } = useParams<{ providerId: string }>();
  const [q, setQ] = useState('');

  const { data: provider, isLoading, isError } = useQuery({
    queryKey: ['catalog', 'provider', providerId],
    queryFn: () => catalogApi.provider(providerId!),
    enabled: !!providerId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6" role="status">
        <span className="sr-only">Cargando proveedor…</span>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-2/3 max-w-md" />
        <Skeleton className="h-72 rounded-lg" />
      </div>
    );
  }

  if (isError || !provider) {
    return (
      <EmptyState
        icon={<PiStorefront />}
        title="No encontramos este proveedor"
        description="Puede que ya no esté en el directorio."
        action={
          <ButtonLink to="/providers?vista=proveedores" variant="secondary" icon={<PiArrowLeft aria-hidden="true" />}>
            Volver a proveedores
          </ButtonLink>
        }
      />
    );
  }

  const wanted = normalize(q.trim());
  const prices = provider.prices.filter(
    (p) => !wanted || normalize(p.name).includes(wanted) || normalize(p.category ?? '').includes(wanted)
  );

  return (
    <div className="animate-rise space-y-6">
      <Link
        to="/providers?vista=proveedores"
        className="inline-flex items-center gap-1.5 rounded text-sm font-semibold text-ink-muted transition-colors hover:text-ink"
      >
        <PiArrowLeft aria-hidden="true" className="h-4 w-4" />
        Proveedores
      </Link>

      <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="eyebrow mb-2">Proveedor</p>
          <h1 className="title-page break-words">{provider.name}</h1>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-muted">
            <li className="flex items-center gap-1.5">
              <PiMapPin aria-hidden="true" className="h-4 w-4" />
              {provider.location}
            </li>
            <li className="flex items-center gap-1.5">
              <PiStarFill aria-hidden="true" className="h-4 w-4 text-accent" />
              {provider.rating.toLocaleString('es-CO', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}{' '}
              de 5
            </li>
            {provider.deliveryTime && (
              <li className="flex items-center gap-1.5">
                <PiClock aria-hidden="true" className="h-4 w-4" />
                Entrega en {provider.deliveryTime}
              </li>
            )}
          </ul>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {provider.phone && (
            <a href={`tel:${provider.phone.replace(/\s+/g, '')}`} className="btn btn-primary">
              <PiPhone aria-hidden="true" />
              {provider.phone}
            </a>
          )}
          {provider.email && (
            <a href={`mailto:${provider.email}`} className="btn btn-secondary">
              <PiEnvelopeSimple aria-hidden="true" />
              {provider.email}
            </a>
          )}
        </div>
      </header>

      <section className="card overflow-hidden" aria-labelledby="proveedor-precios">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:px-6">
          <h2 id="proveedor-precios" className="title-section">
            Precios ({provider.prices.length})
          </h2>
          <div className="relative w-full sm:w-72">
            <PiMagnifyingGlass
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-subtle"
            />
            <input
              type="search"
              aria-label="Buscar en los precios de este proveedor"
              className="input pl-10"
              placeholder="Buscar material…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        {provider.prices.length === 0 ? (
          <EmptyState
            bare
            className="border-t border-line"
            icon={<PiStorefront />}
            title="Sin precios registrados"
            description="Este proveedor todavía no tiene precios en el catálogo."
          />
        ) : (
          <div className="overflow-x-auto border-t border-line">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Material</th>
                  <th scope="col" className="hidden sm:table-cell">
                    Categoría
                  </th>
                  <th scope="col" className="num">
                    Precio
                  </th>
                  <th scope="col" className="hidden md:table-cell">
                    Actualizado
                  </th>
                </tr>
              </thead>
              <tbody>
                {prices.map((p) => (
                  <tr key={p.materialId}>
                    <td>
                      <p className="font-semibold">{p.name}</p>
                      <p className="mt-0.5 text-xs text-ink-subtle">
                        {p.unit}
                        <span className="sm:hidden">
                          {p.category ? ` · ${capitalize(p.category)}` : ''}
                        </span>
                      </p>
                    </td>
                    <td className="hidden text-ink-muted sm:table-cell">
                      {p.category ? capitalize(p.category) : '—'}
                    </td>
                    <td className="num whitespace-nowrap font-semibold">{formatCOP(p.price)}</td>
                    <td className="hidden whitespace-nowrap text-ink-muted md:table-cell">
                      {formatDate(p.updatedAt)}
                    </td>
                  </tr>
                ))}
                {prices.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-ink-muted">
                      Ningún material coincide con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
