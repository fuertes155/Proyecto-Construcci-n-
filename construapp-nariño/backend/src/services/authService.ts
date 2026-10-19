import { randomUUID } from 'node:crypto';
import { Op, UniqueConstraintError } from 'sequelize';
import logger from '../config/logger.js';
import {
  PasswordResetToken,
  RefreshToken,
  User,
  type PublicUser,
  type UserType,
} from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import {
  accessTokenTtl,
  generateRefreshToken,
  generateResetToken,
  hashToken,
  PASSWORD_RESET_TTL_MIN,
  refreshTokenExpiry,
  resetTokenExpiry,
  signAccessToken,
} from '../utils/tokens.js';
import { sendPasswordResetEmail } from './mailer.js';

interface RegisterInput {
  email: string;
  password: string;
  name: string;
  userType?: UserType;
}

interface Credentials {
  email: string;
  password: string;
}

interface Session {
  token: string;
  refreshToken: string;
  expiresIn: string;
  user: PublicUser;
}

/** Crea el refresh token (en BD) y firma el access token para un usuario. */
async function issueSession(user: User, family?: string): Promise<Session> {
  const { raw, hash } = generateRefreshToken();
  await RefreshToken.create({
    userId: user.id,
    tokenHash: hash,
    family: family ?? randomUUID(),
    expiresAt: refreshTokenExpiry(),
  });
  return {
    token: signAccessToken({ sub: user.id, role: user.role, email: user.email }),
    refreshToken: raw,
    expiresIn: accessTokenTtl,
    user: user.toPublicJSON(),
  };
}

export const authService = {
  async register(input: RegisterInput): Promise<PublicUser> {
    try {
      const user = await User.create({
        email: input.email,
        password: input.password,
        firstName: input.name,
        userType: input.userType ?? 'contractor',
      });
      return user.toPublicJSON();
    } catch (err) {
      if (err instanceof UniqueConstraintError) {
        throw ApiError.badRequest('El correo ya está registrado');
      }
      throw err;
    }
  },

  async login({ email, password }: Credentials): Promise<Session> {
    const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    // Respuesta genérica: no revelar si el fallo fue el correo o la contraseña.
    if (!user || !(await user.checkPassword(password))) {
      throw ApiError.unauthorized('Credenciales inválidas');
    }
    if (user.status === 'suspended') {
      throw ApiError.forbidden('La cuenta está suspendida');
    }
    return issueSession(user);
  },

  /** Rota el refresh token: revoca el actual y emite uno nuevo en la misma familia. */
  async refresh(rawToken: string): Promise<Session> {
    const row = await RefreshToken.findOne({ where: { tokenHash: hashToken(rawToken) } });
    if (!row) throw ApiError.unauthorized('Token de refresco inválido');

    if (row.revokedAt !== null) {
      // Reúso de un token ya rotado → posible robo: se revoca la familia entera.
      await RefreshToken.update(
        { revokedAt: new Date() },
        { where: { family: row.family, revokedAt: null } }
      );
      throw ApiError.unauthorized('Token de refresco reutilizado; sesión revocada');
    }
    if (row.expiresAt.getTime() <= Date.now()) {
      throw ApiError.unauthorized('Token de refresco expirado');
    }

    const user = await User.findByPk(row.userId);
    if (!user || user.status === 'suspended') {
      throw ApiError.unauthorized('Cuenta no disponible');
    }

    row.revokedAt = new Date();
    await row.save();
    return issueSession(user, row.family);
  },

  /** Cierra la sesión: revoca la familia completa del refresh token dado. */
  async logout(rawToken: string): Promise<void> {
    const row = await RefreshToken.findOne({ where: { tokenHash: hashToken(rawToken) } });
    if (!row) return; // idempotente
    await RefreshToken.update(
      { revokedAt: new Date() },
      { where: { family: row.family, revokedAt: null } }
    );
  },

  async getProfile(userId: string): Promise<PublicUser> {
    const user = await User.findByPk(userId);
    if (!user) throw ApiError.notFound('Usuario no encontrado');
    return user.toPublicJSON();
  },

  async updateProfile(
    userId: string,
    changes: { name?: string; userType?: UserType }
  ): Promise<PublicUser> {
    const user = await User.findByPk(userId);
    if (!user) throw ApiError.notFound('Usuario no encontrado');
    if (changes.name !== undefined) user.firstName = changes.name;
    if (changes.userType !== undefined) user.userType = changes.userType;
    await user.save();
    return user.toPublicJSON();
  },

  async changePassword(
    userId: string,
    { currentPassword, newPassword }: { currentPassword: string; newPassword: string }
  ): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) throw ApiError.notFound('Usuario no encontrado');
    if (!(await user.checkPassword(currentPassword))) {
      throw ApiError.unauthorized('La contraseña actual no es correcta');
    }
    user.password = newPassword; // el hook `beforeSave` la hashea
    await user.save();
    // Invalida todas las sesiones activas: hay que volver a iniciar sesión.
    await RefreshToken.update(
      { revokedAt: new Date() },
      { where: { userId, revokedAt: null } }
    );
  },

  /**
   * HU-01.6 — solicita el enlace de recuperación. **No revela** si el correo
   * existe: la respuesta es siempre la misma (el controlador responde 204).
   */
  async requestPasswordReset(email: string, buildResetUrl: (token: string) => string): Promise<void> {
    const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!user) return; // silencio: no se filtra la existencia del correo

    // Invalida enlaces anteriores no usados de este usuario.
    await PasswordResetToken.update(
      { usedAt: new Date() },
      { where: { userId: user.id, usedAt: null } }
    );

    const { raw, hash } = generateResetToken();
    await PasswordResetToken.create({
      userId: user.id,
      tokenHash: hash,
      expiresAt: resetTokenExpiry(),
    });

    try {
      await sendPasswordResetEmail(user.email, buildResetUrl(raw), PASSWORD_RESET_TTL_MIN);
    } catch (err) {
      logger.error(`No se pudo enviar el correo de recuperación: ${(err as Error).message}`);
    }
  },

  /**
   * HU-01.6 — fija una nueva contraseña con el token del enlace.
   * El token es de un solo uso y expira; al usarlo se revocan las sesiones.
   */
  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const row = await PasswordResetToken.findOne({
      where: { tokenHash: hashToken(rawToken) },
    });
    const invalid = ApiError.badRequest('El enlace no es válido o ya expiró');
    if (!row || row.usedAt !== null || row.expiresAt.getTime() <= Date.now()) throw invalid;

    const user = await User.findByPk(row.userId);
    if (!user) throw invalid;

    user.password = newPassword; // el hook `beforeSave` la hashea
    await user.save();

    row.usedAt = new Date();
    await row.save();

    // Cierra cualquier otra sesión y anula el resto de enlaces de reset.
    await Promise.all([
      RefreshToken.update(
        { revokedAt: new Date() },
        { where: { userId: user.id, revokedAt: null } }
      ),
      PasswordResetToken.update(
        { usedAt: new Date() },
        { where: { userId: user.id, usedAt: null, id: { [Op.ne]: row.id } } }
      ),
    ]);
  },
};

export default authService;
