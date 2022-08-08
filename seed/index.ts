import fs from "fs";
import path from "path";
import { Context } from ".keystone/types";

const seedUsers = async (context: Context) => {
  const { query } = context.sudo();
  const rawJSONData = fs.readFileSync(
    path.join(process.cwd(), "seed", "./users.json"),
    "utf-8"
  );
  const seedUsers = JSON.parse(rawJSONData);

  for await (const user of seedUsers) {
    try {
      const queriedUser = await query.User.findOne({
        where: {
          email: user.email,
        },
      });

      if (!queriedUser) {
        await query.User.createOne({
          data: {
            email: user.email,
            name: user.name,
          },
        });
      }
    } catch (e) {
      console.error("Seeding user failed: ", {
        user: user,
        message: (e as Error).message,
      });
    }
  }
};

// seed tasks and connect with users
const seedTasks = async (context: Context) => {
  const { query } = context.sudo();
  const rawJSONData = fs.readFileSync(
    path.join(process.cwd(), "seed", "./tasks.json"),
    "utf-8"
  );
  const seedTasks = JSON.parse(rawJSONData);

  for await (const task of seedTasks) {
    try {
      const queriedTasks = await query.Task.findMany({
        where: {
          AND: [
            { label: { equals: task.label } },
            { finishBy: { equals: task.finishBy } },
          ],
        },
      });

      if (!queriedTasks.length) {
        await query.Task.createOne({
          data: {
            label: task.label,
            isComplete: task.isComplete,
            finishBy: task.finishBy,
            priority: task.priority,
            ...(task.assignedTo?.connect?.email && {
              assignedTo: {
                connect: {
                  email: task.assignedTo.connect.email,
                },
              },
            }),
          },
        });
      }
    } catch (e) {
      console.error("Seeding task failed: ", {
        task: task,
        message: (e as Error).message,
      });
    }
  }
};

export const seedDatabase = async (context: Context) => {
  console.log(`🌱 Seeding database...`);
  await seedUsers(context);
  await seedTasks(context);
  console.log(`🌱 Seeding database completed.`);
};
