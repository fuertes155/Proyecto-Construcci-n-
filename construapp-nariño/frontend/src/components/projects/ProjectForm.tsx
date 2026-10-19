import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { PiMapPin } from 'react-icons/pi';
import { z } from 'zod';
import type { CreateProjectInput } from '../../services/projects';
import { formatCOP } from '../../utils/format';
import Button from '../ui/Button';
import { TextAreaField, TextField } from '../ui/Field';

const schema = z
  .object({
    name: z.string().trim().min(2, 'Ingresa un nombre').max(160),
    location: z.string().trim().max(160).optional().or(z.literal('')),
    description: z.string().trim().max(2000).optional().or(z.literal('')),
    budget: z.coerce.number().positive('Debe ser mayor a 0').optional().or(z.literal('')),
    startDate: z.string().optional().or(z.literal('')),
    endDate: z.string().optional().or(z.literal('')),
  })
  .refine((v) => !v.startDate || !v.endDate || v.endDate >= v.startDate, {
    message: 'La fecha de fin debe ser posterior a la de inicio',
    path: ['endDate'],
  });

type FormValues = z.infer<typeof schema>;

interface ProjectFormProps {
  onSubmit: (input: CreateProjectInput) => void;
  onCancel: () => void;
  submitting: boolean;
}

export default function ProjectForm({ onSubmit, onCancel, submitting }: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // Los montos en pesos tienen muchos ceros: se muestra el valor con separadores.
  const budget = Number(watch('budget'));

  const submit = (values: FormValues) => {
    const input: CreateProjectInput = { name: values.name };
    if (values.location) input.location = values.location;
    if (values.description) input.description = values.description;
    if (values.budget) input.budget = Number(values.budget);
    if (values.startDate) input.startDate = values.startDate;
    if (values.endDate) input.endDate = values.endDate;
    onSubmit(input);
  };

  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(submit)} noValidate>
      <TextField
        id="name"
        label="Nombre del proyecto"
        placeholder="Casa en Pasto"
        error={errors.name?.message}
        wrapperClassName="sm:col-span-2"
        data-autofocus
        {...register('name')}
      />

      <TextField
        id="location"
        label="Ubicación"
        optional
        placeholder="Pasto, Nariño"
        icon={<PiMapPin />}
        {...register('location')}
      />

      <TextField
        id="budget"
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

      <TextField
        id="startDate"
        label="Fecha de inicio"
        optional
        type="date"
        {...register('startDate')}
      />
      <TextField
        id="endDate"
        label="Fecha de fin"
        optional
        type="date"
        error={errors.endDate?.message}
        {...register('endDate')}
      />

      <TextAreaField
        id="description"
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
          {submitting ? 'Creando…' : 'Crear proyecto'}
        </Button>
      </div>
    </form>
  );
}
