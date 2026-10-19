import { keepPreviousData, useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { Fragment, useEffect, useState } from 'react';
import {
  PiCaretDown,
  PiClock,
  PiEnvelopeSimple,
  PiMagnifyingGlass,
  PiMapPin,
  PiPackage,
  PiPhone,
  PiStarFill,
  PiStorefront,
} from 'react-icons/pi';
import { Link, useSearchParams } from 'react-router-dom';
import Alert from '../components/ui/Alert';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import SegmentedControl from '../components/ui/SegmentedControl';
import { TableSkeleton } from '../components/ui/Skeleton';
import { catalogApi, type CatalogMaterial, type CatalogProvider } from '../services/catalog';
import { formatCOP, formatDate } from '../utils/format';

type View = 'materiales' | 'proveedores';

const formatRating = (rating: number) =>
  rating.toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Primera letra en mayúscula para mostrar las categorías del catálogo. */
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export default function Providers() {
  const [params, setParams] = useSearchParams();
  const view: View = params.get('vista') === 'proveedores' ? 'proveedores' : 'materiales';

  return (
    <div className="animate-rise space-y-6">
      <PageHeader
        eyebrow="Directorio"
        title="Proveedores y precios"
        description="Compara el precio de cada material entre los proveedores locales de Nariño y encuentra a quién comprarle."
        actions={
          <SegmentedControl
            label="Ver"
            value={view}
            onChange={(next) =>
              setParams(next === 'materiales' ? {} : { vista: next }, { replace: true })
            }
            options={[
              { value: 'materiales', label: 'Materiales', icon: <PiPackage aria-hidden="true" /> },
              {
                value: 'proveedores',
                label: 'Proveedores',
                icon: <PiStorefront aria-hidden="true" />,
              },
            ]}
          />
        }
      />

      {view === 'materiales' ? <MaterialsView /> : <ProvidersView />}
    </div>
  );
}

/* ---------------------------------------------------------- materiales --- */

function MaterialsView() {
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [category, setCategory] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  // Una petición por búsqueda, no por cada tecla.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(id);
  }, [q]);

  // Las categorías salen del catálogo completo (sin filtros) para que no desaparezcan.
  const { data: everything } = useQuery({
    queryKey: ['catalog', 'materials', '', ''],
    queryFn: () => catalogApi.materials(),
  });
  const { data, isLoading, isError, isPlaceholderData, refetch } = useQuery({
    queryKey: ['catalog', 'materials', debouncedQ, category],
    queryFn: () =>
      catalogApi.materials({ q: debouncedQ || undefined, category: category || undefined }),
    placeholderData: keepPreviousData,
  });

  const categories = everything?.categories ?? [];
  const countIn = (c: string) =>
    everything?.materials.filter((m) => !c || m.category === c).length ?? 0;

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <PiMagnifyingGlass
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-subtle"
        />
        <input
          type="search"
          aria-label="Buscar materiales"
          className="input pl-10"
          placeholder="Buscar: cemento, varilla, teja…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {/* En móvil, una sola fila que se desliza; en pantallas anchas, varias filas */}
      <div
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
        role="group"
        aria-label="Filtrar por categoría"
      >
        {['', ...categories].map((c) => {
          const active = category === c;
          return (
            <button
              key={c || 'todas'}
              type="button"
              aria-pressed={active}
              onClick={() => setCategory(c)}
              className={clsx(
                'inline-flex min-h-[2.25rem] shrink-0 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold transition',
                active
                  ? 'border-ink bg-ink text-canvas'
                  : 'border-line-strong bg-surface text-ink-muted hover:border-line-control hover:text-ink'
              )}
            >
              {c ? capitalize(c) : 'Todas'}
              <span className={clsx('tabular-nums', active ? 'text-canvas/70' : 'text-ink-subtle')}>
                {countIn(c)}
              </span>
            </button>
          );
        })}
      </div>

      {isLoading && <TableSkeleton label="Cargando materiales…" rows={8} />}
      {isError && (
        <Alert
          tone="danger"
          title="No se pudo cargar el catálogo"
          action={
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Reintentar
            </Button>
          }
        />
      )}

      {data && data.materials.length === 0 && (
        <EmptyState
          icon={<PiMagnifyingGlass />}
          title="No encontramos ese material"
          description="Prueba con otra palabra o quita el filtro de categoría."
        />
      )}

      {data && data.materials.length > 0 && (
        <div
          className={clsx(
            'card overflow-hidden transition-opacity',
            isPlaceholderData && 'opacity-60'
          )}
        >
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Material</th>
                  <th scope="col" className="num">
                    Mejor precio
                  </th>
                  <th scope="col" className="hidden md:table-cell">
                    Proveedores
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.materials.map((m) => (
                  <MaterialRow
                    key={m.id}
                    material={m}
                    open={openId === m.id}
                    onToggle={() => setOpenId(openId === m.id ? null : m.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-xs text-ink-subtle">
        Precios de referencia por unidad de venta. Confírmalos con el proveedor antes de comprar.
      </p>
    </div>
  );
}

function MaterialRow({
  material: m,
  open,
  onToggle,
}: {
  material: CatalogMaterial;
  open: boolean;
  onToggle: () => void;
}) {
  const best = m.bestPrice;
  return (
    <Fragment>
      <tr>
        <td>
          <button
            type="button"
            className="flex w-full items-start gap-2 rounded text-left"
            aria-expanded={open}
            aria-controls={`precios-${m.id}`}
            onClick={onToggle}
            disabled={m.prices.length === 0}
          >
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{m.name}</span>
              <span className="mt-0.5 block text-xs text-ink-subtle">
                {m.unit}
                {m.category ? ` · ${capitalize(m.category)}` : ''}
              </span>
            </span>
            {m.prices.length > 0 && (
              <PiCaretDown
                aria-hidden="true"
                className={clsx(
                  'mt-1 h-4 w-4 shrink-0 text-ink-subtle transition-transform',
                  open && 'rotate-180'
                )}
              />
            )}
            <span className="sr-only">{open ? 'Ocultar precios' : 'Ver precios por proveedor'}</span>
          </button>
        </td>
        <td className="num">
          {best ? (
            <>
              <span className="whitespace-nowrap font-semibold">{formatCOP(best.price)}</span>
              <span className="block text-xs text-ink-subtle">{best.providerName}</span>
            </>
          ) : (
            <span className="text-ink-subtle">Sin precio</span>
          )}
        </td>
        <td className="hidden whitespace-nowrap text-ink-muted md:table-cell">
          {m.prices.length} {m.prices.length === 1 ? 'proveedor' : 'proveedores'}
        </td>
      </tr>
      {open && (
        <tr id={`precios-${m.id}`} className="bg-surface-muted">
          <td colSpan={3}>
            <ul className="divide-y divide-line">
              {m.prices.map((p, i) => (
                <li
                  key={p.providerId}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2"
                >
                  <span className="min-w-0">
                    <Link to={`/providers/${p.providerId}`} className="font-semibold hover:underline">
                      {p.providerName}
                    </Link>
                    <span className="ml-2 text-xs text-ink-subtle">
                      {p.location} · actualizado {formatDate(p.updatedAt)}
                    </span>
                  </span>
                  <span className="flex items-baseline gap-2 tabular-nums">
                    {i === 0 ? (
                      <Badge tone="success">Más económico</Badge>
                    ) : (
                      best && (
                        <span className="text-xs text-ink-subtle">
                          +{formatCOP(p.price - best.price)}
                        </span>
                      )
                    )}
                    <span className="font-semibold">{formatCOP(p.price)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </td>
        </tr>
      )}
    </Fragment>
  );
}

/* --------------------------------------------------------- proveedores --- */

const RATING_FILTERS = [
  { value: '', label: 'Cualquier calificación' },
  { value: '4', label: '4,0 o más' },
  { value: '4.5', label: '4,5 o más' },
];

function ProvidersView() {
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState('');
  const [category, setCategory] = useState('');

  const { data: everything } = useQuery({
    queryKey: ['catalog', 'providers', '', '', ''],
    queryFn: () => catalogApi.providers(),
  });
  const { data, isLoading, isError, isPlaceholderData, refetch } = useQuery({
    queryKey: ['catalog', 'providers', location, rating, category],
    queryFn: () =>
      catalogApi.providers({
        location: location || undefined,
        rating: rating ? Number(rating) : undefined,
        category: category || undefined,
      }),
    placeholderData: keepPreviousData,
  });

  const categories = [
    ...new Set((everything?.providers ?? []).flatMap((p) => p.categories)),
  ].sort((a, b) => a.localeCompare(b, 'es'));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <select
          aria-label="Filtrar por ubicación"
          className="input w-full sm:w-auto"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          <option value="">Todas las ubicaciones</option>
          {everything?.locations.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <select
          aria-label="Filtrar por material que vende"
          className="input w-full sm:w-auto"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Cualquier material</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {capitalize(c)}
            </option>
          ))}
        </select>
        <select
          aria-label="Calificación mínima"
          className="input w-full sm:w-auto"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        >
          {RATING_FILTERS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <TableSkeleton label="Cargando proveedores…" />}
      {isError && (
        <Alert
          tone="danger"
          title="No se pudieron cargar los proveedores"
          action={
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Reintentar
            </Button>
          }
        />
      )}
      {data && data.providers.length === 0 && (
        <EmptyState
          icon={<PiStorefront />}
          title="Ningún proveedor coincide"
          description="Prueba con otra ubicación o baja la calificación mínima."
        />
      )}
      {data && data.providers.length > 0 && (
        <div
          className={clsx(
            'grid grid-cols-1 gap-4 transition-opacity md:grid-cols-2 xl:grid-cols-3',
            isPlaceholderData && 'opacity-60'
          )}
        >
          {data.providers.map((p) => (
            <ProviderCard key={p.id} provider={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProviderCard({ provider: p }: { provider: CatalogProvider }) {
  return (
    <article className="card flex min-w-0 flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold leading-snug text-ink">
            <Link to={`/providers/${p.id}`} className="hover:underline">
              {p.name}
            </Link>
          </h2>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-ink-muted">
            <PiMapPin aria-hidden="true" className="h-4 w-4 shrink-0" />
            {p.location}
          </p>
        </div>
        <span
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-surface-strong px-2.5 py-1 text-sm font-semibold text-ink"
          title="Calificación de 0 a 5"
        >
          <PiStarFill aria-hidden="true" className="h-4 w-4 text-accent" />
          {formatRating(p.rating)}
          <span className="sr-only">de 5</span>
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-ink-subtle">Materiales</dt>
          <dd className="font-semibold text-ink">{p.materialsOffered}</dd>
        </div>
        <div>
          <dt className="text-ink-subtle">Entrega</dt>
          <dd className="flex items-center gap-1 font-semibold text-ink">
            <PiClock aria-hidden="true" className="h-4 w-4" />
            {p.deliveryTime ?? '—'}
          </dd>
        </div>
      </dl>

      {p.categories.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Qué vende">
          {p.categories.map((c) => (
            <li key={c}>
              <Badge tone="neutral">{capitalize(c)}</Badge>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex flex-wrap gap-2 border-t border-line pt-4">
        <Link to={`/providers/${p.id}`} className="btn btn-primary btn-sm">
          Ver precios
        </Link>
        {p.phone && (
          <a href={`tel:${p.phone.replace(/\s+/g, '')}`} className="btn btn-secondary btn-sm">
            <PiPhone aria-hidden="true" />
            Llamar
          </a>
        )}
        {p.email && (
          <a href={`mailto:${p.email}`} className="btn btn-ghost btn-sm">
            <PiEnvelopeSimple aria-hidden="true" />
            Correo
          </a>
        )}
      </div>
    </article>
  );
}
