import { Project, ProjectCalculation } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { round } from '../utils/dosifications.js';
import { calculatorService, type CalculatorId } from './calculatorService.js';

interface AuthUser {
  id: string;
  role: string;
}

interface CreateInput {
  name: string;
  description?: string | null;
  location?: string | null;
  budget?: number | null;
  /** Fechas de calendario `YYYY-MM-DD` (ver `calendarDate` en projectSchemas). */
  startDate?: string | null;
  endDate?: string | null;
}

/** Presupuesto acumulado del proyecto frente al objetivo (HU-03.5). */
export interface BudgetSummary {
  totalCalculations: number;
  totalCost: number;
  budget: number | null;
  budgetUsedPct: number | null;
  budgetRemaining: number | null;
  overBudget: boolean;
}

function summaryFor(project: Project, calcs: Pick<ProjectCalculation, 'totalCost'>[]): BudgetSummary {
  const totalCost = round(calcs.reduce((s, c) => s + Number(c.totalCost), 0));
  const budget = project.budget == null ? null : Number(project.budget);
  return {
    totalCalculations: calcs.length,
    totalCost,
    budget,
    budgetUsedPct: budget && budget > 0 ? round((totalCost / budget) * 100, 1) : null,
    budgetRemaining: budget == null ? null : round(budget - totalCost),
    overBudget: budget != null && totalCost > budget,
  };
}

/** Devuelve el proyecto si el usuario puede verlo; si no, lanza 404/403. */
async function loadOwned(user: AuthUser, projectId: string): Promise<Project> {
  const project = await Project.findByPk(projectId);
  if (!project) throw ApiError.notFound('Proyecto no encontrado');
  if (project.userId !== user.id && user.role !== 'admin') {
    throw ApiError.forbidden('Este proyecto no es tuyo');
  }
  return project;
}

export const projectService = {
  async create(userId: string, data: CreateInput) {
    const project = await Project.create({
      userId,
      name: data.name,
      description: data.description ?? null,
      location: data.location ?? null,
      budget: data.budget ?? null,
      startDate: data.startDate ?? null,
      endDate: data.endDate ?? null,
    });
    return project.toJSON();
  },

  async listForUser(user: AuthUser) {
    const where = user.role === 'admin' ? {} : { userId: user.id };
    const projects = await Project.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [{ model: ProjectCalculation, as: 'calculations', attributes: ['totalCost'] }],
    });

    const list = projects.map((p) => {
      const calcs = (p.get('calculations') as ProjectCalculation[]) ?? [];
      return {
        ...p.toJSON(),
        calculations: undefined,
        summary: summaryFor(p, calcs),
      };
    });
    return { projects: list, total: list.length };
  },

  async getById(user: AuthUser, projectId: string) {
    const project = await loadOwned(user, projectId);
    const calculations = await ProjectCalculation.findAll({
      where: { projectId },
      order: [['createdAt', 'DESC']],
    });
    return {
      ...project.toJSON(),
      calculations: calculations.map((c) => c.toJSON()),
      summary: summaryFor(project, calculations),
    };
  },

  async update(user: AuthUser, projectId: string, changes: Record<string, unknown>) {
    const project = await loadOwned(user, projectId);
    project.set(changes);
    await project.save();
    return project.toJSON();
  },

  async remove(user: AuthUser, projectId: string) {
    const project = await loadOwned(user, projectId);
    await project.destroy(); // borra en cascada los cálculos
  },

  /** HU-02.8 — guarda un cálculo dentro del proyecto (recalculado en el servidor). */
  async addCalculation(
    user: AuthUser,
    projectId: string,
    body: { calculatorType: CalculatorId; inputs: unknown }
  ) {
    await loadOwned(user, projectId);
    const result = await calculatorService.run(body.calculatorType, body.inputs);

    const row = await ProjectCalculation.create({
      projectId,
      calculatorType: result.calculatorType,
      inputs: (body.inputs as Record<string, unknown>) ?? {},
      result: result as unknown as Record<string, unknown>,
      quantity: result.quantity,
      unit: result.unit,
      totalCost: result.totalCost,
    });

    return { calculation: row.toJSON(), summary: await this.summary(projectId) };
  },

  async removeCalculation(user: AuthUser, projectId: string, calculationId: string) {
    await loadOwned(user, projectId);
    const row = await ProjectCalculation.findOne({ where: { id: calculationId, projectId } });
    if (!row) throw ApiError.notFound('Cálculo no encontrado en este proyecto');
    await row.destroy();
    return { summary: await this.summary(projectId) };
  },

  async summary(projectId: string): Promise<BudgetSummary> {
    const project = await Project.findByPk(projectId);
    if (!project) throw ApiError.notFound('Proyecto no encontrado');
    const calcs = await ProjectCalculation.findAll({
      where: { projectId },
      attributes: ['totalCost'],
    });
    return summaryFor(project, calcs);
  },
};

export default projectService;
