import { api } from './api';
import type { CalculationResult, CalculatorId } from './calculators';

export type ProjectStatus = 'planning' | 'in-progress' | 'finished';

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  location: string | null;
  budget: number | null;
  status: ProjectStatus;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetSummary {
  totalCalculations: number;
  totalCost: number;
  budget: number | null;
  budgetUsedPct: number | null;
  budgetRemaining: number | null;
  overBudget: boolean;
}

export interface ProjectCalculation {
  id: string;
  projectId: string;
  calculatorType: CalculatorId;
  inputs: Record<string, unknown>;
  result: CalculationResult;
  quantity: number;
  unit: string;
  totalCost: number;
  createdAt: string;
}

export interface ProjectListItem extends Project {
  summary: BudgetSummary;
}

export interface ProjectDetail extends Project {
  calculations: ProjectCalculation[];
  summary: BudgetSummary;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  location?: string;
  budget?: number;
  startDate?: string;
  endDate?: string;
}

export const projectsApi = {
  async list(): Promise<{ projects: ProjectListItem[]; total: number }> {
    const { data } = await api.get('/projects');
    return data;
  },
  async get(id: string): Promise<ProjectDetail> {
    const { data } = await api.get(`/projects/${id}`);
    return data;
  },
  async create(input: CreateProjectInput): Promise<Project> {
    const { data } = await api.post('/projects', input);
    return data;
  },
  async update(id: string, changes: Partial<CreateProjectInput & { status: ProjectStatus }>): Promise<Project> {
    const { data } = await api.patch(`/projects/${id}`, changes);
    return data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },
  async addCalculation(
    projectId: string,
    calculatorType: CalculatorId,
    inputs: Record<string, unknown>
  ): Promise<{ calculation: ProjectCalculation; summary: BudgetSummary }> {
    const { data } = await api.post(`/projects/${projectId}/calculations`, {
      calculatorType,
      inputs,
    });
    return data;
  },
  async removeCalculation(
    projectId: string,
    calculationId: string
  ): Promise<{ summary: BudgetSummary }> {
    const { data } = await api.delete(`/projects/${projectId}/calculations/${calculationId}`);
    return data;
  },
};

export default projectsApi;
