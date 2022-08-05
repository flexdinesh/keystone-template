import { list } from "@keystone-6/core";
import {
  checkbox,
  relationship,
  text,
  timestamp
} from "@keystone-6/core/fields";
import { select } from "@keystone-6/core/fields";

export const lists = {
  Task: list({
    fields: {
      label: text({ validation: { isRequired: true } }),
      priority: select({
        type: "enum",
        options: [
          { label: "Low", value: "low" },
          { label: "Medium", value: "medium" },
          { label: "High", value: "high" }
        ]
      }),
      isComplete: checkbox(),
      assignedTo: relationship({ ref: "User.tasks", many: false }),
      finishBy: timestamp()
    }
  }),
  User: list({
    fields: {
      email: text({ validation: { isRequired: true }, isIndexed: "unique" }),
      name: text({ validation: { isRequired: true } }),
      tasks: relationship({ ref: "Task.assignedTo", many: true })
    }
  })
};
