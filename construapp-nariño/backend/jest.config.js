/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  setupFiles: ['<rootDir>/jest.setup.ts'],
  // ts-jest transpila los .ts (incluido import/export) a CommonJS para el
  // runtime de Jest, así no hace falta el flag --experimental-vm-modules.
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'CommonJS',
          moduleResolution: 'node',
          verbatimModuleSyntax: false,
          isolatedModules: true,
        },
      },
    ],
  },
  // Permite importar módulos ESM con extensión .js explícita desde código TS.
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  // El arranque de cada suite carga migración + seed + grafo de módulos.
  testTimeout: 30000,
  passWithNoTests: true,
};
