import { zodResolver } from '@hookform/resolvers/zod';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { PiTrash } from 'react-icons/pi';
import { z } from 'zod';
import Alert from '../../components/ui/Alert';
import Button, { IconButton } from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { SelectField, TextField } from '../../components/ui/Field';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { adminApi, type AdminPrice } from '../../services/admin';
import { apiErrorMessage } from '../../services/api';
import { formatCOP, formatDate } from '../../utils/format';

const schema = z.object({
  materialId: z.string().uuid('Selecciona un material'),
  providerId: z.string().uuid('Selecciona un proveedor'),
  price: z.coerce.number().positive('Debe ser mayor a 0'),
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

  const invalidatePrices = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'prices'] });

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
      reset({ materialId: '', providerId: '', price: undefined });
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
      <h2 className="title-section">Precios por proveedor</h2>

      <form
        className="card p-5 sm:p-6"
        onSubmit={handleSubmit((values) => upsertMutation.mutate(values))}
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_13rem_auto] lg:items-start">
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
          {/* El margen superior alinea el botón con los campos (alto de la etiqueta) */}
          <Button type="submit" loading={upsertMutation.isPending} className="lg:mt-[1.625rem]">
            {upsertMutation.isPending ? 'Guardando…' : 'Guardar precio'}
          </Button>
        </div>
        <p className="mt-4 text-sm text-ink-subtle">
          Si ya existe un precio para ese material y proveedor, se actualiza.
        </p>
      </form>

      <div className="flex flex-wrap gap-3">
        <select
          aria-label="Filtrar por material"
          className="input w-full sm:w-auto"
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
          className="input w-full sm:w-auto"
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
          <div className="overflow-x-auto">
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
