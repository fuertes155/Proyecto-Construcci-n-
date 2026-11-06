import { zodResolver } from '@hookform/resolvers/zod';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { PiFloppyDisk, PiTrash } from 'react-icons/pi';
import { z } from 'zod';
import Alert from '../../components/ui/Alert';
import Button, { IconButton } from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { SelectField, TextAreaField, TextField } from '../../components/ui/Field';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { adminApi, type AdminPrice } from '../../services/admin';
import { apiErrorMessage } from '../../services/api';
import { formatCOP, formatDate } from '../../utils/format';
import PriceSource from '../../components/PriceSource';

const schema = z.object({
  materialId: z.string().uuid('Selecciona un material'),
  providerId: z.string().uuid('Selecciona un proveedor'),
  price: z.coerce.number().positive('Debe ser mayor a 0'),
  sourceUrl: z
    .union([
      z
        .string()
        .url('Escribe una URL válida')
        .regex(/^https?:\/\//i, 'Usa un enlace http o https'),
      z.literal(''),
    ])
    .optional(),
  sourceProduct: z.string().max(255).optional(),
  sourceNotes: z.string().max(2000).optional(),
});
type FormValues = z.infer<typeof schema>;

export default function AdminPrices() {
  const [filterMaterial, setFilterMaterial] = useState('');
  const [filterProvider, setFilterProvider] = useState('');
  const [toDelete, setToDelete] = useState<AdminPrice | null>(null);
  const queryClient = useQueryClient();

  const { data: materials } = useQuery({
    queryKey: ['admin', 'materials'],
    queryFn: adminApi.materials.list,
  });
  const { data: providers } = useQuery({
    queryKey: ['admin', 'providers'],
    queryFn: adminApi.providers.list,
  });
  const {
    data: prices,
    isLoading,
    isError,
    isPlaceholderData,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'prices', filterMaterial, filterProvider],
    queryFn: () =>
      adminApi.prices.list({
        materialId: filterMaterial || undefined,
        providerId: filterProvider || undefined,
      }),
    // Al cambiar un filtro se mantiene la tabla anterior (atenuada) en vez de vaciarla.
    placeholderData: keepPreviousData,
  });

  const invalidatePrices = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'prices'] });
    void queryClient.invalidateQueries({ queryKey: ['catalog'] });
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const price = Number(watch('price'));

  const upsertMutation = useMutation({
    mutationFn: adminApi.prices.upsert,
    onSuccess: () => {
      toast.success('Precio guardado');
      reset({
        materialId: '',
        providerId: '',
        price: undefined,
        sourceUrl: '',
        sourceProduct: '',
        sourceNotes: '',
      });
      invalidatePrices();
    },
    onError: (err) => toast.error(apiErrorMessage(err, 'No se pudo guardar el precio')),
  });

  const removeMutation = useMutation({
    mutationFn: adminApi.prices.remove,
    onSuccess: () => {
      toast.success('Precio eliminado');
      invalidatePrices();
    },
    onError: (err) => toast.error(apiErrorMessage(err, 'No se pudo eliminar el precio')),
    onSettled: () => setToDelete(null),
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="title-section">Precios por proveedor</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Registra el valor y la referencia comercial que lo respalda.
        </p>
      </div>

      <form
        className="card p-5 sm:p-6"
        onSubmit={handleSubmit((values) => upsertMutation.mutate(values))}
        noValidate
      >
        <div className="form-section">
          <div className="form-section-heading">
            <span className="form-step" aria-hidden="true">
              01
            </span>
            <div>
              <h3 className="font-semibold">Material y valor</h3>
              <p className="text-xs text-ink-subtle">Selecciona la presentación y el comercio.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_12rem]">
            <SelectField
              id="price-material"
              label="Material"
              error={errors.materialId?.message}
              {...register('materialId')}
            >
              <option value="">Selecciona…</option>
              {materials?.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </SelectField>
            <SelectField
              id="price-provider"
              label="Proveedor"
              error={errors.providerId?.message}
              {...register('providerId')}
            >
              <option value="">Selecciona…</option>
              {providers?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </SelectField>
            <TextField
              id="price-value"
              label="Precio"
              suffix="COP"
              type="number"
              step="any"
              inputMode="decimal"
              hint={price > 0 ? formatCOP(price) : undefined}
              error={errors.price?.message}
              {...register('price')}
            />
          </div>
        </div>
        <div className="form-section">
          <div className="form-section-heading">
            <span className="form-step" aria-hidden="true">
              02
            </span>
            <div>
              <h3 className="font-semibold">Fuente y condiciones</h3>
              <p className="text-xs text-ink-subtle">
                Ayuda a entender qué incluye el precio publicado.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="price-source"
              label="Enlace al precio publicado"
              type="url"
              error={errors.sourceUrl?.message}
              {...register('sourceUrl')}
            />
            <TextField
              id="price-product"
              label="Producto y presentación de la tienda"
              error={errors.sourceProduct?.message}
              {...register('sourceProduct')}
            />
            <TextAreaField
              id="price-notes"
              label="Condiciones de compra"
              rows={2}
              wrapperClassName="sm:col-span-2"
              hint="Indica impuestos, pedido mínimo, transporte o falta de stock."
              error={errors.sourceNotes?.message}
              {...register('sourceNotes')}
            />
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-xs leading-relaxed text-ink-subtle">
            Si ya existe un precio para ese material y proveedor, se actualiza.
          </p>
          <Button
            type="submit"
            loading={upsertMutation.isPending}
            icon={<PiFloppyDisk aria-hidden="true" />}
          >
            {upsertMutation.isPending ? 'Guardando…' : 'Guardar precio'}
          </Button>
        </div>
      </form>

      <div className="filter-bar">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">Precios registrados</h3>
          {prices && (
            <p className="text-xs text-ink-subtle" role="status">
              {prices.length} resultados
            </p>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            aria-label="Filtrar por material"
            className="input"
            value={filterMaterial}
            onChange={(e) => setFilterMaterial(e.target.value)}
          >
            <option value="">Todos los materiales</option>
            {materials?.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Filtrar por proveedor"
            className="input"
            value={filterProvider}
            onChange={(e) => setFilterProvider(e.target.value)}
          >
            <option value="">Todos los proveedores</option>
            {providers?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && <TableSkeleton label="Cargando precios…" />}
      {isError && (
        <Alert
          tone="danger"
          title="No se pudieron cargar los precios"
          action={
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Reintentar
            </Button>
          }
        />
      )}

      {prices && (
        <div
          className={clsx(
            'card overflow-hidden transition-opacity',
            isPlaceholderData && 'opacity-60'
          )}
        >
          <div className="divide-y divide-line md:hidden">
            {prices.map((p) => (
              <article key={p.id} className="min-w-0 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="break-words font-semibold">{p.material.name}</h4>
                    <p className="mt-1 text-xs text-ink-muted">
                      {p.provider.name} · {p.material.unit}
                    </p>
                  </div>
                  <IconButton
                    label={`Eliminar precio de ${p.material.name} en ${p.provider.name}`}
                    tone="danger"
                    onClick={() => setToDelete(p)}
                  >
                    <PiTrash aria-hidden="true" />
                  </IconButton>
                </div>
                <p className="mt-3 font-display text-2xl font-semibold text-brand-text">
                  {formatCOP(p.price)}
                </p>
                <PriceSource price={p} />
                <p className="mt-2 text-xs text-ink-subtle">
                  Actualizado {formatDate(p.updatedAt)}
                </p>
              </article>
            ))}
            {prices.length === 0 && (
              <p className="p-6 text-center text-sm text-ink-muted">
                No hay precios registrados con este filtro.
              </p>
            )}
          </div>
          <div className="hidden overflow-x-auto md:block">
            {/* En móvil el proveedor y la fecha pasan bajo el material */}
            <table className="data-table md:min-w-[40rem]">
              <thead>
                <tr>
                  <th scope="col">Material</th>
                  <th scope="col" className="hidden md:table-cell">
                    Proveedor
                  </th>
                  <th scope="col" className="num">
                    Precio
                  </th>
                  <th scope="col" className="hidden md:table-cell">
                    Actualizado
                  </th>
                  <th scope="col">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {prices.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span className="font-semibold">{p.material.name}</span>{' '}
                      <span className="whitespace-nowrap text-ink-subtle">({p.material.unit})</span>
                      <PriceSource price={p} />
                      <p className="mt-0.5 text-xs text-ink-muted md:hidden">
                        {p.provider.name} · {formatDate(p.updatedAt)}
                      </p>
                    </td>
                    <td className="hidden md:table-cell">{p.provider.name}</td>
                    <td className="num whitespace-nowrap font-semibold">{formatCOP(p.price)}</td>
                    <td className="hidden whitespace-nowrap text-ink-muted md:table-cell">
                      {formatDate(p.updatedAt)}
                    </td>
                    <td className="w-px py-1 pl-0 text-right">
                      <IconButton
                        label={`Eliminar precio de ${p.material.name} en ${p.provider.name}`}
                        tone="danger"
                        onClick={() => setToDelete(p)}
                      >
                        <PiTrash aria-hidden="true" />
                      </IconButton>
                    </td>
                  </tr>
                ))}
                {prices.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-ink-muted">
                      No hay precios registrados con este filtro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="¿Eliminar este precio?"
        description={
          toDelete && (
            <>
              Se eliminará el precio de{' '}
              <strong className="font-semibold text-ink">{toDelete.material.name}</strong> en{' '}
              <strong className="font-semibold text-ink">{toDelete.provider.name}</strong> (
              {formatCOP(toDelete.price)}).
            </>
          )
        }
        confirmLabel="Eliminar precio"
        loading={removeMutation.isPending}
        onConfirm={() => toDelete && removeMutation.mutate(toDelete.id)}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
