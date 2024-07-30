import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config({ path: ".dev.vars" });

export default defineConfig({
  dialect: "sqlite",
  schema: "./app/drizzle/schema.ts",
  out: "./drizzle",
  driver: "d1-http",
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_D1_DB_ID!,
    token: process.env.CLOUDFLARE_D1_API_TOKEN!,
  },
});
