import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { PiEnvelopeSimple, PiLockKey, PiUser } from 'react-icons/pi';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import AuthLayout from '../../components/AuthLayout';
import Button from '../../components/ui/Button';
import { PasswordField, SelectField, TextField } from '../../components/ui/Field';
import { useAuth } from '../../hooks/useAuth';
import { apiErrorMessage } from '../../services/api';

const USER_TYPES = [
  { value: 'owner', label: 'Propietario / dueño de obra' },
  { value: 'contractor', label: 'Maestro de obra / contratista' },
  { value: 'engineer', label: 'Ingeniero / arquitecto' },
  { value: 'provider', label: 'Proveedor de materiales' },
] as const;

const schema = z.object({
  name: z.string().trim().min(2, 'Ingresa tu nombre'),
  email: z.string().email('Correo no válido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  userType: z.enum(['owner', 'contractor', 'engineer', 'provider']),
});
type FormValues = z.infer<typeof schema>;

export default function Register() {
  const { user, register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { userType: 'contractor' },
  });

  if (user) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (values: FormValues) => {
    try {
      await registerUser(values);
      toast.success('Cuenta creada');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(apiErrorMessage(err, 'No se pudo crear la cuenta'));
    }
  };

  return (
    <AuthLayout
      title="Crear cuenta"
      subtitle="Guarda tus cálculos por obra y sigue cada presupuesto."
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="link">
            Iniciar sesión
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          id="name"
          label="Nombre"
          type="text"
          autoComplete="name"
          icon={<PiUser />}
          error={errors.name?.message}
          {...register('name')}
        />

        <TextField
          id="email"
          label="Correo"
          type="email"
          autoComplete="email"
          icon={<PiEnvelopeSimple />}
          error={errors.email?.message}
          {...register('email')}
        />

        <PasswordField
          id="password"
          label="Contraseña"
          autoComplete="new-password"
          icon={<PiLockKey />}
          hint="Mínimo 8 caracteres."
          error={errors.password?.message}
          {...register('password')}
        />

        <SelectField id="userType" label="Tipo de perfil" {...register('userType')}>
          {USER_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </SelectField>

        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          {isSubmitting ? 'Creando…' : 'Crear cuenta'}
        </Button>
      </form>
    </AuthLayout>
  );
}
