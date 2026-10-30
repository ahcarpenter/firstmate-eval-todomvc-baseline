import { defineConfig } from "@playwright/test";

// The grader never starts the app itself: grade.sh builds the exported run,
// starts it, and passes its URL in GRADE_BASE_URL.
export default defineConfig({
  testDir: ".",
  testMatch: (process.env.GRADE_SPECS ?? "regression.spec.ts").split(","),
  outputDir: process.env.GRADE_OUT ? `${process.env.GRADE_OUT}/artifacts` : "test-results",
  retries: 1,
  workers: 4,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [["json", { outputFile: `${process.env.GRADE_OUT ?? "."}/results.json` }], ["line"]],
  use: { baseURL: process.env.GRADE_BASE_URL ?? "http://localhost:3100" },
});
