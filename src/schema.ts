import { list } from "@keystone-6/core";
import {
  checkbox,
  password,
  relationship,
  text,
  timestamp,
} from "@keystone-6/core/fields";
import { select } from "@keystone-6/core/fields";
import type {
  KeystoneConfig,
} from "@keystone-6/core/types";
import { TypeInfo } from ".keystone/types";

export const lists: KeystoneConfig<TypeInfo>["lists"] = {
  Task: list({
    fields: {
      label: text({ validation: { isRequired: true } }),
      priority: select({
        type: "enum",
        options: [
          { label: "Low", value: "low" },
          { label: "Medium", value: "medium" },
          { label: "High", value: "high" },
        ],
      }),
      isComplete: checkbox(),
      assignedTo: relationship({ ref: "User.tasks", many: false }),
      finishBy: timestamp(),
    },
  }),
  User: list({
    fields: {
      email: text({ validation: { isRequired: true }, isIndexed: "unique" }),
      name: text({ validation: { isRequired: true } }),
      password: password(),
      tasks: relationship({ ref: "Task.assignedTo", many: true }),
    },
  }),
};
