import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const columns = {
  source_url: { type: DataTypes.TEXT, allowNull: true },
  source_product: { type: DataTypes.STRING, allowNull: true },
  source_notes: { type: DataTypes.TEXT, allowNull: true },
  checked_at: { type: DataTypes.DATE, allowNull: true },
};

/** También se puede ejecutar después de sync() en una instalación nueva. */
export async function up(): Promise<void> {
  const query = sequelize.getQueryInterface();
  const existing = await query.describeTable('material_prices');
  await sequelize.transaction(async (transaction) => {
    for (const [name, definition] of Object.entries(columns)) {
      if (!existing[name]) await query.addColumn('material_prices', name, definition, { transaction });
    }
  });
}

export async function down(): Promise<void> {
  const query = sequelize.getQueryInterface();
  const existing = await query.describeTable('material_prices');
  for (const name of Object.keys(columns).reverse()) {
    if (existing[name]) await query.removeColumn('material_prices', name);
  }
}
