import { createAuth } from "@keystone-6/auth";
import { statelessSessions } from "@keystone-6/core/session";

const { withAuth } = createAuth({
  listKey: "User",
  identityField: "email",
  secretField: "password",
  // Populate session.data based on the authed user
  sessionData: "name",
  initFirstItem: {
    fields: ["email", "name", "password"],
  },
});

let sessionSecret = "-- DEV COOKIE SECRET; CHANGE ME --";
let sessionMaxAge = 60 * 60 * 24 * 30; // 30 days

const session = statelessSessions({
  maxAge: sessionMaxAge,
  secret: sessionSecret,
});

export { withAuth, session };
