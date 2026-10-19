import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { PiMapPin } from 'react-icons/pi';
import { z } from 'zod';
import type { CreateProjectInput, Project } from '../../services/projects';
import { formatCOP } from '../../utils/format';
import Button from '../ui/Button';
import { TextAreaField, TextField } from '../ui/Field';

const schema = z.object({
  name: z.string().trim().min(2, 'Ingresa un nombre').max(160),
  location: z.string().trim().max(160).optional().or(z.literal('')),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  budget: z.coerce.number().positive('Debe ser mayor a 0').optional().or(z.literal('')),
});
type FormValues = z.infer<typeof schema>;

interface EditProjectFormProps {
  project: Project;
  onSubmit: (changes: Partial<CreateProjectInput>) => void;
  onCancel: () => void;
  submitting: boolean;
}

export default function EditProjectForm({
  project,
  onSubmit,
  onCancel,
  submitting,
}: EditProjectFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: project.name,
      location: project.location ?? '',
      description: project.description ?? '',
      budget: project.budget ?? undefined,
    },
  });

  const budget = Number(watch('budget'));

  const submit = (values: FormValues) => {
    onSubmit({
      name: values.name,
      location: values.location || undefined,
      description: values.description || undefined,
      budget: values.budget ? Number(values.budget) : undefined,
    });
  };

  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(submit)} noValidate>
      <TextField
        id="edit-name"
        label="Nombre"
        error={errors.name?.message}
        wrapperClassName="sm:col-span-2"
        data-autofocus
        {...register('name')}
      />
      <TextField
        id="edit-location"
        label="Ubicación"
        optional
        icon={<PiMapPin />}
        {...register('location')}
      />
      <TextField
        id="edit-budget"
        label="Presupuesto objetivo"
        optional
        suffix="COP"
        type="number"
        step="any"
        inputMode="decimal"
        hint={budget > 0 ? formatCOP(budget) : undefined}
        error={errors.budget?.message}
        {...register('budget')}
      />
      <TextAreaField
        id="edit-description"
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
          {submitting ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}
