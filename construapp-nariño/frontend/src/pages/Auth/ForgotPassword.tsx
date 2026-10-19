import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { PiEnvelopeSimple } from 'react-icons/pi';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import AuthLayout from '../../components/AuthLayout';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import { TextField } from '../../components/ui/Field';
import { api } from '../../services/api';

const schema = z.object({ email: z.string().email('Correo no válido') });
type FormValues = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await api.post('/auth/forgot-password', values);
    } catch {
      /* la respuesta es siempre 204; ignoramos cualquier fallo de red silenciosamente */
    }
    setSent(true);
  };

  return (
    <AuthLayout
      title="Recuperar contraseña"
      subtitle={sent ? undefined : 'Te enviaremos un enlace para restablecerla.'}
      footer={
        <Link to="/login" className="link">
          Volver a iniciar sesión
        </Link>
      }
    >
      {sent ? (
        <Alert tone="success" title="Revisa tu bandeja de entrada">
          Si el correo está registrado, te enviamos un enlace para elegir una nueva contraseña.
        </Alert>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            id="email"
            label="Correo"
            type="email"
            autoComplete="email"
            icon={<PiEnvelopeSimple />}
            error={errors.email?.message}
            {...register('email')}
          />
          <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
            {isSubmitting ? 'Enviando…' : 'Enviar enlace'}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
