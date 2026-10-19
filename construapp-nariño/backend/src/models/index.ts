/**
 * Modelos Sequelize de ConstruApp Nariño.
 *
 * Esquema según `docs/ARCHITECTURE.md`:
 *   User ─1:N─ Project ─1:N─ ProjectCalculation
 *   Provider ─1:N─ MaterialPrice ─N:1─ Material
 *
 * Las tablas se crean con las migraciones (`npm run migrate`).
 */
import bcrypt from 'bcrypt';
import {
  DataTypes,
  Model,
  type CreationOptional,
  type ForeignKey,
  type InferAttributes,
  type InferCreationAttributes,
  type NonAttribute,
} from 'sequelize';
import { sequelize } from '../config/database.js';

// Menos rondas en test para que la suite sea rápida; 10 en el resto.
const BCRYPT_ROUNDS = process.env.NODE_ENV === 'test' ? 4 : 10;

/* ------------------------------------------------------------------ User --- */

export type UserRole = 'admin' | 'provider' | 'user';
export type UserStatus = 'active' | 'suspended';
/** Tipo de perfil elegido en el registro (adapta la interfaz). */
export type UserType = 'owner' | 'contractor' | 'engineer' | 'provider';
export const USER_TYPES: UserType[] = ['owner', 'contractor', 'engineer', 'provider'];

/** Forma pública de un usuario (lo que devuelve la API, sin `password`). */
export interface PublicUser {
  id: string;
  email: string;
  name: string;
  userType: UserType;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
}

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<string>;
  declare email: string;
  declare password: string;
  declare firstName: string;
  declare lastName: CreationOptional<string>;
  declare userType: CreationOptional<UserType>;
  declare role: CreationOptional<UserRole>;
  declare status: CreationOptional<UserStatus>;
  declare emailVerifiedAt: CreationOptional<Date | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  /** Compara una contraseña en claro con el hash almacenado. */
  checkPassword(plain: string): Promise<boolean> {
    return bcrypt.compare(plain, this.password);
  }

  /** Nombre completo para las respuestas de la API. */
  get fullName(): NonAttribute<string> {
    return [this.firstName, this.lastName].filter(Boolean).join(' ');
  }

  /** Objeto seguro para exponer en la API (sin `password`). */
  toPublicJSON(): PublicUser {
    return {
      id: this.id,
      email: this.email,
      name: this.fullName,
      userType: this.userType,
      role: this.role,
      status: this.status,
      createdAt: this.createdAt,
    };
  }
}

User.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
      set(value: string) {
        this.setDataValue('email', value.trim().toLowerCase());
      },
    },
    password: { type: DataTypes.STRING, allowNull: false },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    userType: {
      type: DataTypes.ENUM(...USER_TYPES),
      allowNull: false,
      defaultValue: 'contractor',
    },
    role: {
      type: DataTypes.ENUM('admin', 'provider', 'user'),
      allowNull: false,
      defaultValue: 'user',
    },
    status: {
      type: DataTypes.ENUM('active', 'suspended'),
      allowNull: false,
      defaultValue: 'active',
    },
    emailVerifiedAt: { type: DataTypes.DATE, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'users',
    hooks: {
      // Hashea la contraseña siempre que se establezca o cambie.
      async beforeSave(user: User) {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, BCRYPT_ROUNDS);
        }
      },
    },
  }
);

/* -------------------------------------------------------------- Provider --- */

export class Provider extends Model<
  InferAttributes<Provider>,
  InferCreationAttributes<Provider>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare location: string;
  declare phone: CreationOptional<string | null>;
  declare email: CreationOptional<string | null>;
  declare rating: CreationOptional<number>;
  declare deliveryTime: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Provider.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    location: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Pasto, Nariño' },
    phone: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: true },
    rating: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    deliveryTime: { type: DataTypes.STRING, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'providers' }
);

/* -------------------------------------------------------------- Material --- */

export class Material extends Model<
  InferAttributes<Material>,
  InferCreationAttributes<Material>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare unit: string;
  declare category: CreationOptional<string | null>;
  declare description: CreationOptional<string | null>;
  declare active: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Material.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    unit: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'materials' }
);

/* --------------------------------------------------------- MaterialPrice --- */

export class MaterialPrice extends Model<
  InferAttributes<MaterialPrice>,
  InferCreationAttributes<MaterialPrice>
> {
  declare id: CreationOptional<string>;
  declare materialId: ForeignKey<Material['id']>;
  declare providerId: ForeignKey<Provider['id']>;
  declare price: number;
  declare currency: CreationOptional<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  /** `DECIMAL` de Sequelize se serializa como string; lo pasamos a número. */
  toJSON(): Record<string, unknown> {
    const raw = super.toJSON() as Record<string, unknown>;
    return { ...raw, price: raw.price == null ? null : Number(raw.price) };
  }
}

MaterialPrice.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    materialId: { type: DataTypes.UUID, allowNull: false },
    providerId: { type: DataTypes.UUID, allowNull: false },
    price: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
    currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'COP' },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'material_prices',
    // Un solo precio por (material, proveedor): permite `upsert`.
    indexes: [{ unique: true, fields: ['material_id', 'provider_id'] }],
  }
);

/* --------------------------------------------------------------- Project --- */

export type ProjectStatus = 'planning' | 'in-progress' | 'finished';

export class Project extends Model<
  InferAttributes<Project>,
  InferCreationAttributes<Project>
> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User['id']>;
  declare name: string;
  declare description: CreationOptional<string | null>;
  declare location: CreationOptional<string | null>;
  declare budget: CreationOptional<number | null>;
  declare status: CreationOptional<ProjectStatus>;
  /** `DATEONLY`: fecha de calendario como texto `YYYY-MM-DD`, sin hora ni zona. */
  declare startDate: CreationOptional<string | null>;
  declare endDate: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  /** `DECIMAL` de Sequelize se serializa como string; lo pasamos a número. */
  toJSON(): Record<string, unknown> {
    const raw = super.toJSON() as Record<string, unknown>;
    return { ...raw, budget: raw.budget == null ? null : Number(raw.budget) };
  }
}

Project.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    location: { type: DataTypes.STRING, allowNull: true },
    budget: { type: DataTypes.DECIMAL(16, 2), allowNull: true },
    status: {
      type: DataTypes.ENUM('planning', 'in-progress', 'finished'),
      allowNull: false,
      defaultValue: 'planning',
    },
    startDate: { type: DataTypes.DATEONLY, allowNull: true },
    endDate: { type: DataTypes.DATEONLY, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'projects' }
);

/* --------------------------------------------------- ProjectCalculation --- */

export class ProjectCalculation extends Model<
  InferAttributes<ProjectCalculation>,
  InferCreationAttributes<ProjectCalculation>
> {
  declare id: CreationOptional<string>;
  declare projectId: ForeignKey<Project['id']>;
  declare calculatorType: string;
  declare inputs: CreationOptional<Record<string, unknown>>;
  declare result: CreationOptional<Record<string, unknown>>;
  declare quantity: CreationOptional<number | null>;
  declare unit: CreationOptional<string | null>;
  declare totalCost: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  toJSON(): Record<string, unknown> {
    const raw = super.toJSON() as Record<string, unknown>;
    return { ...raw, totalCost: Number(raw.totalCost) };
  }
}

ProjectCalculation.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    projectId: { type: DataTypes.UUID, allowNull: false },
    calculatorType: { type: DataTypes.STRING, allowNull: false },
    inputs: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
    result: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
    quantity: { type: DataTypes.FLOAT, allowNull: true },
    unit: { type: DataTypes.STRING, allowNull: true },
    totalCost: { type: DataTypes.DECIMAL(16, 2), allowNull: false, defaultValue: 0 },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'project_calculations' }
);

/* -------------------------------------------------------- CalculatorType --- */

export class CalculatorType extends Model<
  InferAttributes<CalculatorType>,
  InferCreationAttributes<CalculatorType>
> {
  declare id: string;
  declare name: string;
  declare description: CreationOptional<string | null>;
  declare fields: CreationOptional<unknown[]>;
  declare formula: CreationOptional<string | null>;
  declare active: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

CalculatorType.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    fields: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    formula: { type: DataTypes.TEXT, allowNull: true },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'calculator_types' }
);

/* ---------------------------------------------------------- RefreshToken --- */

/**
 * Token de refresco con rotación y detección de reúso.
 * - `tokenHash`: SHA-256 del token opaco (nunca se guarda el valor en claro).
 * - `family`: agrupa una cadena de rotación; si se reutiliza un token ya
 *   revocado se revoca la familia entera (posible robo).
 */
export class RefreshToken extends Model<
  InferAttributes<RefreshToken>,
  InferCreationAttributes<RefreshToken>
> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User['id']>;
  declare tokenHash: string;
  declare family: string;
  declare expiresAt: Date;
  declare revokedAt: CreationOptional<Date | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  get isActive(): NonAttribute<boolean> {
    return this.revokedAt === null && this.expiresAt.getTime() > Date.now();
  }
}

RefreshToken.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    tokenHash: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    family: { type: DataTypes.UUID, allowNull: false },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    revokedAt: { type: DataTypes.DATE, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'refresh_tokens', indexes: [{ fields: ['family'] }] }
);

/* ---------------------------------------------------- PasswordResetToken --- */

/**
 * Token de recuperación de contraseña. De un solo uso (`usedAt`) y con
 * expiración (`expiresAt`). En BD solo se guarda el SHA-256 del valor.
 */
export class PasswordResetToken extends Model<
  InferAttributes<PasswordResetToken>,
  InferCreationAttributes<PasswordResetToken>
> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User['id']>;
  declare tokenHash: string;
  declare expiresAt: Date;
  declare usedAt: CreationOptional<Date | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

PasswordResetToken.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    tokenHash: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    usedAt: { type: DataTypes.DATE, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'password_reset_tokens' }
);

/* --------------------------------------------------------- Asociaciones --- */

User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens', onDelete: 'CASCADE' });
RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(PasswordResetToken, {
  foreignKey: 'userId',
  as: 'passwordResetTokens',
  onDelete: 'CASCADE',
});
PasswordResetToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Project, { foreignKey: 'userId', as: 'projects', onDelete: 'CASCADE' });
Project.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Project.hasMany(ProjectCalculation, {
  foreignKey: 'projectId',
  as: 'calculations',
  onDelete: 'CASCADE',
});
ProjectCalculation.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

Material.hasMany(MaterialPrice, { foreignKey: 'materialId', as: 'prices', onDelete: 'CASCADE' });
MaterialPrice.belongsTo(Material, { foreignKey: 'materialId', as: 'material' });

Provider.hasMany(MaterialPrice, { foreignKey: 'providerId', as: 'prices', onDelete: 'CASCADE' });
MaterialPrice.belongsTo(Provider, { foreignKey: 'providerId', as: 'provider' });

export const models = {
  User,
  RefreshToken,
  PasswordResetToken,
  Provider,
  Material,
  MaterialPrice,
  Project,
  ProjectCalculation,
  CalculatorType,
};

export { sequelize };
