// V2 entry for isyte-ops (logic lives in isyte-ops.cjs, shared with the V1 rollback runtime).
import { createV2Plugin } from "../lib/v2-plugin-adapter.mjs";
import factory from "../lib/isyte-ops.cjs";

export default createV2Plugin({ id: "isyte-ops", factory });
