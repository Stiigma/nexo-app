// V2 entry for nexo-productivity (logic lives in nexo-productivity.cjs, shared with the V1 rollback runtime).
import { createV2Plugin } from "../lib/v2-plugin-adapter.mjs";
import factory from "../lib/nexo-productivity.cjs";

export default createV2Plugin({ id: "nexo-productivity", factory });
