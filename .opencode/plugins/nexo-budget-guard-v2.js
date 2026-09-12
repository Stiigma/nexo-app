// V2 entry for nexo-budget-guard (logic lives in nexo-budget-guard.cjs, shared with the V1 rollback runtime).
import { createV2Plugin } from "../lib/v2-plugin-adapter.mjs";
import factory from "../lib/nexo-budget-guard.cjs";

export default createV2Plugin({ id: "nexo-budget-guard", factory });
