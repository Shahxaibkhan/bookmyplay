import { defineConfig, configDefaults } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup/vitest.setup.ts'],
    exclude: [...configDefaults.exclude, 'playwright/**'],
    coverage: {
      reporter: ['text', 'lcov'],
    },
  },
});
