import nodemailer, { type Transporter } from 'nodemailer';
import logger from '../config/logger.js';

const from = process.env.EMAIL_FROM || 'ConstruApp Nariño <noreply@construappnarino.co>';

let transporter: Transporter | null = null;

/** Devuelve el transporte SMTP si está configurado; si no, `null` (modo log). */
function getTransport(): Transporter | null {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!host || !user || !pass || user.startsWith('your_')) return null;

  transporter = nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: { user, pass },
  });
  return transporter;
}

interface Mail {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Envía un correo. Sin SMTP configurado, lo registra en el log (útil en
 * desarrollo: el enlace de recuperación queda visible en la consola).
 */
export async function sendMail(mail: Mail): Promise<void> {
  const transport = getTransport();
  if (!transport) {
    logger.info(
      `📧 [correo simulado, sin SMTP] Para: ${mail.to} | Asunto: ${mail.subject}\n${mail.text}`
    );
    return;
  }
  await transport.sendMail({ from, ...mail });
  logger.info(`📧 Correo enviado a ${mail.to}: ${mail.subject}`);
}

export function sendPasswordResetEmail(to: string, resetUrl: string, ttlMinutes: number) {
  return sendMail({
    to,
    subject: 'Recupera tu contraseña — ConstruApp Nariño',
    text:
      `Recibimos una solicitud para restablecer tu contraseña.\n\n` +
      `Abre este enlace para elegir una nueva (válido ${ttlMinutes} minutos):\n${resetUrl}\n\n` +
      `Si no fuiste tú, ignora este correo.`,
    html:
      `<p>Recibimos una solicitud para restablecer tu contraseña.</p>` +
      `<p><a href="${resetUrl}">Elegir una nueva contraseña</a> (válido ${ttlMinutes} minutos).</p>` +
      `<p>Si no fuiste tú, ignora este correo.</p>`,
  });
}
