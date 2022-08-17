import { config } from "@keystone-6/core";
import type {
  KeystoneConfig,
  BaseKeystoneTypeInfo,
} from "@keystone-6/core/types";
import { db, lists, session, ui } from "./src/config";
import { withAuth } from "./src/auth";

// For no authentication, use the config below
// export default config({
//   db,
//   lists,
// });

export default withAuth(
  config({
    db,
    lists,
    session,
    ui,
  }) as KeystoneConfig<BaseKeystoneTypeInfo>
);
