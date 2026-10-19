import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { PiCheckCircleFill, PiPencilSimple, PiPlus, PiProhibit } from 'react-icons/pi';
import { z } from 'zod';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import Button, { IconButton } from '../../components/ui/Button';
import { TextAreaField, TextField } from '../../components/ui/Field';
import Modal from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { adminApi, type AdminMaterial, type CreateMaterialInput } from '../../services/admin';
import { apiErrorMessage } from '../../services/api';

const schema = z.object({
  name: z.string().trim().min(2, 'Ingresa un nombre').max(160),
  unit: z.string().trim().min(1, 'Ingresa la unidad').max(40),
  category: z.string().trim().max(60).optional().or(z.literal('')),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
});
type FormValues = z.infer<typeof schema>;

function MaterialForm({
  initial,
  submitting,
  onSubmit,
  onCancel,
}: {
  initial?: AdminMaterial;
  submitting: boolean;
  onSubmit: (input: CreateMaterialInput) => void;
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
          unit: initial.unit,
          category: initial.category ?? '',
          description: initial.description ?? '',
        }
      : undefined,
  });

  const submit = (values: FormValues) => {
    onSubmit({
      name: values.name,
      unit: values.unit,
      category: values.category || undefined,
      description: values.description || undefined,
    });
  };

  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(submit)} noValidate>
      <TextField
        id="mat-name"
        label="Nombre"
        error={errors.name?.message}
        wrapperClassName="sm:col-span-2"
        data-autofocus
        {...register('name')}
      />
      <TextField
        id="mat-unit"
        label="Unidad"
        placeholder="saco 50 kg, m³, unidad…"
        error={errors.unit?.message}
        {...register('unit')}
      />
      <TextField id="mat-category" label="Categoría" optional {...register('category')} />
      <TextAreaField
        id="mat-description"
        label="Descripción"
        optional
        rows={3}
        wrapperClassName="sm:col-span-2"
        {...register('description')}
      />
      <div className="flex flex-col-reverse gap-2 pt-2 sm:col-span-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={submitting}>
          {submitting ? 'Guardando…' : initial ? 'Guardar cambios' : 'Crear material'}
        </Button>
      </div>
    </form>
  );
}

export default function AdminMaterials() {
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<AdminMaterial | null>(null);
  const queryClient = useQueryClient();

  const { data: materials, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'materials'],
    queryFn: adminApi.materials.list,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'materials'] });

  const createMutation = useMutation({
    mutationFn: adminApi.materials.create,
    onSuccess: () => {
      toast.success('Material creado');
      setShowCreate(false);
      invalidate();
    },
    onError: (err) => toast.error(apiErrorMessage(err, 'No se pudo crear el material')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: Partial<CreateMaterialInput> }) =>
      adminApi.materials.update(id, changes),
    onSuccess: () => {
      toast.success('Material actualizado');
      setEditing(null);
      invalidate();
    },
    onError: (err) => toast.error(apiErrorMessage(err, 'No se pudo actualizar el material')),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      active ? adminApi.materials.reactivate(id) : adminApi.materials.deactivate(id),
    onSuccess: () => {
      toast.success('Estado actualizado');
      invalidate();
    },
    onError: (err) => toast.error(apiErrorMessage(err, 'No se pudo cambiar el estado')),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="title-section">Catálogo de materiales</h2>
        <Button icon={<PiPlus aria-hidden="true" />} onClick={() => setShowCreate(true)}>
          Nuevo material
        </Button>
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nuevo material">
        <MaterialForm
          submitting={createMutation.isPending}
          onCancel={() => setShowCreate(false)}
          onSubmit={(input) => createMutation.mutate(input)}
        />
      </Modal>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Editar material"
        description={editing?.name}
      >
        {editing && (
          <MaterialForm
            initial={editing}
            submitting={updateMutation.isPending}
            onCancel={() => setEditing(null)}
            onSubmit={(changes) => updateMutation.mutate({ id: editing.id, changes })}
          />
        )}
      </Modal>

      {isLoading && <TableSkeleton label="Cargando materiales…" />}
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

      {materials && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            {/* En móvil solo quedan dos columnas: el resto se muestra bajo el nombre */}
            <table className="data-table md:min-w-[40rem]">
              <thead>
                <tr>
                  <th scope="col">Material</th>
                  <th scope="col" className="hidden md:table-cell">
                    Unidad
                  </th>
                  <th scope="col" className="hidden md:table-cell">
                    Categoría
                  </th>
                  <th scope="col" className="hidden md:table-cell">
                    Estado
                  </th>
                  <th scope="col">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {materials.map((m) => {
                  const status = m.active ? (
                    <Badge tone="success" icon={<PiCheckCircleFill aria-hidden="true" />}>
                      Activo
                    </Badge>
                  ) : (
                    <Badge tone="neutral" icon={<PiProhibit aria-hidden="true" />}>
                      Inactivo
                    </Badge>
                  );
                  return (
                    <tr key={m.id}>
                      <td>
                        <p className="font-semibold">{m.name}</p>
                        {m.description && (
                          <p className="mt-0.5 hidden max-w-sm truncate text-xs text-ink-subtle md:block">
                            {m.description}
                          </p>
                        )}
                        <p className="mt-0.5 text-xs text-ink-muted md:hidden">
                          {m.unit}
                          {m.category ? ` · ${m.category}` : ''}
                        </p>
                        <div className="mt-1.5 md:hidden">{status}</div>
                      </td>
                      <td className="hidden whitespace-nowrap md:table-cell">{m.unit}</td>
                      <td className="hidden text-ink-muted md:table-cell">{m.category ?? '—'}</td>
                      <td className="hidden md:table-cell">{status}</td>
                      <td className="w-px py-1 pl-0">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant={m.active ? 'danger-ghost' : 'ghost'}
                            size="sm"
                            disabled={toggleActiveMutation.isPending}
                            onClick={() =>
                              toggleActiveMutation.mutate({ id: m.id, active: !m.active })
                            }
                          >
                            {m.active ? 'Desactivar' : 'Reactivar'}
                          </Button>
                          <IconButton label={`Editar ${m.name}`} onClick={() => setEditing(m)}>
                            <PiPencilSimple aria-hidden="true" />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {materials.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-ink-muted">
                      Aún no hay materiales en el catálogo.
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
