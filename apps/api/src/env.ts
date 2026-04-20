import { type ZodError, z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z
    .literal(["production", "development", "test"])
    .default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string(),
});

export type Env = z.infer<typeof EnvSchema>;

let env: Env;
try {
  env = EnvSchema.parse(process.env);
} catch (error) {
  const zodError = error as ZodError;
  console.error(
    "Environment variable validation error:",
    z.flattenError(zodError).fieldErrors,
  );

  process.exit(1);
}

export default env;
