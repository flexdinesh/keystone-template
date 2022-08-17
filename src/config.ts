import type { KeystoneConfig, BaseKeystoneTypeInfo } from "@keystone-6/core/types";
import { session } from "./auth";
import { lists } from "./schema";

import { seedDatabase } from "./seed";
import { Context, TypeInfo } from ".keystone/types";

const db: KeystoneConfig<TypeInfo>["db"] = {
  provider: "sqlite",
  // we can skip migration in dev environments
  useMigrations: process.argv.includes("--skip-migrations") ? false : true,
  url: process.env.DATABASE_URL || "file:./database.db",
  async onConnect(context: Context) {
    if (process.argv.includes("--seed-database")) {
      await seedDatabase(context);
    }
  },
};

const ui: KeystoneConfig<TypeInfo>["ui"] = {
  isAccessAllowed: (context) => !!context.session?.data,
};

export { db, lists, session, ui };
