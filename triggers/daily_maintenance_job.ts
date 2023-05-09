import { Trigger } from "deno-slack-sdk/types.ts";
import { TriggerTypes } from "deno-slack-api/mod.ts";
import workflowDef from "../workflows/maintenance_job.ts";

/**
 * A trigger that periodically starts the "maintenance-job" workflow.
 */
const trigger: Trigger<typeof workflowDef.definition> = {
  type: TriggerTypes.Scheduled,
  name: "Trigger a scheduled maintenance job",
  workflow: `#/workflows/${workflowDef.definition.callback_id}`,
  inputs: {},
  schedule: {
    // This is a simple example that sets 60 seconds later
    start_time: new Date(new Date().getTime() + 60000).toISOString(),
    end_time: "2037-12-31T23:59:59Z",
    frequency: { type: "daily", repeats_every: 1 },
  },
};

export default trigger;
