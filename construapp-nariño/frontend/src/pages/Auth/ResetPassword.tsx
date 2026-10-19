import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { PiLockKey } from 'react-icons/pi';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import AuthLayout from '../../components/AuthLayout';
import Button from '../../components/ui/Button';
import { PasswordField } from '../../components/ui/Field';
import { api, apiErrorMessage } from '../../services/api';

const schema = z
  .object({
    newPassword: z.string().min(8, 'Mínimo 8 caracteres'),
    confirm: z.string(),
  })
  .refine((v) => v.newPassword === v.confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm'],
  });
type FormValues = z.infer<typeof schema>;

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  if (!token) return <Navigate to="/login" replace />;

  const onSubmit = async (values: FormValues) => {
    try {
      await api.post('/auth/reset-password', { token, newPassword: values.newPassword });
      toast.success('Contraseña actualizada, inicia sesión');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(apiErrorMessage(err, 'No se pudo restablecer la contraseña'));
    }
  };

  return (
    <AuthLayout
      title="Nueva contraseña"
      subtitle="Elige una contraseña nueva para tu cuenta."
      footer={
        <Link to="/login" className="link">
          Volver a iniciar sesión
        </Link>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <PasswordField
          id="newPassword"
          label="Nueva contraseña"
          autoComplete="new-password"
          icon={<PiLockKey />}
          hint="Mínimo 8 caracteres."
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />
        <PasswordField
          id="confirm"
          label="Repite la contraseña"
          autoComplete="new-password"
          icon={<PiLockKey />}
          error={errors.confirm?.message}
          {...register('confirm')}
        />
        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          {isSubmitting ? 'Guardando…' : 'Guardar contraseña'}
        </Button>
      </form>
    </AuthLayout>
  );
}
