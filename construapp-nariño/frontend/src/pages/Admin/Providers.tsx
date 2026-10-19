import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  PiEnvelopeSimple,
  PiMapPin,
  PiPencilSimple,
  PiPhone,
  PiPlus,
  PiStarFill,
} from 'react-icons/pi';
import { z } from 'zod';
import Alert from '../../components/ui/Alert';
import Button, { IconButton } from '../../components/ui/Button';
import { TextField } from '../../components/ui/Field';
import Modal from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { adminApi, type AdminProvider, type CreateProviderInput } from '../../services/admin';
import { apiErrorMessage } from '../../services/api';

const schema = z.object({
  name: z.string().trim().min(2, 'Ingresa un nombre').max(160),
  location: z.string().trim().max(160).optional().or(z.literal('')),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  email: z.string().trim().email('Correo inválido').max(160).optional().or(z.literal('')),
  rating: z.coerce
    .number()
    .min(0, 'Debe estar entre 0 y 5')
    .max(5, 'Debe estar entre 0 y 5')
    .optional()
    .or(z.literal('')),
  deliveryTime: z.string().trim().max(60).optional().or(z.literal('')),
});
type FormValues = z.infer<typeof schema>;

function ProviderForm({
  initial,
  submitting,
  onSubmit,
  onCancel,
}: {
  initial?: AdminProvider;
  submitting: boolean;
  onSubmit: (input: CreateProviderInput) => void;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          name: initial.name,
          location: initial.location,
          phone: initial.phone ?? '',
          email: initial.email ?? '',
          rating: initial.rating,
          deliveryTime: initial.deliveryTime ?? '',
        }
      : undefined,
  });

  const submit = (values: FormValues) => {
    onSubmit({
      name: values.name,
      location: values.location || undefined,
      phone: values.phone || undefined,
      email: values.email || undefined,
      rating: values.rating === '' || values.rating === undefined ? undefined : Number(values.rating),
      deliveryTime: values.deliveryTime || undefined,
    });
  };

  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(submit)} noValidate>
      <TextField
        id="prov-name"
        label="Nombre"
        error={errors.name?.message}
        wrapperClassName="sm:col-span-2"
        data-autofocus
        {...register('name')}
      />
      <TextField
        id="prov-location"
        label="Ubicación"
        optional
        placeholder="Pasto, Nariño"
        icon={<PiMapPin />}
        {...register('location')}
      />
      <TextField
        id="prov-phone"
        label="Teléfono"
        optional
        type="tel"
        icon={<PiPhone />}
        {...register('phone')}
      />
      <TextField
        id="prov-email"
        label="Correo"
        optional
        type="email"
        icon={<PiEnvelopeSimple />}
        error={errors.email?.message}
        wrapperClassName="sm:col-span-2"
        {...register('email')}
      />
      <TextField
        id="prov-rating"
        label="Calificación"
        optional
        type="number"
        step="0.1"
        min="0"
        max="5"
        inputMode="decimal"
        hint="De 0 a 5."
        error={errors.rating?.message}
        {...register('rating')}
      />
      <TextField
        id="prov-delivery"
        label="Tiempo de entrega"
        optional
        placeholder="24-48 horas"
        {...register('deliveryTime')}
      />
      <div className="flex flex-col-reverse gap-2 pt-2 sm:col-span-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={submitting}>
          {submitting ? 'Guardando…' : initial ? 'Guardar cambios' : 'Crear proveedor'}
        </Button>
      </div>
    </form>
  );
}

export default function AdminProviders() {
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<AdminProvider | null>(null);
  const queryClient = useQueryClient();

  const { data: providers, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'providers'],
    queryFn: adminApi.providers.list,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] });

  const createMutation = useMutation({
    mutationFn: adminApi.providers.create,
    onSuccess: () => {
      toast.success('Proveedor creado');
      setShowCreate(false);
      invalidate();
    },
    onError: (err) => toast.error(apiErrorMessage(err, 'No se pudo crear el proveedor')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: Partial<CreateProviderInput> }) =>
      adminApi.providers.update(id, changes),
    onSuccess: () => {
      toast.success('Proveedor actualizado');
      setEditing(null);
      invalidate();
    },
    onError: (err) => toast.error(apiErrorMessage(err, 'No se pudo actualizar el proveedor')),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="title-section">Proveedores</h2>
        <Button icon={<PiPlus aria-hidden="true" />} onClick={() => setShowCreate(true)}>
          Nuevo proveedor
        </Button>
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nuevo proveedor">
        <ProviderForm
          submitting={createMutation.isPending}
          onCancel={() => setShowCreate(false)}
          onSubmit={(input) => createMutation.mutate(input)}
        />
      </Modal>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Editar proveedor"
        description={editing?.name}
      >
        {editing && (
          <ProviderForm
            initial={editing}
            submitting={updateMutation.isPending}
            onCancel={() => setEditing(null)}
            onSubmit={(changes) => updateMutation.mutate({ id: editing.id, changes })}
          />
        )}
      </Modal>

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

      {providers && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            {/* En móvil el contacto y la entrega pasan bajo el nombre */}
            <table className="data-table md:min-w-[46rem]">
              <thead>
                <tr>
                  <th scope="col">Proveedor</th>
                  <th scope="col" className="hidden md:table-cell">
                    Contacto
                  </th>
                  <th scope="col" className="num">
                    Calificación
                  </th>
                  <th scope="col" className="hidden md:table-cell">
                    Entrega
                  </th>
                  <th scope="col">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {providers.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <p className="font-semibold">{p.name}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-subtle">
                        <PiMapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                        {p.location}
                      </p>
                      <div className="mt-1 space-y-0.5 text-xs text-ink-muted md:hidden">
                        {p.phone && <p>{p.phone}</p>}
                        {p.email && <p className="break-all">{p.email}</p>}
                        {p.deliveryTime && <p>Entrega: {p.deliveryTime}</p>}
                      </div>
                    </td>
                    <td className="hidden text-ink-muted md:table-cell">
                      {p.phone || p.email ? (
                        <>
                          {p.phone && <p className="whitespace-nowrap">{p.phone}</p>}
                          {p.email && <p className="break-all text-xs">{p.email}</p>}
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="num">
                      <span className="inline-flex items-center gap-1 font-semibold">
                        <PiStarFill aria-hidden="true" className="h-4 w-4 text-accent" />
                        {p.rating.toLocaleString('es-CO', {
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 1,
                        })}
                      </span>
                    </td>
                    <td className="hidden whitespace-nowrap text-ink-muted md:table-cell">
                      {p.deliveryTime ?? '—'}
                    </td>
                    <td className="w-px py-1 pl-0 text-right">
                      <IconButton label={`Editar ${p.name}`} onClick={() => setEditing(p)}>
                        <PiPencilSimple aria-hidden="true" />
                      </IconButton>
                    </td>
                  </tr>
                ))}
                {providers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-ink-muted">
                      Aún no hay proveedores registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
