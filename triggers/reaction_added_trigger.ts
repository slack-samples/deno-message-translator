import { Trigger } from "deno-slack-sdk/types.ts";
import {
  TriggerContextData,
  TriggerEventTypes,
  TriggerTypes,
} from "deno-slack-api/mod.ts";
import workflowDef from "../workflows/reacjilator.ts";

/**
 * This is a sample trigger demonstrating how to configure the "reaction_added" event trigger.
 */
const trigger: Trigger<typeof workflowDef.definition> = {
  type: TriggerTypes.Event,
  name: "Reaction added event trigger",
  description: "A trigger to start a new workflow",
  workflow: `#/workflows/${workflowDef.definition.callback_id}`,
  event: {
    event_type: TriggerEventTypes.ReactionAdded,
    all_resources: true,
  },
  inputs: {
    channelId: { value: TriggerContextData.Event.ReactionAdded.channel_id },
    messageTs: { value: TriggerContextData.Event.ReactionAdded.message_ts },
    reaction: { value: TriggerContextData.Event.ReactionAdded.reaction },
  },
};

export default trigger;
