import { Trigger } from "deno-slack-sdk/types.ts";
import workflowDef from "../workflows/reacjilator.ts";

/**
 * This is a sample trigger demonstrating how to configure the "reaction_added" event trigger.
 * This trigger works without any issues! but trigger.event.channel_ids needs to be hard-coded.
 * Thus, using the configurator workflow should be more convenient for most use cases.
 */
const trigger: Trigger<typeof workflowDef.definition> = {
  type: "event",
  name: "Reaction added event trigger",
  description: "A trigger to start a new workflow",
  workflow: `#/workflows/${workflowDef.definition.callback_id}`,
  event: {
    event_type: "slack#/events/reaction_added",
    // TODO: Listing all the channels to enable here is required
    channel_ids: ["CLT1F93TP"],
  },
  inputs: {
    channelId: { value: "{{data.channel_id}}" },
    messageTs: { value: "{{data.message_ts}}" },
    reaction: { value: "{{data.reaction}}" },
  },
};

export default trigger;
