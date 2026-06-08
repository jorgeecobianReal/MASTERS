import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    // Entorno mínimo para que la validación de env no falle en los tests.
    // (Los tests de integración solo ejercitan rutas que NO tocan la BD.)
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test?schema=public',
      AI_ENABLED: 'false',
      LOG_LEVEL: 'error',
    },
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      include: ['src/services/**', 'src/utils/**'],
    },
  },
});
