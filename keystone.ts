import { config } from "@keystone-6/core";
import { lists } from "./schema";
import { seedDatabase } from "./seed";
import { Context } from ".keystone/types";

export default config({
  db: {
    provider: "sqlite",
    url: process.env.DATABASE_URL || "file:./keystone-example.db",
    async onConnect(context: Context) {
      if (process.argv.includes("--seed-data")) {
        await seedDatabase(context);
      }
    }
  },
  lists
});
