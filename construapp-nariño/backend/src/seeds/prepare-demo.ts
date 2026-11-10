import 'dotenv/config';
import { connectDatabase, sequelize } from '../config/database.js';
import { up as initialSchema } from '../migrations/0001-initial.migration.js';
import { up as priceSources } from '../migrations/0002-price-sources.migration.js';
import { seed as catalog } from './0001-catalogo-narino.seed.js';
import { ensureDemoUser } from './0002-cuentas-iniciales.seed.js';
import { Project, ProjectCalculation, User } from '../models/index.js';
import { calculatorService, type CalculatorId } from '../services/calculatorService.js';

const projectId = 'fb169589-f7eb-4df2-8ba0-b83fca982d4b';
try {
  if (process.env.NODE_ENV === 'production' && process.env.DEMO_MODE !== 'true')
    throw new Error('La demostración pública requiere DEMO_MODE=true explícitamente.');
  if (!(await connectDatabase())) throw new Error('No se pudo conectar a la base de datos.');
  await initialSchema();
  await priceSources();
  await catalog();
  await ensureDemoUser();
  const user = await User.findOne({ where: { email: 'demo@construapp.co' } });
  if (!user) throw new Error('No se encontró la cuenta de demostración.');
  const existing = await Project.findByPk(projectId);
  if (existing && existing.userId !== user.id)
    throw new Error('La referencia de la demo está ocupada por otra cuenta.');
  if (!existing) {
    const examples: { calculatorType: CalculatorId; inputs: Record<string, number | string> }[] = [
      {
        calculatorType: 'paint',
        inputs: { area: 40, coats: 2, paintType: 'vinilo1', wastePct: 5 },
      },
      { calculatorType: 'tile', inputs: { area: 20, tileType: 'ceramica', wastePct: 5 } },
      {
        calculatorType: 'brick',
        inputs: { width: 4, height: 2.4, brickUnit: 'tolete', wastePct: 5 },
      },
    ];
    const calculations: Array<{
      calculatorType: CalculatorId;
      inputs: Record<string, number | string>;
      result: Awaited<ReturnType<typeof calculatorService.run>>;
    }> = [];
    for (const example of examples)
      calculations.push({
        ...example,
        result: await calculatorService.run(example.calculatorType, example.inputs),
      });
    await sequelize.transaction(async (transaction) => {
      await Project.create(
        {
          id: projectId,
          userId: user.id,
          name: 'Remodelación de habitación en Pasto · Demo',
          location: 'Pasto, Nariño',
          budget: 3_000_000,
          status: 'in-progress',
          description:
            'Proyecto de demostración académica. Piso de 20 m², pintura de 40 m² a dos manos y muro de 4 × 2,4 m. Incluye un 5 % de desperdicio; no incluye mano de obra.',
        },
        { transaction }
      );
      for (const calculation of calculations) {
        await ProjectCalculation.create(
          {
            projectId,
            calculatorType: calculation.calculatorType,
            inputs: calculation.inputs,
            result: calculation.result as unknown as Record<string, unknown>,
            quantity: calculation.result.quantity,
            unit: calculation.result.unit,
            totalCost: calculation.result.totalCost,
          },
          { transaction }
        );
      }
    });
    console.log('Proyecto de demostración creado con tres cálculos.');
  } else console.log('La obra de demostración ya existe; se conservan tus cambios.');
  console.log(`Proyecto: /projects/${projectId}`);
} catch (error) {
  console.error('No se pudo preparar la demo:', (error as Error).message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
