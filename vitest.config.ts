import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// Scoped to pure lib/ functions for now -- no DB, no Next.js runtime, no
// jsdom. Testing API routes or React components would need a real test
// database and a bigger investment; this is the first, cheap layer, not
// the whole pyramid.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**"]
  }
});
