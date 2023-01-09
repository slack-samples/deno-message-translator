import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import {
  findTriggerToUpdate,
  joinAllChannels,
} from "./internals/trigger_operations.ts";
import { isDebugMode } from "./internals/debug_mode.ts";

export const def = DefineFunction({
  callback_id: "maintain-membership",
  title: "Maintain channel memberships for a trigger",
  source_file: "functions/maintain_membership.ts",
  input_parameters: {
    properties: {
      reacjilatorWorkflowCallbackId: { type: Schema.types.string },
    },
    required: ["reacjilatorWorkflowCallbackId"],
  },
  output_parameters: {
    properties: {},
    required: [],
  },
});

export default SlackFunction(def, async ({ inputs, client, env }) => {
  const debugMode = isDebugMode(env);
  const targetTrigger = await findTriggerToUpdate(
    client,
    inputs.reacjilatorWorkflowCallbackId,
    debugMode,
  );
  if (
    targetTrigger === undefined ||
    targetTrigger.channel_ids === undefined
  ) {
    // The "reaction_added" event trigger does not exist yet
    return { outputs: {} };
  }

  // This app's bot user joins all the channels
  // to perform API calls for the channels
  const error = await joinAllChannels(
    client,
    targetTrigger.channel_ids,
    debugMode,
  );
  if (error) {
    const errorMessage =
      `Maintenance job failed! An error occurred when joining any of the channels (${targetTrigger.channel_ids}) due to ${error}.`;
    return { error: errorMessage };
  } else {
    return { outputs: {} };
  }
});
