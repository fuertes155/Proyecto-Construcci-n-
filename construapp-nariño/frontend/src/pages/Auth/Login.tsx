import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { PiEnvelopeSimple, PiLockKey } from 'react-icons/pi';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import AuthLayout from '../../components/AuthLayout';
import Button from '../../components/ui/Button';
import { PasswordField, TextField } from '../../components/ui/Field';
import { useAuth } from '../../hooks/useAuth';
import { apiErrorMessage } from '../../services/api';

const schema = z.object({
  email: z.string().email('Correo no válido'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
});
type FormValues = z.infer<typeof schema>;

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  if (user) return <Navigate to={from} replace />;

  const onSubmit = async (values: FormValues) => {
    try {
      await login(values.email, values.password);
      toast.success('Sesión iniciada');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(apiErrorMessage(err, 'No se pudo iniciar sesión'));
    }
  };

  return (
    <AuthLayout
      title="Iniciar sesión"
      subtitle="Entra para ver tus proyectos y guardar tus cálculos."
      footer={
        <>
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="link">
            Crear cuenta
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          id="email"
          label="Correo"
          type="email"
          autoComplete="email"
          placeholder="usuario@correo.com"
          icon={<PiEnvelopeSimple />}
          error={errors.email?.message}
          {...register('email')}
        />

        <div>
          <PasswordField
            id="password"
            label="Contraseña"
            autoComplete="current-password"
            icon={<PiLockKey />}
            error={errors.password?.message}
            {...register('password')}
          />
          <p className="mt-2 text-right text-sm">
            <Link
              to="/forgot-password"
              className="font-medium text-ink-muted underline-offset-4 hover:text-ink hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </p>
        </div>

        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          {isSubmitting ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
    </AuthLayout>
  );
}
